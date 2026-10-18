import Icon from "../components/Icon.jsx";
import { Avatar } from "../components/MemberCard.jsx";
const displayTags = (values) =>
  values?.length ? (
    values.map((value) => (
      <span className="outline-tag" key={value}>
        {value}
      </span>
    ))
  ) : (
    <span className="muted">Not added yet</span>
  );
function SocialLink({ url, name, icon }) {
  let safe = false;
  try {
    safe = ["https:", "http:"].includes(new URL(url).protocol);
  } catch {
    /* Missing or invalid links are not clickable. */
  }
  return safe ? (
    <a
      className="outline-tag social-link"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon name={icon} size={17} />
      {name}
    </a>
  ) : (
    <span className="outline-tag muted">
      <Icon name={icon} size={17} />
      {name}
    </span>
  );
}
export default function User({
  profile,
  own,
  loading,
  error,
  onBack,
  onNotes,
  onEdit,
}) {
  if (loading)
    return (
      <main className="main-content" id="main-content" tabIndex={-1}>
        <p role="status">Loading profile…</p>
      </main>
    );
  if (error || !profile)
    return (
      <main className="main-content" id="main-content" tabIndex={-1}>
        <button className="text-button" onClick={onBack}>
          ← Back to members
        </button>
        <div className="empty-state" role="alert">
          <h1 className="pixel">Profile unavailable</h1>
          <p>{error || "This profile could not be found."}</p>
        </div>
      </main>
    );
  return (
    <main className="main-content user-page" id="main-content" tabIndex={-1}>
      <header className="profile-heading">
        <button
          className="icon-button back-button"
          onClick={onBack}
          aria-label="Back to members"
        >
          <Icon name="back" />
        </button>
        <Avatar src={profile.avatarUrl} name={profile.displayName} />
        <div className="profile-name">
          <h1 className="pixel">
            {profile.displayName || profile.username || "Your profile"}
          </h1>
          <p className="pixel">
            {profile.experience || "Experience not set"}{" "}
            <span className="muted">{profile.pronouns}</span>
          </p>
          {profile.username && (
            <span className="muted">@{profile.username}</span>
          )}
        </div>
        <div className="profile-actions">
          <button className="text-button" onClick={onNotes}>
            <Icon name="notes" />
            Notes
          </button>
          <button
            className="outline-button"
            onClick={own ? onEdit : undefined}
            disabled={!own}
            title={!own ? "Messaging is not available yet" : undefined}
          >
            {own ? "Edit profile" : "Message"}
          </button>
        </div>
      </header>
      <div className="profile-columns">
        <div className="profile-details">
          <div className="social-links">
            <SocialLink url={profile.githubUrl} name="GitHub" icon="github" />
            <SocialLink
              url={profile.linkedinUrl}
              name="LinkedIn"
              icon="linkedin"
            />
          </div>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          <section>
            <h2>Going to:</h2>
            <div className="tag-list">
              {displayTags(profile.upcomingEvents)}
            </div>
          </section>
          <section>
            <h2>Languages & technology</h2>
            <div className="tag-list">{displayTags(profile.technology)}</div>
          </section>
          <section>
            <h2>Learning</h2>
            <div className="tag-list">{displayTags(profile.learning)}</div>
          </section>
          <section>
            <h2>Specialized Industry</h2>
            <div className="tag-list">{displayTags(profile.industry)}</div>
          </section>
          <section>
            <h2>Current Project</h2>
            {profile.currentProject?.name ? (
              <article className="project-card">
                <div className="project-placeholder">
                  <Icon name="notes" size={54} />
                </div>
                <h3 className="card-name pixel">
                  {profile.currentProject.name}
                </h3>
                <p>{profile.currentProject.description}</p>
              </article>
            ) : (
              <p className="muted">No project added yet</p>
            )}
          </section>
        </div>
        <aside className="profile-info">
          <section>
            <h2>Organizations</h2>
            <div className="tag-list">{displayTags(profile.organizations)}</div>
          </section>
          <section>
            <h2>Hackathons</h2>
            <div className="tag-list">{displayTags(profile.hackathons)}</div>
          </section>
          <section>
            <h2>Competitive or Casual Hacker?</h2>
            <div className="tag-list">{displayTags(profile.commitment)}</div>
          </section>
        </aside>
      </div>
    </main>
  );
}
