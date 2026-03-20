"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Code, Book, Home, MessageSquare, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isMentorMode = pathname.includes("/mentor");

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo & Brand */}
        <button 
          onClick={() => handleNavigation("/")}
          className="flex items-center gap-3 group cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-2.5 rounded-lg group-hover:shadow-lg transition-shadow">
            <Code className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">MANTRIQ</div>
            <div className="text-xs text-gray-500 font-medium">AI Code Mentor</div>
          </div>
        </button>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => handleNavigation("/")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 cursor-pointer ${
              pathname === "/" && !isMentorMode
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => handleNavigation("/dashboard")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 cursor-pointer ${
              pathname === "/dashboard"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Code Assistant
          </button>
          <button
            onClick={() => handleNavigation("/mentor")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 cursor-pointer ${
              isMentorMode
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Book className="w-4 h-4" />
            Mentor Mode
          </button>
          <button
            onClick={() => handleNavigation("/syllabus")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 cursor-pointer ${
              pathname === "/syllabus"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Syllabus
          </button>
          <button
            onClick={() => handleNavigation("/about")}
            className="px-4 py-2 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
          >
            About
          </button>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {isMentorMode ? (
            <button
              onClick={() => handleNavigation("/dashboard")}
              className="bg-white border border-gray-200 text-gray-900 hover:bg-gray-100 rounded-lg font-bold px-5 py-2.5 transition-all cursor-pointer"
            >
              ← Back to Code
            </button>
          ) : (
            <button
              onClick={() => handleNavigation("/mentor")}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-bold px-5 py-2.5 transition-all cursor-pointer"
            >
              Mentor Mode
            </button>
          )}
        </div>
      </div>
    </header>
  );
}