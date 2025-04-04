import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { headers } from "next/headers";
import ContextProvider from "@/context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Story Element for Los Muertos World",
  description: "Story Element is a world building collaboration app that uses AI to assist creators in collaboratively forming a narrative universe.",
  twitter: {
    card: 'summary_large_image',
    title: 'Story Element for Los Muertos World',
    description: 'Story Element is a world building collaboration app that uses AI to assist creators in collaboratively forming a narrative universe.',
    site: '@arcusunda',
    images: ['https://storyelement.ai/Home.jpg']
  },
  openGraph: {
    title: 'Story Element for Los Muertos World',
    description: 'Story Element is a world building collaboration app that uses AI to assist creators in collaboratively forming a narrative universe.',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie');

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ContextProvider cookies={cookies}>
          {children}
        </ContextProvider>
        <Analytics />
      </body>
    </html>
  );
}