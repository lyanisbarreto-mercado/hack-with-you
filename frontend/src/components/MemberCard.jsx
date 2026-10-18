import Icon from "./Icon.jsx";
export function Avatar({ src, name, className = "" }) {
  return (
    <span className={`avatar ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name || ""}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
      <Icon name="user" size={48} />
    </span>
  );
}
export default function MemberCard({ member, onOpen }) {
  const tags = [
    ...(member.technology || []),
    ...(member.industry || []),
    ...(member.commitment || []),
  ];
  return (
    <button
      className="member-card"
      onClick={() =>
        onOpen(member.profileKey || member.username || `~${member._id}`)
      }
      aria-label={`View ${member.displayName || member.username}'s profile`}
    >
      <Avatar src={member.avatarUrl} name={member.displayName} />
      <span className="card-name pixel">
        {member.displayName || member.username}
      </span>
      <span className="card-experience">
        {member.experience || "Experience not set"}
      </span>
      <span className="card-tags">
        {tags.slice(0, 4).map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
        {tags.length > 4 && (
          <span className="tag" aria-label={`${tags.length - 4} more tags`}>
            …
          </span>
        )}
      </span>
    </button>
  );
}
