import Wordmark from "../components/Wordmark.jsx";
export default function SignInPage({ onContinue, onBack }) {
  function submit(event) {
    event.preventDefault();
    // Visual prototype only: do not read, send, or persist form values.
    event.currentTarget.reset();
    onContinue();
  }
  return (
    <div className="signin-screen">
      <header className="signin-topbar">
        <button
          className="brand-button"
          onClick={onBack}
          aria-label="Back to landing page"
        >
          <Wordmark />
        </button>
      </header>
      <main className="signin-content" id="main-content" tabIndex={-1}>
        <h1 className="sr-only">Sign in to Hack With You</h1>
        <form
          className="signin-form"
          onSubmit={submit}
          autoComplete="off"
          noValidate
        >
          <div className="signin-card">
            <label htmlFor="signin-name">
              Name
              <input id="signin-name" type="text" autoComplete="off" />
            </label>
            <label htmlFor="signin-email">
              Email
              <input id="signin-email" type="email" autoComplete="off" />
            </label>
            <label htmlFor="signin-password">
              Password
              <input id="signin-password" type="password" autoComplete="off" />
            </label>
            <label htmlFor="signin-experience">
              Experience
              <select id="signin-experience" defaultValue="">
                <option value="" />
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>
          </div>
          <div className="signin-actions">
            <button className="signin-submit" type="submit">
              Log In
            </button>
            <button
              className="signin-signup"
              type="button"
              onClick={onContinue}
            >
              Sign Up
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
