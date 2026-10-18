const baseUrl = (
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5001" : "")
).replace(/\/$/, "");
export async function apiRequest(
  path,
  { token, signal, method = "GET", body } = {},
) {
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      signal,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error(
      "The server could not be reached. Check your connection and try again.",
    );
  }
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      /* Non-JSON errors retain the status message. */
    }
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}
