import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { FrappeProvider } from "frappe-react-sdk";
import App from "./App";
import "./index.css";
import "./styles/app.css";

const siteName =
  (typeof window !== "undefined" && window.frappe?.boot?.sitename) ||
  import.meta.env.VITE_SITE_NAME ||
  (typeof window !== "undefined" ? window.location.hostname : "");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/frontend">
      <FrappeProvider
        siteName={siteName}
        swrConfig={{ revalidateOnFocus: false, shouldRetryOnError: false }}
      >
        <App />
      </FrappeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
