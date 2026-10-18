import Wordmark from "../components/Wordmark.jsx";
export default function LandingPage({ onLogin, onSignUp }) {
  return (
    <main className="landing-screen" id="main-content" tabIndex={-1}>
      <div className="landing-corner landing-corner-top" aria-hidden="true" />
      <div
        className="landing-corner landing-corner-bottom"
        aria-hidden="true"
      />
      <div className="landing-content">
        <h1>
          <Wordmark className="landing-wordmark" />
        </h1>
        <p className="landing-tagline pixel">
          make your dream team
          <br />a reality
        </p>
        <div className="landing-actions">
          <button className="landing-button landing-login" onClick={onLogin}>
            Login
          </button>
          <button className="landing-button landing-signup" onClick={onSignUp}>
            Sign Up!
          </button>
        </div>
      </div>
    </main>
  );
}
