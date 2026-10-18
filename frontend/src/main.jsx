import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App.jsx";
import "./index.css";

const { VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_AUTH0_AUDIENCE } =
  import.meta.env;
const root = createRoot(document.getElementById("root"));
if (!VITE_AUTH0_DOMAIN || !VITE_AUTH0_CLIENT_ID || !VITE_AUTH0_AUDIENCE) {
  root.render(
    <p>
      Configure the Auth0 settings in frontend/.env.local, then restart the
      frontend.
    </p>,
  );
} else {
  root.render(
    <StrictMode>
      <Auth0Provider
        domain={VITE_AUTH0_DOMAIN}
        clientId={VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: VITE_AUTH0_AUDIENCE,
        }}
      >
        <App />
      </Auth0Provider>
    </StrictMode>,
  );
}
