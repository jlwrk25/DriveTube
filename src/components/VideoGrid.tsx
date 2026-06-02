/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Heart, Image as ImageIcon, Video as VideoIcon, Calendar, HardDrive, Sparkles } from 'lucide-react';
import { DriveFile } from '../types';
import { getMediaEngagement, getRelativeTime, formatDuration } from '../lib/drive';

interface VideoGridProps {
  files: DriveFile[];
  onSelectMedia: (file: DriveFile) => void;
  favorites: string[];
  onToggleFavorite: (e: React.MouseEvent, fileId: string) => void;
  isLoading: boolean;
  activeChip: string;
  setActiveChip: (chip: string) => void;
}

export default function VideoGrid({
  files,
  onSelectMedia,
  favorites,
  onToggleFavorite,
  isLoading,
  activeChip,
  setActiveChip
}: VideoGridProps) {
  
  const chips = ['All', 'Videos', 'Images', 'Recently Added', 'Popular', 'Selfies & Logs'];

  // Apply chip-based sub-filtering
  const getFilteredItems = () => {
    let list = [...files];
    if (activeChip === 'Videos') {
      list = list.filter(f => f.mimeType.startsWith('video/'));
    } else if (activeChip === 'Images') {
      list = list.filter(f => f.mimeType.startsWith('image/'));
    } else if (activeChip === 'Recently Added') {
      // Sort by creation date descending
      list.sort((a, b) => {
        const ad = a.createdTime ? new Date(a.createdTime).getTime() : 0;
        const bd = b.createdTime ? new Date(b.createdTime).getTime() : 0;
        return bd - ad;
      });
    } else if (activeChip === 'Popular') {
      // Sort deterministically based on engagement view-counts
      list.sort((a, b) => {
        const ea = getMediaEngagement(a);
        const eb = getMediaEngagement(b);
        return eb.views - ea.views;
      });
    } else if (activeChip === 'Selfies & Logs') {
      list = list.filter(f => f.name.toLowerCase().includes('self') || f.name.toLowerCase().includes('log') || f.name.toLowerCase().includes('img'));
    }
    return list;
  };

  const filtered = getFilteredItems();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 py-20 p-6 text-slate-800 text-center font-sans">
        <div className="relative mb-6">
          <div className="w-14 h-14 border-4 border-slate-200 border-t-rose-600 rounded-full animate-spin"></div>
          <Sparkles className="w-5 h-5 text-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="font-mono text-sm text-slate-500">Loading elements from Google Cloud Drive storage...</p>
        <p className="text-xs text-slate-400 mt-2">Checking metadata files and playlists...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col overflow-y-auto custom-scrollbar font-sans select-none pb-12" id="video-grid-container">
      {/* Category Pills (Horizontal Scroll) */}
      <div className="flex gap-3 px-6 py-3 overflow-x-auto shrink-0 bg-slate-50 scrollbar-none border-b border-slate-200/40 md:border-none md:pb-1">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveChip(chip)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${activeChip === chip ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-650'}`}
          >
            {chip}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500">
          <HardDrive className="w-12 h-12 text-slate-400 mb-4 stroke-1 animate-bounce" />
          <h4 className="text-lg font-bold text-slate-700">No media items found</h4>
          <p className="text-sm text-slate-400 max-w-md mt-1">
            We couldn't find matches matching "{activeChip}" inside this Google Drive folder. Add images or videos to your drive to view them.
          </p>
        </div>
      ) : (
        <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
          {filtered.map((file) => {
            const isVideo = file.mimeType.startsWith('video/');
            const engagement = getMediaEngagement(file);
            const isFav = favorites.includes(file.id);
            const relativeTime = getRelativeTime(file.createdTime);
            
            // Deterministic user/channel color index for mock avatar
            const charCodeSum = file.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const colors = [
              'bg-red-500', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 
              'bg-violet-500', 'bg-pink-500', 'bg-orange-500', 'bg-indigo-500'
            ];
            const botAvatarColor = colors[charCodeSum % colors.length];

            return (
              <div 
                key={file.id} 
                onClick={() => onSelectMedia(file)}
                className="group flex flex-col gap-3 cursor-pointer transition-all duration-300 relative"
              >
                {/* Thumbnail Layer */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-white border border-slate-200/50 shadow-xs hover:shadow-md transition-all duration-350">
                  {file.thumbnailLink ? (
                    <img 
                      src={file.thumbnailLink.replace(/=s\d+/, '=s400')} // Request slightly higher resolution
                      alt={file.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-550"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 gap-3">
                      {isVideo ? (
                        <div className="p-3 rounded-full bg-slate-200/60 text-rose-500">
                          <VideoIcon className="w-6 h-6 animate-pulse" />
                        </div>
                      ) : (
                        <div className="p-3 rounded-full bg-slate-200/60 text-amber-500">
                          <ImageIcon className="w-6 h-6 animate-pulse" />
                        </div>
                      )}
                      <span className="text-slate-400 text-[10px] font-mono tracking-wider max-w-[80%] truncate text-center">
                        NO PREVIEW
                      </span>
                    </div>
                  )}

                  {/* Play video overlay on hover */}
                  {isVideo && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 animate-in fade-in">
                        <Play className="w-5 h-5 fill-white text-white translate-x-[2px]" />
                      </div>
                    </div>
                  )}

                  {/* Duration marker (lower right) or Image Tag */}
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-slate-950/85 text-[10px] font-mono text-white font-bold rounded flex items-center gap-1 z-10 shadow-xs">
                    {isVideo ? (
                      file.videoMediaMetadata?.durationMillis ? (
                        <span>{formatDuration(file.videoMediaMetadata.durationMillis)}</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <VideoIcon className="w-3 h-3 text-rose-450" />
                          <span>VIDEO</span>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-amber-400" />
                        <span>{file.imageMediaMetadata ? `${file.imageMediaMetadata.width}x${file.imageMediaMetadata.height}` : 'IMAGE'}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Favorite Star Trigger */}
                  <button
                    onClick={(e) => onToggleFavorite(e, file.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 cursor-pointer shadow-xs border border-slate-250/20 hover:scale-105 active:scale-95 transition-all"
                    title={isFav ? 'Remove from elements' : 'Add to favorites'}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : 'text-slate-450 hover:text-slate-700'}`} />
                  </button>
                </div>

                {/* Info block (Details matching youtube layout) */}
                <div className="flex gap-3 px-1">
                  {/* Channel avatar */}
                  <div className={`w-9 h-9 rounded-full ${botAvatarColor} text-white font-sans font-extrabold text-sm flex items-center justify-center flex-shrink-0 border border-slate-200/10 shadow-xs`}>
                    {engagement.channelName.charAt(0)}
                  </div>

                  {/* Title and stats metadata */}
                  <div className="flex flex-col gap-0.5 leading-tight min-w-0 flex-1">
                    <h3 className="text-slate-900 font-semibold text-sm line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors pr-2 break-words" title={file.name}>
                      {file.name}
                    </h3>

                    {/* Channel name snippet */}
                    <div className="text-slate-500 hover:text-slate-800 text-xs mt-1 transition-colors font-sans">
                      {engagement.channelName}
                    </div>

                    {/* View count & Upload age line */}
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5 truncate flex-wrap font-sans">
                      <span>{engagement.viewsStr}</span>
                      <span className="text-[9px] text-slate-300">•</span>
                      <span>{relativeTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
