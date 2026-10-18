import Icon from "./Icon.jsx";
export default function NavBar({
  page,
  isAuthenticated,
  avatar,
  onHome,
  onProfile,
  onLogin,
  onLogout,
}) {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <button
        className={`profile-nav ${page === "me" ? "selected" : ""}`}
        aria-label={isAuthenticated ? "My profile" : "Log in"}
        onClick={isAuthenticated ? onProfile : onLogin}
      >
        {avatar ? (
          <img src={avatar} alt="" referrerPolicy="no-referrer" />
        ) : (
          <Icon name="user" size={58} />
        )}
      </button>
      <nav>
        <button
          className={`nav-link ${page === "home" ? "active" : ""}`}
          onClick={onHome}
        >
          <Icon name="home" /> <span>Home</span>
        </button>
        <button
          className="nav-link"
          disabled
          title="Events are not available yet"
        >
          <Icon name="calendar" /> <span>Events</span>
        </button>
      </nav>
      <div className="sidebar-bottom">
        <button
          className="nav-link"
          disabled
          title="Settings are not available yet"
        >
          <Icon name="settings" /> <span>Settings</span>
        </button>
        <button
          className="nav-link logout"
          onClick={isAuthenticated ? onLogout : onLogin}
        >
          <Icon name="logout" />
          <span>{isAuthenticated ? "Log Out" : "Log In"}</span>
        </button>
      </div>
    </aside>
  );
}
