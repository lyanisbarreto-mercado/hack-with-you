export function currentRoute(hash = window.location.hash) {
  if (hash === "#/home" || hash === "#/members") return { page: "home" };
  if (["#/sign-in", "#/login", "#/signup"].includes(hash))
    return { page: "signin" };
  const match = hash.match(/^#\/users\/([^/]+)$/);
  if (match) {
    try {
      const username = decodeURIComponent(match[1]);
      return { page: username === "me" ? "me" : "user", username };
    } catch {
      return { page: "landing" };
    }
  }
  return { page: "landing" };
}
