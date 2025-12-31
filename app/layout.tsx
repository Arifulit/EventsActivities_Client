import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";
import { metadata } from "./metadata";

// This is a Client Component
export const dynamic = 'force-dynamic';

// Client-side only component to handle client-side effects
function ClientLayout({ children }: { children: React.ReactNode }) {
  if (typeof window !== 'undefined') {
    // This code will only run on the client side
    document.body.removeAttribute('cz-shortcut-listen');
  }
  
  return <>{children}</>;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50`} suppressHydrationWarning>
        <ClientLayout>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">
              <div className="w-full">
                {children}
              </div>
            </main>
            <Footer />
            <Toaster position="top-right" 
              toastOptions={{
                className: 'backdrop-blur-md bg-white/90 border border-gray-200 shadow-xl',
                duration: 4000,
              }} 
            />
          </AuthProvider>
        </ClientLayout>
      </body>
    </html>
  );
}
