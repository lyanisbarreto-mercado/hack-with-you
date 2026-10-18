import { useCallback, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import NavBar from "./components/NavBar.jsx";
import HomePage from "./pages/HomePage.jsx";
import User from "./pages/User.jsx";
import { apiRequest } from "./lib/api.js";
import NotesPopup from "./components/NotesPopup.jsx";
import EditProfile from "./components/EditProfile.jsx";
import useNotes from "./lib/useNotes.js";

import LandingPage from "./pages/LandingPage.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import { currentRoute } from "./lib/routes.js";

export default function App() {
  const {
    isLoading,
    isAuthenticated,
    user,
    error: authError,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();
  const [route, setRoute] = useState(() => currentRoute());
  const [members, setMembers] = useState([]);
  const [directory, setDirectory] = useState({ loading: true, error: "" });
  const [profile, setProfile] = useState(null);
  const [profileState, setProfileState] = useState({
    loading: false,
    error: "",
  });
  const [notice, setNotice] = useState("");
  const [dismissedAuthError, setDismissedAuthError] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const notes = useNotes({
    owner: isAuthenticated ? user?.sub : null,
    getAccessTokenSilently,
  });
  useEffect(() => {
    setMyProfile(null);
    setNotesOpen(false);
    setEditOpen(false);
    if (!isAuthenticated) return;
    const controller = new AbortController();
    getAccessTokenSilently()
      .then((token) =>
        apiRequest("/api/profile/me", { token, signal: controller.signal }),
      )
      .then((data) => {
        if (!controller.signal.aborted) setMyProfile(data);
      })
      .catch(() => {
        /* Profile errors are displayed on the profile page. */
      });
    return () => controller.abort();
  }, [isAuthenticated, user?.sub, getAccessTokenSilently]);
  const navigate = useCallback((username) => {
    window.location.hash = username
      ? `/users/${encodeURIComponent(username)}`
      : "/home";
  }, []);
  useEffect(() => {
    const changed = () => {
      setRoute(currentRoute());
      setEditOpen(false);
    };
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  const loadMembers = useCallback(async (signal) => {
    setDirectory({ loading: true, error: "" });
    try {
      const data = await apiRequest("/api/profile", { signal });
      setMembers(data);
      setDirectory({ loading: false, error: "" });
    } catch (err) {
      if (err.name !== "AbortError")
        setDirectory({ loading: false, error: err.message });
    }
  }, []);
  useEffect(() => {
    if (route.page !== "home") return;
    const controller = new AbortController();
    loadMembers(controller.signal);
    return () => controller.abort();
  }, [loadMembers, route.page]);
  useEffect(() => {
    if (!["me", "user"].includes(route.page) || isLoading) return;
    const controller = new AbortController();
    setProfile(null);
    setProfileState({ loading: true, error: "" });
    async function load() {
      try {
        if (route.page === "me" && !isAuthenticated) {
          setProfileState({
            loading: false,
            error: "Log in to view your profile.",
          });
          return;
        }
        const token =
          route.page === "me" ? await getAccessTokenSilently() : undefined;
        const data = await apiRequest(
          `/api/profile/${encodeURIComponent(route.username)}`,
          { token, signal: controller.signal },
        );
        if (!controller.signal.aborted) {
          setProfile(data);
          setProfileState({ loading: false, error: "" });
        }
      } catch (err) {
        if (!controller.signal.aborted)
          setProfileState({ loading: false, error: err.message });
      }
    }
    load();
    return () => controller.abort();
  }, [
    route.page,
    route.username,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
  ]);
  const login = () =>
    loginWithRedirect().catch((err) => setNotice(err.message));
  const onNotes = () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    setNotesOpen(true);
    notes.load();
  };
  const saveProfile = async (changes) => {
    const token = await getAccessTokenSilently();
    const updated = await apiRequest("/api/profile/me", {
      token,
      method: "PATCH",
      body: changes,
    });
    setMyProfile(updated);
    setProfile(updated);
    setEditOpen(false);
    navigate("me");
    loadMembers();
  };
  const own =
    route.page === "me" ||
    !!(
      profile?._id &&
      profile.source !== "people" &&
      myProfile?._id === profile._id
    );
  if (route.page === "landing") {
    return (
      <LandingPage
        onLogin={() => {
          window.location.hash = "/sign-in";
        }}
        onSignUp={() => {
          window.location.hash = "/signup";
        }}
      />
    );
  }
  if (route.page === "signin") {
    return (
      <SignInPage
        onContinue={() => navigate()}
        onBack={() => {
          window.location.hash = "/";
        }}
      />
    );
  }
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to content
      </a>
      <NavBar
        page={route.page}
        isAuthenticated={isAuthenticated}
        avatar={user?.picture}
        onHome={() => navigate()}
        onProfile={() => navigate("me")}
        onLogin={() => {
          window.location.hash = "/sign-in";
        }}
        onLogout={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
      />
      <header className="topbar">
        <a href="#/home" className="wordmark" aria-label="Hack With You home">
          <span>〈</span>“hackWithYou”<span>〉</span>
        </a>
      </header>
      {((authError && authError !== dismissedAuthError) || notice) && (
        <div className="app-notice" role="status">
          {authError !== dismissedAuthError
            ? authError?.message || notice
            : notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => {
              setNotice("");
              setDismissedAuthError(authError);
            }}
          >
            ×
          </button>
        </div>
      )}
      {route.page === "home" ? (
        <HomePage
          members={members}
          loading={directory.loading}
          error={directory.error}
          onRetry={() => loadMembers()}
          onOpen={navigate}
          onNotes={onNotes}
        />
      ) : (
        <User
          profile={profile}
          own={own}
          loading={profileState.loading}
          error={profileState.error}
          onBack={() => navigate()}
          onNotes={onNotes}
          onEdit={() => setEditOpen(true)}
        />
      )}
      {notesOpen && isAuthenticated && (
        <NotesPopup
          content={notes.content}
          onChange={notes.setContent}
          onSave={notes.save}
          loading={notes.loading}
          saving={notes.saving}
          status={notes.status}
          error={notes.error}
          loaded={notes.loaded}
          onRetry={notes.load}
          onClose={() => setNotesOpen(false)}
        />
      )}
      {editOpen && own && profile && (
        <EditProfile
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSave={saveProfile}
        />
      )}
    </div>
  );
}
