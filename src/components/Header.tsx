/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, Search, Mic, Bell, Video, LogOut, Play, X, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onToggleSidebar: () => void;
  onOpenUploadWizard: () => void;
}

export default function Header({
  user,
  onLogout,
  searchQuery,
  setSearchQuery,
  onToggleSidebar,
  onOpenUploadWizard
}: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-2 border-b border-slate-100 h-14 select-none" id="youtube-header">
      {/* Left section: Hamburger & Logo */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer active:scale-95 transition-all"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-1.5 font-sans font-bold tracking-tighter text-lg md:text-xl shrink-0 cursor-pointer">
          <div className="bg-rose-600 text-white p-1 rounded-md flex items-center justify-center">
            <Play className="w-4.5 h-4.5 fill-white" />
          </div>
          <span className="text-slate-900">Drive<span className="text-rose-600">Tube</span></span>
        </div>
      </div>

      {/* Middle section: YouTube search bar */}
      <div className="flex-1 max-w-2xl mx-4 hidden md:flex items-center gap-4">
        <div className="flex flex-1 items-center bg-slate-50 border border-slate-200 rounded-full overflow-hidden focus-within:border-slate-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-400 h-10 transition-all">
          <div className="flex-1 flex items-center px-4">
            <input
              type="text"
              placeholder="Search images and videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-slate-800 outline-none placeholder-slate-400 text-sm py-1"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button 
            type="submit" 
            className="bg-slate-100/80 border-l border-slate-250 px-6 h-full text-slate-500 hover:bg-slate-150 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer"
          >
            <Search className="w-4.5 h-4.5" />
          </button>
        </div>
        
        <button 
          className="p-2.5 bg-slate-50 text-slate-650 border border-slate-200/60 rounded-full hover:bg-slate-100 cursor-pointer flex items-center justify-center relative group"
          title="Search with Voice (Simulated)"
          onClick={() => {
            alert("Voice Search is an illustrative action. Type in the input field to search files in real-time.");
          }}
        >
          <Mic className="w-4.5 h-4.5" />
          <span className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded hidden group-hover:block whitespace-nowrap">Voice search</span>
        </button>
      </div>

      {/* Right section: Actions & user avatar */}
      <div className="flex items-center gap-1.5 md:gap-3">
        {/* Upload Button - only shown on administrator account */}
        {user?.email === 'jlwrk25@gmail.com' && (
          <button
            onClick={onOpenUploadWizard}
            className="p-2 hover:bg-slate-50 rounded-full text-slate-800 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-full text-xs font-semibold hover:border-slate-350 shadow-xs hover:shadow-sm"
            title="Google Drive Guide"
          >
            <Video className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">Add Content</span>
          </button>
        )}

        {/* Notification indicator */}
        <button 
          className="p-2 text-slate-650 hover:bg-slate-105 rounded-full cursor-pointer relative"
          onClick={() => alert("All caught up! You are logged into your private gallery hub.")}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full"></span>
        </button>

        {/* User profile dropdown trigger */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-8 h-8 rounded-full border border-rose-500 overflow-hidden cursor-pointer flex items-center justify-center bg-slate-100 select-none active:scale-95 flex-shrink-0"
            >
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Profile'} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="text-xs font-bold text-rose-600">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-4 text-sm z-50 text-slate-800 font-sans animate-in fade-in duration-200">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-semibold truncate">{user.displayName || 'Viewer Mode'}</div>
                    <div className="text-xs text-slate-450 truncate">{user.email}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-mono tracking-wider py-1 uppercase">Drive Node</div>
                  <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono text-amber-600 break-all mb-3 max-h-16 overflow-y-auto">
                    OAuth Secure Session Active
                  </div>
                  
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all text-left cursor-pointer font-medium font-sans"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            A
          </div>
        )}
      </div>
    </header>
  );
}
