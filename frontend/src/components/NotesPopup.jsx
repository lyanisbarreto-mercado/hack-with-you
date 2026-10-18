import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon.jsx";
import { clampPosition } from "../lib/windowPosition.js";
export default function NotesPopup({
  content,
  onChange,
  onSave,
  loading,
  saving,
  status,
  error,
  loaded,
  onRetry,
  onClose,
}) {
  const windowRef = useRef(null);
  const drag = useRef(null);
  const [position, setPosition] = useState({
    x: Math.max(0, window.innerWidth - 410),
    y: Math.min(145, Math.max(0, window.innerHeight - 500)),
  });
  useEffect(() => {
    function contain() {
      const rect = windowRef.current.getBoundingClientRect();
      setPosition((current) =>
        clampPosition(
          current,
          { width: window.innerWidth, height: window.innerHeight },
          rect,
        ),
      );
    }
    contain();
    window.addEventListener("resize", contain);
    return () => window.removeEventListener("resize", contain);
  }, []);
  function onPointerDown(event) {
    if (event.button !== 0 || event.target.closest("button")) return;
    drag.current = {
      dx: event.clientX - position.x,
      dy: event.clientY - position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event) {
    if (!drag.current) return;
    const rect = windowRef.current.getBoundingClientRect();
    setPosition(
      clampPosition(
        {
          x: event.clientX - drag.current.dx,
          y: event.clientY - drag.current.dy,
        },
        { width: window.innerWidth, height: window.innerHeight },
        rect,
      ),
    );
  }
  function moveWithKeyboard(event) {
    const changes = {
      ArrowLeft: [-16, 0],
      ArrowRight: [16, 0],
      ArrowUp: [0, -16],
      ArrowDown: [0, 16],
    };
    if (event.target !== event.currentTarget || !changes[event.key]) return;
    event.preventDefault();
    const [x, y] = changes[event.key];
    const rect = windowRef.current.getBoundingClientRect();
    setPosition((current) =>
      clampPosition(
        { x: current.x + x, y: current.y + y },
        { width: window.innerWidth, height: window.innerHeight },
        rect,
      ),
    );
  }
  return createPortal(
    <section
      className="window notes-window"
      ref={windowRef}
      role="region"
      aria-label="Private notes"
      style={{ left: position.x, top: position.y }}
    >
      <header
        className="window-header drag-header"
        tabIndex={0}
        aria-label="Move notes with arrow keys or drag this header"
        onKeyDown={moveWithKeyboard}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <h2>Notes</h2>
        <button
          className="window-close"
          onClick={onClose}
          aria-label="Close notes"
        >
          <Icon name="close" size={18} />
        </button>
      </header>
      <label className="sr-only" htmlFor="private-notes">
        Your private notes
      </label>
      <textarea
        id="private-notes"
        value={content}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading || !loaded}
        maxLength={20000}
        placeholder={
          loading
            ? "Loading your notes…"
            : "A thought, a teammate, your next big idea…"
        }
      />
      <footer className="window-footer">
        <span
          role={error ? "alert" : "status"}
          className={error ? "notes-error" : ""}
        >
          {error || status || "Only you can see these notes."}
        </span>
        {!loaded && !loading ? (
          <button className="primary-button" onClick={onRetry}>
            Retry
          </button>
        ) : (
          <button
            className="primary-button"
            onClick={onSave}
            disabled={loading || saving || !loaded}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        )}
      </footer>
    </section>,
    document.body,
  );
}
