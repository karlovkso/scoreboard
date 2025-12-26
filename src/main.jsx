import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle client-side routing for GitHub Pages
if (window.location.pathname === "/scoreboard/") {
  const path = window.location.search.slice(2); // remove ?/
  if (path) {
    window.history.replaceState(
      null,
      "",
      "/scoreboard/" + path.replace(/~and~/g, "&")
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
