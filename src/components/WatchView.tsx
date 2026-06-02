/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Heart, 
  Share2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Loader2,
  ThumbsUp,
  Download,
  AlertTriangle,
  ImageIcon,
  Video as VideoIcon,
  Search,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';
import { DriveFile, Comment } from '../types';
import { getMediaEngagement, getRelativeTime, formatDuration, downloadFileBlob } from '../lib/drive';

interface WatchViewProps {
  file: DriveFile;
  accessToken: string;
  allFiles: DriveFile[];
  onSelectMedia: (file: DriveFile) => void;
  favorites: string[];
  onToggleFavorite: (e: React.MouseEvent, fileId: string) => void;
  onBackToGrid: () => void;
  userDisplayName?: string | null;
  userPhotoURL?: string | null;
}

export default function WatchView({
  file,
  accessToken,
  allFiles,
  onSelectMedia,
  favorites,
  onToggleFavorite,
  onBackToGrid,
  userDisplayName,
  userPhotoURL
}: WatchViewProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [descExpanded, setDescExpanded] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState<string>('');
  const [sidebarSearch, setSidebarSearch] = useState<string>('');
  
  // Custom video state or elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isVideo = file.mimeType.startsWith('video/');
  const engagement = getMediaEngagement(file);
  const isFav = favorites.includes(file.id);

  // Download media on select
  useEffect(() => {
    let active = true;
    setLoading(true);
    setDownloadProgress(0);
    setError(null);
    
    // Revoke old blob url
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }

    // Load media blob
    async function loadMedia() {
      try {
        const url = await downloadFileBlob(file.id, accessToken, (percent) => {
          if (active) setDownloadProgress(percent);
        });
        if (active) {
          setBlobUrl(url);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Blob loading error:', err);
        if (active) {
          setError(err.message || 'Could not download media file.');
          setLoading(false);
          // Fallback to webContentLink if available
          if (file.webContentLink) {
            setBlobUrl(file.webContentLink);
          }
        }
      }
    }
    
    loadMedia();
    
    // Auto-scroll to top when loading a new file
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Load comments from localStorage
    const savedComments = localStorage.getItem(`comments_${file.id}`);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    } else {
      // Create initial fake youtube-style comments based on file ID
      const initial: Comment[] = [
        {
          id: `comment-1-${file.id}`,
          fileId: file.id,
          authorName: 'Media Custodian',
          content: `Great quality resolution on ${file.name}! Thanks for hosting this in your private Google Drive vault. Playing flawlessly.`,
          timestamp: Date.now() - 3600000 * 24 * 3, // 3 days ago
          likes: 12
        },
        {
          id: `comment-2-${file.id}`,
          fileId: file.id,
          authorName: 'Cloud Archivist',
          content: 'The indexing structure is highly satisfying. Exactly what a personal private gallery hub needs!',
          timestamp: Date.now() - 3600000 * 4, // 4 hours ago
          likes: 4
        }
      ];
      setComments(initial);
      localStorage.setItem(`comments_${file.id}`, JSON.stringify(initial));
    }

    return () => {
      active = false;
    };
  }, [file.id]);

  // Clean elements on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      fileId: file.id,
      authorName: userDisplayName || 'Private Archivist',
      authorPhotoUrl: userPhotoURL || undefined,
      content: commentInput.trim(),
      timestamp: Date.now(),
      likes: 0
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem(`comments_${file.id}`, JSON.stringify(updated));
    setCommentInput('');
  };

  const handleLikeComment = (commentId: string) => {
    const updated = comments.map(c => {
      if (c.id === commentId) {
        return { ...c, likes: c.likes + 1 };
      }
      return c;
    });
    setComments(updated);
    localStorage.setItem(`comments_${file.id}`, JSON.stringify(updated));
  };

  // Recommendations: exclude active file, filter by query if typed
  const recommendations = allFiles
    .filter(f => f.id !== file.id)
    .filter(f => !sidebarSearch || f.name.toLowerCase().includes(sidebarSearch.toLowerCase()));

  // Humanize File Size
  const getFormattedSize = () => {
    if (!file.size) return 'Unknown size';
    const bytes = parseInt(file.size, 10);
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(2)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} Bytes`;
  };

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 flex flex-col lg:flex-row gap-6 p-4 md:p-6 overflow-y-auto select-none font-sans" id="watch-player-view">
      
      {/* Left panel: Media Player + details */}
      <div className="flex-1 max-w-5xl">
        {/* Cinema Stage Frame */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-200/60 group shadow-lg flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-zinc-950/40 w-full h-full absolute inset-0">
              <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-3" />
              <div className="text-zinc-200 font-bold mb-1">Downloading Secure Fragment</div>
              <div className="w-48 bg-zinc-800 h-2 rounded-full overflow-hidden mb-2">
                <div 
                  className="bg-rose-600 h-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-zinc-550 font-mono">{downloadProgress}% completed</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-zinc-950/80 w-full h-full absolute inset-0 text-red-400">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mb-3" />
              <div className="font-bold text-zinc-250 mb-1">Browser Playback Blocked</div>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed mb-4">
                This format or file cannot be decrypted locally. Standard browser filters might reject this codec.
              </p>
              <div className="flex gap-3">
                <a 
                  href={file.webViewLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Google Drive</span>
                </a>
                <button
                  onClick={onBackToGrid}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-full cursor-pointer"
                >
                  Back to Board
                </button>
              </div>
            </div>
          ) : isVideo ? (
            <video
              ref={videoRef}
              src={blobUrl || undefined}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center relative select-none overflow-auto custom-scrollbar p-2">
              <img
                src={blobUrl || undefined}
                alt={file.name}
                className="max-w-full max-h-full object-contain mix-blend-normal rounded-lg shadow-2xl scale-in-fade"
              />
            </div>
          )}
        </div>

        {/* Media Details header */}
        <h1 className="text-xl font-extrabold font-sans tracking-tight mt-4 text-slate-900 leading-snug break-words">
          {file.name}
        </h1>

        {/* Engagement and buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 pb-5 border-b border-slate-200/60">
          <div className="flex items-center gap-2.5">
            {/* Custom Fake Channel Avatar */}
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-sans font-extrabold text-sm border border-slate-100 shadow-inner`}>
              {engagement.channelName.charAt(0)}
            </div>
            
            <div>
              <div className="font-bold text-sm text-slate-900 flex items-center gap-1">
                <span>{engagement.channelName}</span>
                <CheckCircle className="w-3.5 h-3.5 text-rose-550 fill-rose-500/10" />
              </div>
              <div className="text-xs text-slate-500">{engagement.subscribers}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-sm">
            {/* Favorites Heart */}
            <button
              onClick={(e) => onToggleFavorite(e, file.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all cursor-pointer active:scale-95 ${isFav ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs'}`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{isFav ? 'Liked' : 'Like'}</span>
            </button>

            {/* Simulated Share link overlay */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(file.webViewLink || '');
                alert('Raw Google Drive file path copied to clipboard!');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-full text-slate-700 font-medium cursor-pointer transition-all active:scale-95 shadow-xs"
              title="Copy original link"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            {/* Direct external download file button */}
            {file.webContentLink && (
              <a
                href={file.webContentLink}
                download
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-full text-slate-700 font-medium cursor-pointer transition-all active:scale-95 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </a>
            )}

            {/* Back to feed button */}
            <button
              onClick={onBackToGrid}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-full cursor-pointer transition-all active:scale-95 shadow-xs"
            >
              Back to Catalog
            </button>
          </div>
        </div>

        {/* Dynamic Description Box */}
        <div 
          onClick={() => setDescExpanded(!descExpanded)}
          className="bg-white border border-slate-105 hover:border-slate-300 rounded-xl p-4 mt-4 text-sm font-sans transition-all cursor-pointer overflow-hidden relative shadow-xs"
        >
          <div className="flex items-center justify-between font-semibold text-slate-800 text-xs tracking-wide select-none">
            <div className="flex gap-4">
              <span>{engagement.viewsStr}</span>
              <span>•</span>
              <span>{getRelativeTime(file.createdTime)}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span>Metadata Properties</span>
              {descExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          <div className={`mt-2.5 text-slate-600 leading-relaxed font-mono text-xs space-y-2 select-text ${descExpanded ? '' : 'line-clamp-2'}`}>
            <p className="font-sans font-medium text-slate-800 leading-relaxed break-all font-mono">
              File ID: <span className="text-amber-600">{file.id}</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 pt-2 border-t border-slate-100 mt-2">
              <div className="flex justify-between border-b border-slate-100/70 pb-1">
                <span className="text-slate-400">Mime-Type:</span>
                <span className="text-slate-700">{file.mimeType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100/70 pb-1">
                <span className="text-slate-400">File Capacity:</span>
                <span className="text-slate-700">{getFormattedSize()}</span>
              </div>
              {file.createdTime && (
                <div className="flex justify-between border-b border-slate-100/70 pb-1">
                  <span className="text-slate-400">Indexed On:</span>
                  <span className="text-slate-700">{new Date(file.createdTime).toLocaleString()}</span>
                </div>
              )}
              {isVideo && file.videoMediaMetadata && (
                <div className="flex justify-between border-b border-slate-100/70 pb-1">
                  <span className="text-slate-400">Render Scope:</span>
                  <span className="text-slate-700">{file.videoMediaMetadata.width} x {file.videoMediaMetadata.height}</span>
                </div>
              )}
              {!isVideo && file.imageMediaMetadata && (
                <div className="flex justify-between border-b border-slate-100/70 pb-1">
                  <span className="text-slate-400">Image Scale:</span>
                  <span className="text-slate-700">{file.imageMediaMetadata.width} x {file.imageMediaMetadata.height}</span>
                </div>
              )}
            </div>
            
            {descExpanded && (
              <div className="pt-3 border-t border-slate-100 leading-relaxed font-sans text-xs text-slate-400">
                You are playing this asset within our secure iframe sandbox utilizing secure OAuth tokens generated directly from your personal Firebase account config. DriveTube secures your files strictly in-memory.
              </div>
            )}
          </div>
        </div>

        {/* Comments section */}
        <div className="mt-6 font-sans">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-lg font-bold text-slate-900">{comments.length} Comments</span>
            <span className="text-xs text-slate-500 bg-slate-100 border border-slate-205 px-2.5 py-1 rounded-full font-sans font-semibold">
              Local Sandbox Reviews
            </span>
          </div>

          <form onSubmit={handlePostComment} className="flex gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-rose-600 font-sans font-extrabold border border-slate-200 overflow-hidden text-xs">
              {userPhotoURL ? (
                <img src={userPhotoURL} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                (userDisplayName || 'User').charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex-1">
              <input
                type="text"
                placeholder="Add a public review or notes..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="w-full bg-transparent border-b border-slate-200 focus:border-slate-800 py-1.5 outline-none text-sm text-slate-800 placeholder-slate-450 font-sans"
              />
              <div className="flex justify-end gap-2 mt-2">
                {commentInput.trim() && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCommentInput('')}
                      className="px-3.5 py-1.5 rounded-full hover:bg-slate-100 text-slate-500 font-bold text-xs font-sans transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full cursor-pointer transition-all shadow-xs"
                    >
                      Comment
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 text-sm font-sans animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 font-extrabold text-xs text-slate-500 overflow-hidden border border-slate-200/50">
                  {comment.authorPhotoUrl ? (
                    <img src={comment.authorPhotoUrl} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    comment.authorName.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800 text-xs">{comment.authorName}</span>
                    <span className="text-slate-450 text-[10px]">{getRelativeTime(new Date(comment.timestamp).toISOString())}</span>
                  </div>
                  <p className="text-slate-650 text-sm leading-relaxed pr-2 break-words whitespace-pre-wrap">{comment.content}</p>
                  
                  <div className="flex items-center gap-4 mt-2 select-none">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className="flex items-center gap-1.5 text-slate-450 hover:text-rose-600 cursor-pointer text-xs font-sans"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {comment.likes > 0 && <span className="font-mono text-slate-600 font-bold">{comment.likes}</span>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: Recommended Items / Selection Sidebar */}
      <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-slate-200/60 pt-6 lg:pt-0 lg:pl-6">
        <h2 className="text-lg font-bold font-sans tracking-tight text-slate-800">
          Up Next (Folder Catalog)
        </h2>

        {/* Sidebar Mini-Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search custom selection..."
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            className="w-full bg-white border border-slate-200/80 rounded-xl py-2 pl-8 pr-4 text-xs text-slate-800 outline-none placeholder-slate-400 focus:border-rose-500 transition-all font-sans shadow-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Content list */}
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1 scrollbar-thin">
          {recommendations.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs italic font-sans bg-white rounded-xl border border-slate-200">
              No matching matching elements found in this folder list.
            </div>
          ) : (
            recommendations.map((recFile) => {
              const recIsVideo = recFile.mimeType.startsWith('video/');
              const recEngagement = getMediaEngagement(recFile);
              const recRelative = getRelativeTime(recFile.createdTime);

              return (
                <div
                  key={recFile.id}
                  onClick={() => onSelectMedia(recFile)}
                  className="flex gap-2.5 cursor-pointer group transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative w-32 md:w-36 aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-205 flex-shrink-0 shadow-xs hover:shadow-sm">
                    {recFile.thumbnailLink ? (
                      <img
                        src={recFile.thumbnailLink.replace(/=s\d+/, '=s180')}
                        alt={recFile.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100">
                        {recIsVideo ? (
                          <VideoIcon className="w-4 h-4 text-rose-500/80" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-amber-500/80" />
                        )}
                      </div>
                    )}
                    
                    {/* length / format chip */}
                    <div className="absolute bottom-1 right-1 px-1 bg-slate-900/90 text-[9px] text-white rounded font-mono font-bold">
                      {recIsVideo ? (
                        recFile.videoMediaMetadata?.durationMillis ? (
                          formatDuration(recFile.videoMediaMetadata.durationMillis)
                        ) : 'VIDEO'
                      ) : 'IMAGE'}
                    </div>
                  </div>

                  {/* Metadata Text sidebar layout */}
                  <div className="flex flex-col min-w-0 flex-1 leading-tight select-none">
                    <h2 className="text-slate-800 font-semibold text-xs line-clamp-2 md:text-sm group-hover:text-rose-600 transition-colors leading-snug break-words font-sans" title={recFile.name}>
                      {recFile.name}
                    </h2>

                    <span className="text-slate-500 text-[10px] mt-1 md:mt-1.5 truncate">
                      {recEngagement.channelName}
                    </span>

                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mt-0.5 truncate flex-wrap font-sans">
                      <span>{recEngagement.viewsStr}</span>
                      <span className="text-[7px] text-slate-200">•</span>
                      <span>{recRelative}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
