 import type { Metadata } from "next";
 import type { ReactNode } from "react";
 import { AuthProvider } from "@/context/AuthContext";
 import { ToastProvider } from "@/components/Toast";
 import Footer from "@/components/Footer";
 import Navbar from "@/components/Navbar";
 import "./globals.css";

 export const metadata: Metadata = {
   title: "DriveNow — Premium Car Rentals",
   description: "Find and rent premium vehicles from trusted dealers near you.",
 };

 export const viewport = {
   width: "device-width",
   initialScale: 1,
   maximumScale: 1,
 };

 export default function RootLayout({
   children,
 }: Readonly<{
   children: ReactNode;
 }>) {
   return (
     <html lang="en" suppressHydrationWarning>
       <body suppressHydrationWarning>
         <AuthProvider>
           <ToastProvider>
             <div className="site-shell">
               <Navbar />
               <main className="site-main">{children}</main>
               <Footer />
             </div>
           </ToastProvider>
         </AuthProvider>
       </body>
     </html>
   );
 }
