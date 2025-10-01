 "use client";
 
 import Link from 'next/link';
 import { usePathname } from 'next/navigation';
 
 export default function Navbar() {
     const pathname = usePathname();
 
     const navItems = [
         { href: '/students', label: 'รายชื่อนิสิต' },
         { href: '/student/activities', label: 'จัดการกิจกรรม' },
     ];
 
     return (
         <nav className="bg-gray-800/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="flex items-center justify-between h-16">
                     <div className="flex-shrink-0">
                         <Link href="/">
                             <span className="text-2xl font-bold text-white hover:text-gray-300 transition-colors">
                                 Activity TSU
                             </span>
                         </Link>
                     </div>
                     <div className="hidden md:block">
                         <div className="ml-10 flex items-baseline space-x-4">
                             {navItems.map((item) => {
                                 const isActive = pathname.startsWith(item.href);
                                 return (
                                     <Link key={item.href} href={item.href}>
                                         <span className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                                             isActive
                                                 ? 'bg-gray-900 text-white'
                                                 : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                         }`}>
                                             {item.label}
                                         </span>
                                     </Link>
                                 );
                             })}
                         </div>
                     </div>
                 </div>
             </div>
         </nav>
     );
 }

