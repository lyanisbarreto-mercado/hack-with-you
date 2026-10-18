import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const {
    isLoading, // Loading state, the SDK needs to reach Auth0 on load
    isAuthenticated,
    error,
    loginWithRedirect: login, // Starts the login flow
    logout: auth0Logout, // Starts the logout flow
    getAccessTokenSilently,
    user, // User profile
  } = useAuth0();

  const [profile, setProfile] = useState(null);
  const [apiError, setApiError] = useState("");
  const loadProfile = async () => {
    setApiError("");
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Profile request failed (${response.status})`);
      setProfile(await response.json());
    } catch (err) {
      setApiError(err.message);
    }
  };

  const signup = () =>
    login({ authorizationParams: { screen_hint: "signup" } });

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  if (isLoading) return "Loading...";

  return isAuthenticated ? (
    <>
      <p>Logged in as {user?.email || user?.name}</p>

      <h1>User Profile</h1>

      <pre>{JSON.stringify(user, null, 2)}</pre>

      <button onClick={loadProfile}>Load saved profile</button>
      {apiError && <p role="alert">{apiError}</p>}
      {profile && <pre>{JSON.stringify(profile, null, 2)}</pre>}
      <button onClick={logout}>Logout</button>
    </>
  ) : (
    <>
      {error && <p>Error: {error.message}</p>}

      <button onClick={signup}>Signup</button>

      <button onClick={() => login()}>Login</button>
    </>
  );
}

export default App;
