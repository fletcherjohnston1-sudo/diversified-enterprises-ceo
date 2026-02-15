import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mission Control",
  description: "Dashboard for managing OpenClaw interactions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ 
          backgroundColor: '#0a0a0a',
          color: '#ffffff',
          minHeight: '100vh',
          margin: 0,
        }}
      >
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main 
            className="main-content"
            style={{ 
              flex: 1,
              padding: '24px',
              marginLeft: '200px',
              minHeight: '100vh',
              boxSizing: 'border-box',
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
