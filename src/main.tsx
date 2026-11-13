import "@fontsource-variable/nunito";
import "@fontsource-variable/noto-sans-arabic";
import "@fontsource/baloo-2/600.css";
import "@fontsource/baloo-2/700.css";
import "@fontsource/baloo-2/800.css";
import "@fontsource/baloo-bhaijaan-2/600.css";
import "@fontsource/baloo-bhaijaan-2/700.css";
import "@fontsource/baloo-bhaijaan-2/800.css";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/components.css";
import "./styles/screens.css";
import "./styles/activities.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app/App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider, ChildProvider, ProgressProvider } from "./app/state";
import { I18nProvider } from "./i18n";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
    <I18nProvider>
      <BrowserRouter>
        <AuthProvider>
          <ChildProvider>
            <ProgressProvider>
              <App />
            </ProgressProvider>
          </ChildProvider>
        </AuthProvider>
      </BrowserRouter>
    </I18nProvider>
    </ErrorBoundary>
  </StrictMode>
);
