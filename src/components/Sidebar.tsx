/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Home, 
  Video, 
  Image, 
  Heart, 
  Folder, 
  Tv, 
  History, 
  ListVideo, 
  Compass, 
  UserSquare,
  Flame
} from 'lucide-react';
import { DriveFile } from '../types';

interface SidebarProps {
  currentFilter: {
    type: 'all' | 'video' | 'image' | 'folder' | 'favorites' | 'history' | 'shorts';
    folderId?: string;
  };
  setFilter: (filter: { type: 'all' | 'video' | 'image' | 'folder' | 'favorites' | 'history' | 'shorts'; folderId?: string }) => void;
  subfolders: DriveFile[];
  favoritesCount: number;
  historyCount: number;
  collapsed: boolean;
}

export default function Sidebar({
  currentFilter,
  setFilter,
  subfolders,
  favoritesCount,
  historyCount,
  collapsed
}: SidebarProps) {
  
  if (collapsed) {
    // Compact sidebar layout
    return (
      <aside className="w-18 bg-white border-r border-slate-100 py-2 flex flex-col items-center gap-1 overflow-y-auto select-none shrink-0" id="sidebar-compact">
        <button
          onClick={() => setFilter({ type: 'all' })}
          className={`w-[80%] flex flex-col items-center justify-center p-2.5 rounded-xl text-[10px] cursor-pointer hover:bg-slate-50 transition-all ${currentFilter.type === 'all' ? 'text-rose-600 font-bold bg-rose-50/50' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Home className="w-4.5 h-4.5 mb-1" />
          <span className="truncate max-w-full">Home</span>
        </button>

        <button
          onClick={() => setFilter({ type: 'video' })}
          className={`w-[80%] flex flex-col items-center justify-center p-2.5 rounded-xl text-[10px] cursor-pointer hover:bg-slate-50 transition-all ${currentFilter.type === 'video' ? 'text-rose-600 font-bold bg-rose-50/50' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Video className="w-4.5 h-4.5 mb-1" />
          <span className="truncate max-w-full">Videos</span>
        </button>

        <button
          onClick={() => setFilter({ type: 'shorts' })}
          className={`w-[80%] flex flex-col items-center justify-center p-2.5 rounded-xl text-[10px] cursor-pointer hover:bg-slate-50 transition-all ${currentFilter.type === 'shorts' ? 'text-rose-650 font-bold bg-rose-50/50' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Flame className="w-4.5 h-4.5 mb-1" />
          <span className="truncate max-w-full">Shorts</span>
        </button>

        <button
          onClick={() => setFilter({ type: 'image' })}
          className={`w-[80%] flex flex-col items-center justify-center p-2.5 rounded-xl text-[10px] cursor-pointer hover:bg-slate-50 transition-all ${currentFilter.type === 'image' ? 'text-rose-600 font-bold bg-rose-50/50' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Image className="w-4.5 h-4.5 mb-1" />
          <span className="truncate max-w-full">Images</span>
        </button>

        <button
          onClick={() => setFilter({ type: 'favorites' })}
          className={`w-[80%] flex flex-col items-center justify-center p-2.5 rounded-xl text-[10px] cursor-pointer hover:bg-slate-50 transition-all ${currentFilter.type === 'favorites' ? 'text-rose-600 font-bold bg-rose-50/50' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Heart className="w-4.5 h-4.5 mb-1" />
          <span className="truncate max-w-full">Favorites</span>
        </button>

        <button
          onClick={() => setFilter({ type: 'history' })}
          className={`w-[80%] flex flex-col items-center justify-center p-2.5 rounded-xl text-[10px] cursor-pointer hover:bg-slate-50 transition-all ${currentFilter.type === 'history' ? 'text-rose-600 font-bold bg-rose-50/50' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <History className="w-4.5 h-4.5 mb-1" />
          <span className="truncate max-w-full">History</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-60 bg-white border-r border-slate-100 p-3 flex flex-col overflow-y-auto select-none shrink-0 font-sans" id="sidebar-expanded">
      {/* Feed Section */}
      <div className="space-y-1 mb-6">
        <button
          onClick={() => setFilter({ type: 'all' })}
          className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm cursor-pointer hover:bg-slate-50 transition-all ${currentFilter.type === 'all' ? 'text-rose-600 font-semibold bg-rose-50/50' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Home className="w-4.5 h-4.5" />
          <span>Home Feed</span>
        </button>

        <button
          onClick={() => setFilter({ type: 'video' })}
          className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm cursor-pointer hover:bg-slate-50 transition-all ${currentFilter.type === 'video' ? 'text-rose-600 font-semibold bg-rose-50/50' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Video className="w-4.5 h-4.5" />
          <span>Videos Only</span>
        </button>

        <button
          onClick={() => setFilter({ type: 'shorts' })}
          className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm cursor-pointer hover:bg-slate-50 transition-all ${currentFilter.type === 'shorts' ? 'text-rose-600 font-semibold bg-rose-50/50' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Flame className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
          <span className="font-bold text-rose-600">YouTube Shorts</span>
        </button>

        <button
          onClick={() => setFilter({ type: 'image' })}
          className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm cursor-pointer hover:bg-slate-50 transition-all ${currentFilter.type === 'image' ? 'text-rose-600 font-semibold bg-rose-50/50' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Image className="w-4.5 h-4.5" />
          <span>Images Only</span>
        </button>
      </div>

      <hr className="border-slate-100 mb-6" />

      {/* Library/Favorites Section */}
      <h3 className="px-4 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2 font-sans">
        My Library
      </h3>
      <div className="space-y-1 mb-6">
        <button
          onClick={() => setFilter({ type: 'favorites' })}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm cursor-pointer hover:bg-slate-50 transition-all ${currentFilter.type === 'favorites' ? 'text-rose-650 font-semibold bg-rose-50/50' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <div className="flex items-center gap-4">
            <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-500/10" />
            <span>Favorites</span>
          </div>
          {favoritesCount > 0 && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-100/50 text-rose-600 font-bold">
              {favoritesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilter({ type: 'history' })}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm cursor-pointer hover:bg-slate-50 transition-all ${currentFilter.type === 'history' ? 'text-rose-650 font-semibold bg-rose-50/50' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <div className="flex items-center gap-4">
            <History className="w-4.5 h-4.5 text-slate-400" />
            <span>Watch History</span>
          </div>
          {historyCount > 0 && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">
              {historyCount}
            </span>
          )}
        </button>
      </div>

      <hr className="border-slate-100 mb-6" />

      {/* Subfolders representing YouTube Playlists / Sub-channels */}
      <h3 className="px-4 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2 font-sans flex items-center justify-between">
        <span>Playlists (Folders)</span>
        <Folder className="w-3.5 h-3.5 text-slate-400" />
      </h3>
      
      <div className="space-y-1 overflow-y-auto max-h-56 pr-1 custom-scrollbar">
        {subfolders.length === 0 ? (
          <div className="px-4 py-3 text-xs text-slate-400 italic font-mono leading-tight">
            No nested Google Drive subfolders found.
          </div>
        ) : (
          subfolders.map((folder) => {
            const isSelected = currentFilter.type === 'folder' && currentFilter.folderId === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => setFilter({ type: 'folder', folderId: folder.id })}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-left truncate cursor-pointer hover:bg-slate-50 transition-all ${isSelected ? 'text-rose-600 font-semibold bg-rose-50/50 animate-fade' : 'text-slate-500 hover:text-slate-800'}`}
                title={folder.name}
              >
                <div className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0"></div>
                <span className="truncate">{folder.name}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-6 text-[10px] text-slate-400 px-4 leading-normal">
        <p className="mb-1">© 2026 DriveTube Inc.</p>
        <p>Private Theater Protocol</p>
      </div>
    </aside>
  );
}
