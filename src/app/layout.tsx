import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "YoRemote",
  title: { default: "YoRemote — Universal Smart TV Controller", template: "%s | YoRemote" },
  description: "Web PWA Universal Remote Control for Smart TVs over local network (LG webOS, Samsung Tizen, Android TV, Roku).",
  keywords: [
    "Smart TV Remote",
    "Universal Remote",
    "PWA Remote",
    "LG webOS Remote",
    "Samsung Smart TV Remote",
    "Android TV Remote",
    "Roku Remote",
    "WiFi TV Controller",
  ],
  authors: [{ name: "Rakha" }],
  creator: "Rakha",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.svg", sizes: "192x192" },
    ],
    shortcut: "/icon.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "YoRemote",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "YoRemote — Universal Smart TV Controller",
    description: "Web PWA Universal Remote Control for Smart TVs over local WiFi network.",
    siteName: "YoRemote",
  },
  twitter: {
    card: "summary",
    title: "YoRemote — Universal Smart TV Controller",
    description: "Web PWA Universal Remote Control for Smart TVs over local WiFi network.",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
