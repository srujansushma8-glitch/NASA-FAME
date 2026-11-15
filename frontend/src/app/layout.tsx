import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth-context";
import { CosmicNebulaEnvironment } from "@/components/effects/CosmicNebulaEnvironment";
import { InteractiveCursorGlow } from "@/components/effects/InteractiveCursorGlow";

export const metadata: Metadata = {
  title: "NASA-FLAME • Flame in Freefall | Scientific Research Platform",
  description:
    "Understanding flame behaviour beyond Earth. NASA scientific simulation and neural diagnostic platform exploring microgravity combustion dynamics across 0g to 1g.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Manrope:wght@300;400;500;600;700;800&family=Michroma&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var nav = performance.getEntriesByType('navigation');
                  var isReload = (nav.length > 0 && nav[0].type === 'reload') ||
                                 (window.performance && window.performance.navigation && window.performance.navigation.type === 1);
                  if (isReload) {
                    try {
                      localStorage.removeItem('nasa_flame_auth_token');
                      localStorage.removeItem('nasa_flame_session_token');
                      localStorage.removeItem('nasa_flame_user_profile');
                      sessionStorage.removeItem('nasa_flame_auth_token');
                      sessionStorage.removeItem('nasa_flame_session_token');
                      sessionStorage.removeItem('nasa_flame_user_profile');
                    } catch(e) {}
                    if (window.location.pathname !== '/') {
                      window.location.replace('/');
                    }
                  }
                } catch(err) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-void text-white font-sans antialiased selection:bg-earth/30 selection:text-white overflow-x-hidden relative">
        {/* Cosmic Deep-Space Nebula, Dense Twinkling Stars, Planets, Asteroids & Dynamic Meteors */}
        <CosmicNebulaEnvironment />
        <InteractiveCursorGlow />

        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col relative z-10">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
