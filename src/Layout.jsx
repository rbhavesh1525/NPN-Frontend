
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Upload, 
  Users, 
  MessageSquare, 
  History, 
  Menu,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  Building2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { User as UserEntity } from "@/entities/User";
import { ThemeProvider, useTheme } from '@/components/providers/ThemeProvider'; // FIX: Corrected import path

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Upload Data",
    url: createPageUrl("UploadData"),
    icon: Upload,
  },
  {
    title: "Segmentation Results",
    url: createPageUrl("SegmentationResults"),
    icon: Users,
  },
  {
    title: "Message Generation",
    url: createPageUrl("MessageGeneration"),
    icon: MessageSquare,
  },
  {
    title: "History & Reports",
    url: createPageUrl("History"),
    icon: History,
  },
];

function AppLayout({ children, currentPageName }) {
  const location = useLocation();
  const { darkMode, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await UserEntity.logout();
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <style>
        {`
            :root {
              --primary-blue: #2563eb;
              --primary-blue-dark: #1d4ed8;
              --secondary-blue: #3b82f6;
              --light-blue: #dbeafe;
              --gray-50: #f8fafc;
              --gray-100: #f1f5f9;
              --gray-200: #e2e8f0;
              --gray-300: #cbd5e1;
              --gray-400: #94a3b8;
              --gray-500: #64748b;
              --gray-600: #475569;
              --gray-700: #334155;
              --gray-800: #1e293b;
              --gray-900: #0f172a;
            }
            
            .dark {
              --primary-blue: #3b82f6;
              --primary-blue-dark: #2563eb;
              --secondary-blue: #60a5fa;
              --light-blue: #1e3a8a;
            }
            
            .sidebar-transition {
              transition: width 0.3s ease-in-out, margin 0.3s ease-in-out;
            }
            
            .fade-in {
              animation: fadeIn 0.3s ease-in-out;
            }
            
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
      </style>
      
      {/* Top Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-b transition-colors duration-200`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and menu */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-blue-600">CustomerIQ</h1>
                  <p className="text-xs text-gray-500">Segmentation & Messaging</p>
                </div>
              </div>
            </div>

            {/* Right side - Theme toggle and user menu */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={`${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link to={createPageUrl("Settings")}>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Login
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`fixed left-0 top-16 bottom-0 z-40 sidebar-transition ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        } border-r transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
          
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
            {!sidebarCollapsed && (
              <h2 className="font-semibold text-gray-900 dark:text-white">Navigation</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  location.pathname === item.url
                    ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-900/30 dark:text-blue-300'
                    : `${darkMode ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-medium truncate">{item.title}</span>
                )}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 sidebar-transition ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        } transition-all duration-300`}>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

// The exported Layout component now wraps the actual layout with the provider
export default function Layout({ children, currentPageName }) {
  return (
    <ThemeProvider>
      <AppLayout currentPageName={currentPageName}>
        {children}
      </AppLayout>
    </ThemeProvider>
  );
}
