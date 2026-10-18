import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "./api.js";
export default function useNotes({ owner, getAccessTokenSilently }) {
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const generation = useRef(0);
  useEffect(() => {
    generation.current += 1;
    setContent("");
    setSavedContent("");
    setLoaded(false);
    setLoading(false);
    setSaving(false);
    setError("");
    setStatus("");
    return () => {
      generation.current += 1;
    };
  }, [owner]);
  const load = useCallback(async () => {
    if (!owner || loading || loaded) return;
    const current = generation.current;
    setLoading(true);
    setError("");
    try {
      const token = await getAccessTokenSilently();
      const note = await apiRequest("/api/notes", { token });
      if (generation.current !== current) return;
      setContent(note.content);
      setSavedContent(note.content);
      setLoaded(true);
    } catch (err) {
      if (generation.current === current) setError(err.message);
    } finally {
      if (generation.current === current) setLoading(false);
    }
  }, [owner, loading, loaded, getAccessTokenSilently]);
  const save = useCallback(async () => {
    if (!owner || !loaded || saving) return;
    const current = generation.current;
    const snapshot = content;
    setSaving(true);
    setStatus("");
    setError("");
    try {
      const token = await getAccessTokenSilently();
      await apiRequest("/api/notes", {
        token,
        method: "PUT",
        body: { content: snapshot },
      });
      if (generation.current === current) {
        setSavedContent(snapshot);
        setStatus("Saved privately.");
      }
    } catch (err) {
      if (generation.current === current) setError(err.message);
    } finally {
      if (generation.current === current) setSaving(false);
    }
  }, [content, loaded, saving, owner, getAccessTokenSilently]);
  const dirty = content !== savedContent;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  return {
    content,
    setContent,
    loaded,
    loading,
    saving,
    load,
    save,
    error,
    status: dirty ? "Unsaved changes" : status,
  };
}
