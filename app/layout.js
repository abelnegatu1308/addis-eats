import "./globals.css";
import { DM_Sans, Playfair_Display } from "next/font/google";
import SiteChrome from "./components/SiteChrome";
import Providers from "./providers";
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfair.variable}`}>
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
