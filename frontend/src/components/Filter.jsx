import { useState } from "react";
import Modal from "./Modal.jsx";
import { TAG_GROUPS, GROUP_LABELS, emptyFilters } from "../lib/tags.js";
export default function Filter({ filters, onConfirm, onClose }) {
  const [draft, setDraft] = useState(() => structuredClone(filters));
  function toggle(group, tag) {
    setDraft((current) => ({
      ...current,
      [group]: current[group].includes(tag)
        ? current[group].filter((value) => value !== tag)
        : [...current[group], tag],
    }));
  }
  return (
    <Modal title="Filters" onClose={onClose} className="filter-window">
      <div className="filter-body">
        {Object.entries(TAG_GROUPS).map(([group, tags]) => (
          <fieldset key={group}>
            <legend>{GROUP_LABELS[group]}</legend>
            <div className="filter-options">
              {tags.map((tag) => (
                <label key={tag}>
                  <input
                    type="checkbox"
                    checked={draft[group].includes(tag)}
                    onChange={() => toggle(group, tag)}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <footer className="window-footer">
        <button
          className="text-button"
          onClick={() => setDraft(emptyFilters())}
        >
          Clear all
        </button>
        <button className="primary-button" onClick={() => onConfirm(draft)}>
          Confirm
        </button>
      </footer>
    </Modal>
  );
}
