import { useState } from "react";
import Modal from "./Modal.jsx";
import { TAG_GROUPS, GROUP_LABELS } from "../lib/tags.js";
export default function EditProfile({ profile, onSave, onClose }) {
  const [draft, setDraft] = useState(() => ({
    username: profile.username || "",
    displayName: profile.displayName || "",
    bio: profile.bio || "",
    avatarUrl: profile.avatarUrl || "",
    ...Object.fromEntries(
      Object.keys(TAG_GROUPS).map((group) => [group, profile[group] || []]),
    ),
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({
        ...draft,
        username: draft.username.trim().toLowerCase(),
        displayName: draft.displayName.trim(),
        avatarUrl: draft.avatarUrl.trim(),
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }
  return (
    <Modal
      title="Edit profile"
      onClose={() => {
        if (!saving) onClose();
      }}
      className="edit-window"
    >
      <form onSubmit={submit}>
        <div className="filter-body profile-edit">
          <label>
            Username
            <input
              value={draft.username}
              onChange={(event) =>
                setDraft({ ...draft, username: event.target.value })
              }
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_]+"
              required
              autoComplete="username"
            />
            <small>
              3–30 letters, numbers, or underscores. Publicly visible.
            </small>
          </label>
          <label>
            Display name
            <input
              value={draft.displayName}
              onChange={(event) =>
                setDraft({ ...draft, displayName: event.target.value })
              }
              maxLength={60}
              autoComplete="name"
            />
          </label>
          <label>
            Bio
            <textarea
              value={draft.bio}
              onChange={(event) =>
                setDraft({ ...draft, bio: event.target.value })
              }
              maxLength={500}
              rows={3}
            />
          </label>
          <label>
            Avatar URL
            <input
              type="url"
              placeholder="https://…"
              pattern="https?://.*"
              value={draft.avatarUrl}
              maxLength={2048}
              onChange={(event) =>
                setDraft({ ...draft, avatarUrl: event.target.value })
              }
            />
          </label>
          {Object.entries(TAG_GROUPS).map(([group, tags]) => (
            <fieldset key={group}>
              <legend>{GROUP_LABELS[group]}</legend>
              <div className="filter-options">
                {tags.map((tag) => (
                  <label className="checkbox-label" key={tag}>
                    <input
                      type="checkbox"
                      checked={draft[group].includes(tag)}
                      onChange={() =>
                        setDraft((current) => ({
                          ...current,
                          [group]: current[group].includes(tag)
                            ? current[group].filter((value) => value !== tag)
                            : [...current[group], tag],
                        }))
                      }
                    />
                    {tag}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          {error && <p role="alert">{error}</p>}
        </div>
        <footer className="window-footer">
          <button
            type="button"
            className="text-button"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="primary-button" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
