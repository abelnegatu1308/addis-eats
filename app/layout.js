import "./globals.css";
import { DM_Sans, Playfair_Display } from "next/font/google";
import SiteChrome from "./components/SiteChrome";
import Providers from "./providers";
import { ThemeProvider } from "./components/ThemeProvider";
import { siteUrl } from "@/lib/site-url";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export const metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Addis Eats | A table worth gathering around",
    template: "%s | Addis Eats",
  },
  description:
    "Share Ethiopian comfort food made with slow-cooked wot, bright spices, and the generous spirit of an Addis Ababa table.",
  openGraph: {
    type: "website",
    siteName: "Addis Eats",
    locale: "en_ET",
    title: "Addis Eats | A table worth gathering around",
    description:
      "Share Ethiopian comfort food made with slow-cooked wot, bright spices, and the generous spirit of an Addis Ababa table.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Addis Eats | A table worth gathering around",
    description:
      "Share Ethiopian comfort food made with slow-cooked wot, bright spices, and the generous spirit of an Addis Ababa table.",
  },
};

// Runs before paint to apply the saved/system theme and prevent a flash of
// the wrong theme. Kept inline and minimal; safe on the server (guarded).
const themeInitScript = `(function(){try{var t=localStorage.getItem('addis-eats-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=d?'dark':'light';var e=document.documentElement;e.setAttribute('data-theme',r);e.style.colorScheme=r;}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${dmSans.variable} ${playfair.variable}`}>
        <ThemeProvider>
          <Providers>
            <SiteChrome>{children}</SiteChrome>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
