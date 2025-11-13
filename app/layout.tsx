import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Affiliate Management Platform",
  description: "Manage Shopee and Lazada affiliate campaigns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
