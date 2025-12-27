import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import "./styles/globals.css";

import { createRouter } from "./router";
import reportWebVitals from "./reportWebVitals";
import { ThemeProvider } from "./components/common/theme-provider";

// Create a new router instance
const router = createRouter();

// Render the app
const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="audiencehero-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </StrictMode>,
  );
}
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
