/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ExternalLink, Play, Upload, FolderPlus, Film, Compass } from 'lucide-react';

interface UploadWizardProps {
  onClose: () => void;
  folderId: string;
}

export default function UploadWizard({ onClose, folderId }: UploadWizardProps) {
  const folderUrl = `https://drive.google.com/drive/folders/${folderId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans" id="upload-wizard-modal">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-rose-500" />
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Add Content Guide</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 leading-relaxed text-sm">
          <p className="text-slate-600">
            This YouTube gallery is dynamically synchronized with your personal Google Drive folder. Any video or image you put in there appears instantly on your screen!
          </p>

          {/* Steps */}
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 font-bold font-mono text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-rose-100">
                1
              </div>
              <div>
                <h4 className="font-bold text-slate-850">Open Your Google Drive Folder</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Click the portal link below to navigate to your cloud folder. Save it to your Google Drive favorites.
                </p>
                <a 
                  href={folderUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-xs text-rose-650 font-bold rounded-lg mt-2 cursor-pointer border border-slate-200"
                >
                  <span>Go to Folder</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 font-bold font-mono text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-rose-100">
                2
              </div>
              <div>
                <h4 className="font-bold text-slate-850">Upload Media Files</h4>
                <p className="text-xs text-slate-500 mt-1 flex flex-wrap gap-1 items-center">
                  Drag & drop media files directly. We fully support standard web-friendly codecs:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-slate-50 border border-slate-150 rounded font-mono text-xs text-slate-605 flex items-center gap-1">
                    <Film className="w-3 h-3 text-rose-500" /> WebM / MP4
                  </span>
                  <span className="px-2 py-0.5 bg-slate-50 border border-slate-150 rounded font-mono text-xs text-slate-605 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-amber-500" /> JPEG / PNG / GIF
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 font-bold font-mono text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-rose-100">
                3
              </div>
              <div>
                <h4 className="font-bold text-slate-850">Create Subfolders as Playlists</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Create subfolders inside the root folder. E.g. "Family Logs" or "Vacation Images". The app parses them as separate Channels or Playlists in your sidebar navigation!
                </p>
              </div>
            </div>
          </div>

          {/* Codec warning helper */}
          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
            <h5 className="text-xs font-bold font-mono text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span>Decoder Alert: Format Compatibility</span>
            </h5>
            <p className="text-[11px] text-amber-900/80 leading-normal font-sans">
              Chrome, Safari, and Firefox support native streaming of H.264 MP4 or WebM containers. Legacy avi, mkv, or raw mov segments may fail client decryption due to browser policies. If you hit a decoding hurdle, clicking "Open in Google Drive" plays them via GDrive's cloud transcoder!
            </p>
          </div>
        </div>

        {/* Footer info control */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-full cursor-pointer hover:bg-slate-800 active:scale-95 transition-all"
          >
            Got It, Go back!
          </button>
        </div>
      </div>
    </div>
  );
}
