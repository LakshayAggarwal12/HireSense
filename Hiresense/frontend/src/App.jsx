import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import router from "./routes/router";
import { AppDataProvider } from "./context/AppDataContext";
import { PreferencesProvider } from "./context/PreferencesContext";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <PreferencesProvider>
      {/* AuthProvider sits above AppDataProvider because AppDataContext's
          fetches are only meaningful once a user is authenticated. */}
      <AuthProvider>
        <AppDataProvider>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            gutter={10}
            containerStyle={{ top: 72 }}
            toastOptions={{
              duration: 4000,
              style: {
                fontSize: "13px",
                lineHeight: "1.45",
                borderRadius: "10px",
                padding: "10px 14px",
                maxWidth: "22rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-ink)",
                boxShadow: "var(--shadow-pop)",
              },
              success: {
                iconTheme: { primary: "var(--color-accent)", secondary: "var(--color-surface)" },
              },
              error: {
                iconTheme: { primary: "var(--color-score-low)", secondary: "var(--color-surface)" },
              },
            }}
          />
        </AppDataProvider>
      </AuthProvider>
    </PreferencesProvider>
  );
}
