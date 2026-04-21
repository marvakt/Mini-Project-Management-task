"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandGlyph, FolderIcon, BoardIcon, LogoutIcon } from "./dashboard-ui"; 
import { authApi } from "@/lib/auth";
import { useState, useEffect } from "react";

export function SidebarLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    authApi.getCurrentUser().then(user => {
      setIsAdmin(user?.role === "admin");
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error("Logout API failed", e);
    }
    window.location.href = "/login";
  };

  const menuItems = [
    { name: "Projects", path: "/dashboard/projects", icon: FolderIcon },        
    { name: "My Tasks", path: "/dashboard/tasks", icon: BoardIcon },
  ];

  if (isAdmin) {
    menuItems.push({ name: "Team", path: "/dashboard/users", icon: BrandGlyph });
  }

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden text-black font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r-2 border-gray-200 flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Logo */}
          <div className="px-6 py-8 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-black text-white">
              <BrandGlyph className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold text-black tracking-tight uppercase">TechBrain</span>
          </div>

          {/* Navigation */}
          <nav className="px-4 space-y-2">
            <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 mt-4">Dashboard</p>
            {menuItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold transition-all ${isActive ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100 hover:text-black"}`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t-2 border-gray-200 mb-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold text-gray-500 hover:bg-gray-100 hover:text-black transition-all"
          >
            <LogoutIcon className="h-5 w-5 text-gray-400" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto w-full relative bg-gray-50">   
        {/* Top Header */}
        <header className="h-[72px] bg-white border-b-2 border-gray-200 flex items-center justify-between px-6 sm:px-8 shrink-0 z-10 sticky top-0">
          {/* Mobile menu button & Title */}
          <div className="flex items-center gap-4">
            <p className="text-sm font-bold text-black uppercase tracking-widest">Workspace</p>    
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="hidden md:flex items-center gap-2 text-black bg-white px-4 py-2 rounded-md border-2 border-gray-200 md:w-80">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>     
              <input type="text" placeholder="Search for Application here" className="bg-transparent border-none outline-none w-full text-xs text-black placeholder-gray-400 font-bold" />
            </div>
            <div className="w-9 h-9 rounded bg-black flex items-center justify-center text-white font-bold text-xs shrink-0 cursor-pointer hover:bg-gray-800 transition-colors">        
                ME
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}







