 import type { Metadata } from "next";
 import { Inter } from "next/font/google";
 import "./globals.css";
 import Navbar from "./components/Navbar";
 
 const inter = Inter({ subsets: ["latin"] });
 
 export const metadata: Metadata = {
   title: "ระบบบันทึกกิจกรรม TSU",
   description: "ระบบจัดการและอัปโหลดรูปภาพกิจกรรมสำหรับนิสิต",
 };
 
 export default function RootLayout({
   children,
 }: Readonly<{
   children: React.ReactNode;
 }>) {
   return (
     <html lang="th">
       <body className={`${inter.className} bg-gray-900`}>
         <Navbar />
         {children}
       </body>
     </html>
   );
 }
