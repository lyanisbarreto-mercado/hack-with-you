import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../src/index.css";
import HomePage from "../src/pages/HomePage.jsx";
import User from "../src/pages/User.jsx";
import NavBar from "../src/components/NavBar.jsx";
import NotesPopup from "../src/components/NotesPopup.jsx";
import EditProfile from "../src/components/EditProfile.jsx";
import LandingPage from "../src/pages/LandingPage.jsx";
import SignInPage from "../src/pages/SignInPage.jsx";

const members = Array.from({ length: 12 }, (_, index) => ({
  _id: String(index),
  username: `member_${index}`,
  displayName: ["Taylor Smith", "Alex Johnson", "Samantha Lee"][index % 3],
  experience: ["Beginner", "Intermediate", "Advanced"][index % 3],
  technology: [
    ["HTML", "CSS", "React"],
    ["Python", "Java"],
    ["React Native", "SQL"],
  ][index % 3],
  industry: [["Web Development"], ["Cyber Security"], ["Computer Science"]][
    index % 3
  ],
  commitment: [index % 2 ? "Competitive" : "Casual"],
}));
function previewPage() {
  const hash = window.location.hash.replace(/^#\//, "");
  if (hash === "sign-in" || hash === "signup") return "signin";
  return ["landing", "home", "user", "me"].includes(hash)
    ? hash
    : document.body.dataset.page || "home";
}
function Preview() {
  const [page, updatePage] = useState(previewPage),
    [profile, setProfile] = useState(members[0]),
    [notes, setNotes] = useState(false),
    [content, setContent] = useState(""),
    [edit, setEdit] = useState(false);
  useEffect(() => {
    const changed = () => {
      updatePage(previewPage());
      setNotes(false);
      setEdit(false);
    };
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  const setPage = (next) => {
    window.location.hash = next === "signin" ? "/sign-in" : `/${next}`;
  };
  return (
    <>
      <nav className="preview-nav" aria-label="Preview screens">
        <span>Preview</span>
        <a href="landing.html">Landing</a>
        <a href="sign-in.html">Sign in</a>
        <a href="visual.html">Home</a>
        <a href="#/me">My profile</a>
      </nav>
      {page === "landing" ? (
        <LandingPage
          onLogin={() => setPage("signin")}
          onSignUp={() => setPage("signin")}
        />
      ) : page === "signin" ? (
        <SignInPage
          onContinue={() => setPage("home")}
          onBack={() => setPage("landing")}
        />
      ) : (
        <div className="app-shell">
          <div className="app-notice" role="status">
            Component preview · sample data · changes are not saved
          </div>
          <NavBar
            page={page}
            isAuthenticated
            onHome={() => setPage("home")}
            onProfile={() => {
              setProfile(members[0]);
              setPage("me");
            }}
            onLogout={() => setPage("landing")}
          />
          <header className="topbar">
            <span className="wordmark">
              <span>〈</span>“hackWithYou”<span>〉</span>
            </span>
          </header>
          {page === "home" ? (
            <HomePage
              members={members}
              loading={false}
              error=""
              onOpen={(username) => {
                setProfile(
                  members.find((member) => member.username === username),
                );
                setPage("user");
              }}
              onNotes={() => setNotes(true)}
            />
          ) : (
            <User
              profile={profile}
              own={page === "me"}
              onBack={() => setPage("home")}
              onNotes={() => setNotes(true)}
              onEdit={() => setEdit(true)}
            />
          )}
          {notes && (
            <NotesPopup
              content={content}
              onChange={setContent}
              loaded
              loading={false}
              saving={false}
              onSave={() => {}}
              status="Layout preview; not saved"
              onClose={() => setNotes(false)}
            />
          )}
          {edit && (
            <EditProfile
              profile={profile}
              onClose={() => setEdit(false)}
              onSave={async (changes) => {
                setProfile({ ...profile, ...changes });
                setEdit(false);
              }}
            />
          )}
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<Preview />);
