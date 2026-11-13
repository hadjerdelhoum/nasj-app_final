import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Spinner } from "../components/ui";
import { useAudioUnlock } from "../features/audio/useAudio";
import { useI18n } from "../i18n";
import { useAuth, useChildren } from "./state";

import { WelcomePage } from "../features/auth/WelcomePage";
import { SignUpPage } from "../features/auth/SignUpPage";
import { LoginPage } from "../features/auth/LoginPage";
import { ChildrenPage } from "../features/children/ChildrenPage";
import { HomePage } from "../features/worlds/HomePage";
import { WorldPage } from "../features/worlds/WorldPage";
import { ActivityPage } from "../features/activities/ActivityPage";
import { CollectionPage } from "../features/rewards/CollectionPage";
import { SettingsPage } from "../features/settings/SettingsPage";

// Rarely used screens are split out of the main bundle.
const AssistantPage = lazy(() => import("../features/assistant/AssistantPage"));
const ParentPage = lazy(() => import("../features/parent-dashboard/ParentPage"));

function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const loc = useLocation();
  return token ? <>{children}</> : <Navigate to="/welcome" replace state={{ from: loc.pathname }} />;
}

function RequireChild({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { loaded, child } = useChildren();
  if (!loaded) return <Spinner label={t("loading")} />;
  return child ? <>{children}</> : <Navigate to="/children" replace />;
}

export function App() {
  const { t } = useI18n();
  const { token } = useAuth();
  useAudioUnlock();

  return (
    <Suspense fallback={<Spinner label={t("loading")} />}>
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/signup" element={token ? <Navigate to="/children" replace /> : <SignUpPage />} />
        <Route path="/login" element={token ? <Navigate to="/children" replace /> : <LoginPage />} />
        <Route path="/children" element={<RequireAuth><ChildrenPage /></RequireAuth>} />

        {/* immersive: no top bar / dock while playing */}
        <Route path="/play/:activityId" element={<RequireAuth><RequireChild><ActivityPage /></RequireChild></RequireAuth>} />

        <Route element={<RequireAuth><RequireChild><AppShell /></RequireChild></RequireAuth>}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/world/:worldId" element={<WorldPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/parent" element={<ParentPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to={token ? "/home" : "/welcome"} replace />} />
      </Routes>
    </Suspense>
  );
}
