import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon.jsx";
export default function Modal({ title, onClose, children, className = "" }) {
  const dialog = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const element = dialog.current;
    element.showModal();
    const onCancel = (event) => {
      event.preventDefault();
      close.current();
    };
    element.addEventListener("cancel", onCancel);
    return () => {
      element.removeEventListener("cancel", onCancel);
      element.close();
      previous?.focus();
    };
  }, []);
  return createPortal(
    <dialog
      ref={dialog}
      className={`window modal ${className}`}
      aria-labelledby="modal-title"
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <header className="window-header">
        <h2 id="modal-title">{title}</h2>
        <button
          className="window-close"
          onClick={onClose}
          aria-label={`Close ${title}`}
        >
          <Icon name="close" size={18} />
        </button>
      </header>
      {children}
    </dialog>,
    document.body,
  );
}
