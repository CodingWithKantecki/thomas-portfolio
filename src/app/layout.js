import { Inter } from "next/font/google";
import { preload } from "react-dom";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Thomas Kantecki - Health Informatics & AI Developer",
  description: "Portfolio of Thomas Kantecki - Health Informatics • AI Engineer • Full-Stack Developer specializing in AI solutions for healthcare applications",
  keywords: "health informatics, AI developer, healthcare technology, UCF, HIIM, medical software, HIPAA compliance, Statura, legislative technology, Thomas Kantecki",
  openGraph: {
    title: "Thomas Kantecki - Health Informatics & AI Developer",
    description: "Building innovative AI solutions for healthcare applications",
    type: "website",
    url: "https://www.kantecki.com",
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  preload("/fonts/press-start-2p-latin.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}