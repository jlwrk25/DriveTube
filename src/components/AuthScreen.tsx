/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Shield, FolderHeart, Video, Image } from 'lucide-react';

interface AuthScreenProps {
  onLogin: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function AuthScreen({ onLogin, isLoading, error }: AuthScreenProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between" id="auth-screen">
      {/* Top Simple Nav */}
      <div className="p-5 flex items-center justify-between border-b border-slate-200/60 bg-white">
        <div className="flex items-center gap-1.5 font-sans font-bold tracking-tighter text-xl">
          <div className="bg-rose-600 text-white p-1 rounded-md flex items-center justify-center">
            <Play className="w-5 h-5 fill-white" />
          </div>
          <span className="text-slate-900">Drive<span className="text-rose-600">Tube</span></span>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          V1.0.0 // Private Client
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center text-center self-center justify-center flex-grow">
        {/* Animated Accent */}
        <div className="relative mb-8">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 opacity-20 blur-xl animate-pulse"></div>
          <div className="relative bg-white border border-slate-200/80 p-6 rounded-full flex items-center justify-center shadow-lg shadow-rose-100">
            <Play className="w-14 h-14 text-rose-600 fill-rose-600/10 translate-x-[2px]" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-sans font-extrabold tracking-tight mb-4 text-slate-900">
          Your Private Google Drive Gallery, <br className="hidden md:inline" />
          <span className="bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">Styled Like YouTube</span>
        </h1>
        
        <p className="text-slate-600 text-lg max-w-2xl mb-10 leading-relaxed">
          Connect your Google account to instantly transform your private folders into a personalized, high-performance streaming theater. Browse images and play videos directly from Google Drive.
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mb-12 text-left">
          <div className="bg-white border border-slate-200/60 p-5 rounded-xl shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Video className="w-5 h-5 text-rose-500" />
              <h3 className="font-semibold text-slate-800">Video Player</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Streams mp4, webm, and other videotypes with custom player engagement stats and local comments.
            </p>
          </div>
          
          <div className="bg-white border border-slate-200/60 p-5 rounded-xl shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Image className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-800">Image Gallery</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Opens raw full-screen high-res images, with EXIF scale and customizable zoom presentation controls.
            </p>
          </div>

          <div className="bg-white border border-slate-200/60 p-5 rounded-xl shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <FolderHeart className="w-5 h-5 text-rose-400" />
              <h3 className="font-semibold text-slate-800">Folders to Playlists</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Automatically indexes subheaders as customizable playlists, channels, or tags, sorted dynamically.
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg max-w-md text-sm font-sans flex items-start gap-3">
            <Shield className="w-5 h-5 flex-shrink-0 text-red-650 mt-0.5" />
            <div className="text-left">
              <span className="font-bold">Authorization Error:</span> {error}
            </div>
          </div>
        )}

        {/* Standard Google Sign In Button */}
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-mono">Contacting Google Security API...</p>
          </div>
        ) : (
          <button 
            onClick={onLogin}
            className="group relative cursor-pointer outline-none bg-slate-900 text-white tracking-wide font-sans font-medium px-6 py-3.5 rounded-full flex items-center justify-center gap-3 hover:bg-slate-800 transition-all duration-300 shadow-md active:scale-95 border border-slate-800"
            id="gsi-login-btn"
          >
            <div className="w-5 h-5">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span className="font-semibold text-sm">Sign in with Google</span>
          </button>
        )}
      </div>

      {/* Footer Credentials */}
      <div className="p-6 border-t border-slate-200/60 bg-white text-center text-xs text-slate-500 font-sans">
        This application uses Google Drive secure authentication to read files, with permission. All OAuth credentials, access tokens, and browsing indices are hosted entirely in memory and your browser session. Built for raw, private theater playback.
      </div>
    </div>
  );
}
