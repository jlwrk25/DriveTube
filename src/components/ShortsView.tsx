/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Loader2, 
  ChevronUp, 
  ChevronDown, 
  X,
  ThumbsUp,
  Sparkles,
  Music,
  CheckCircle,
  Clapperboard
} from 'lucide-react';
import { DriveFile, Comment } from '../types';
import { getMediaEngagement, downloadFileBlob, getRelativeTime } from '../lib/drive';

interface ShortsViewProps {
  files: DriveFile[];
  accessToken: string;
  favorites: string[];
  onToggleFavorite: (e: React.MouseEvent, fileId: string) => void;
  onSelectMedia: (file: DriveFile) => void;
  userDisplayName?: string | null;
  userPhotoURL?: string | null;
}

export default function ShortsView({
  files,
  accessToken,
  favorites,
  onToggleFavorite,
  onSelectMedia,
  userDisplayName,
  userPhotoURL
}: ShortsViewProps) {
  // Filter for video files under 4 minutes (240,000 ms)
  const shorts = files.filter(f => {
    const isVideo = f.mimeType.startsWith('video/');
    if (!isVideo) return false;
    
    if (f.videoMediaMetadata?.durationMillis) {
      const durationMs = parseInt(f.videoMediaMetadata.durationMillis, 10);
      return durationMs <= 240000; // <= 4 minutes
    }
    // If no duration is listed, we include it as a potential short (YouTube Shorts are usually up to 60s, here we permit up to 4m as fallback)
    return true;
  });

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showMuteSplash, setShowMuteSplash] = useState<boolean>(false);
  const [showPlaySplash, setShowPlaySplash] = useState<boolean>(false);
  
  // Comments panel state
  const [showComments, setShowComments] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeFile = shorts[activeIndex];

  // Load the active Short blob whenever activeIndex changes
  useEffect(() => {
    if (!activeFile) return;

    let active = true;
    setLoading(true);
    setDownloadProgress(0);
    setError(null);
    setIsPlaying(true);

    // Revoke previous blob url to prevent memory leaks
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }

    async function loadShortBlob() {
      try {
        const url = await downloadFileBlob(activeFile.id, accessToken, (percent) => {
          if (active) setDownloadProgress(percent);
        });
        if (active) {
          setBlobUrl(url);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Short blob download failure:', err);
        if (active) {
          setError(err.message || 'Codec or connection issue.');
          setLoading(false);
          // Fallback to webContentLink
          if (activeFile.webContentLink) {
            setBlobUrl(activeFile.webContentLink);
          }
        }
      }
    }

    loadShortBlob();

    // Load comments for the active file
    const savedComments = localStorage.getItem(`comments_${activeFile.id}`);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    } else {
      const initial: Comment[] = [
        {
          id: `short-comment-1-${activeFile.id}`,
          fileId: activeFile.id,
          authorName: 'Shorts Curator',
          content: `Wow! This short clip looks amazing in vertical flow! 🚀`,
          timestamp: Date.now() - 3600000 * 2, // 2 hours ago
          likes: 24
        }
      ];
      setComments(initial);
      localStorage.setItem(`comments_${activeFile.id}`, JSON.stringify(initial));
    }

    return () => {
      active = false;
    };
  }, [activeIndex, activeFile?.id]);

  // Handle keys and wheel for snapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showComments) return; // ignore if typing in comments
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, shorts.length, showComments]);

  // Clean blob on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const handleNext = () => {
    if (activeIndex < shorts.length - 1) {
      setActiveIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMuted(prev => !prev);
    setShowMuteSplash(true);
    setTimeout(() => {
      setShowMuteSplash(false);
    }, 800);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    setShowPlaySplash(true);
    setTimeout(() => {
      setShowPlaySplash(false);
    }, 800);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      fileId: activeFile.id,
      authorName: userDisplayName || 'Private Archivist',
      authorPhotoUrl: userPhotoURL || undefined,
      content: commentInput.trim(),
      timestamp: Date.now(),
      likes: 0
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem(`comments_${activeFile.id}`, JSON.stringify(updated));
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
    localStorage.setItem(`comments_${activeFile.id}`, JSON.stringify(updated));
  };

  if (shorts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50 text-slate-500 font-sans h-full">
        <div className="p-4 rounded-full bg-rose-50 text-rose-500 mb-4 animate-pulse">
          <Clapperboard className="w-12 h-12 stroke-1" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No Shorts Found</h3>
        <p className="text-sm text-slate-400 max-w-sm mt-2 leading-relaxed">
          Google DriveTube parses video files under 4 minutes as vertical Shorts. Add short clips to your drive to watch them here!
        </p>
      </div>
    );
  }

  const engagement = getMediaEngagement(activeFile);
  const isFav = favorites.includes(activeFile.id);

  return (
    <div className="flex-1 bg-slate-900 flex items-center justify-center relative overflow-hidden font-sans select-none w-full h-[calc(100vh-64px)] md:h-[calc(100vh-56px)]" id="shorts-immersive-view">
      
      {/* Background Ambience Glow */}
      <div className="absolute inset-0 bg-radial from-slate-800 to-slate-950 opacity-90 pointer-events-none z-0" />

      {/* Navigation Arrow buttons overlay */}
      <div className="absolute left-6 hidden md:flex flex-col gap-3 z-10">
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className={`p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white shadow-lg cursor-pointer transition-all active:scale-95 border border-slate-700/55 ${activeIndex === 0 ? 'opacity-20 cursor-not-allowed' : ''}`}
          title="Previous Short"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          disabled={activeIndex === shorts.length - 1}
          className={`p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white shadow-lg cursor-pointer transition-all active:scale-95 border border-slate-700/55 ${activeIndex === shorts.length - 1 ? 'opacity-20 cursor-not-allowed' : ''}`}
          title="Next Short"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Main Core View Area */}
      <div className="relative flex flex-col md:flex-row items-center gap-6 z-10 w-full max-w-3xl justify-center h-full max-h-[85vh] p-2 md:p-0">
        
        {/* Interactive Aspect-Ratio constrained Video Frame Container */}
        <div 
          onClick={togglePlay}
          className="relative aspect-[9/16] h-full max-h-[75vh] md:max-h-[80vh] w-auto max-w-[390px] md:max-w-[420px] bg-black rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex items-center justify-center cursor-pointer group"
          id="shorts-video-viewport"
        >
          {loading ? (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="relative mb-4 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-slate-800 border-t-rose-500 rounded-full animate-spin"></div>
                <Sparkles className="w-6 h-6 text-rose-500 absolute animate-pulse" />
              </div>
              <h4 className="font-bold text-sm tracking-wide text-zinc-100">Downloading Clip Segment</h4>
              <div className="w-36 bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-zinc-500 mt-2">{downloadProgress}% ready</span>
            </div>
          ) : error ? (
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-rose-400">
              <Loader2 className="w-10 h-10 animate-spin text-rose-500 mb-3" />
              <h4 className="font-extrabold text-sm text-zinc-200">Decoding Stream Buffer</h4>
              <p className="text-[11px] text-zinc-400 max-w-[80%] mt-2 leading-relaxed">
                Browser limits may reject raw files. Play securely on Google Drive if buffering freezes.
              </p>
              <a 
                href={activeFile.webViewLink}
                target="_blank"
                rel="noopener"
                className="mt-4 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-full flex items-center gap-1.5 cursor-pointer shadow-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open in GDrive</span>
              </a>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={blobUrl || undefined}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          )}

          {/* Instant Volume / Play overlays animation splashes */}
          <AnimatePresence>
            {showMuteSplash && (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                <div className="p-4 rounded-full bg-black/60 text-white backdrop-blur-xs flex items-center justify-center">
                  {isMuted ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
                </div>
              </motion.div>
            )}

            {showPlaySplash && (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                <div className="p-4 rounded-full bg-black/60 text-white backdrop-blur-xs flex items-center justify-center">
                  {isPlaying ? <Play className="w-8 h-8 fill-current ml-1" /> : <Pause className="w-8 h-8 fill-current" />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standard Mute overlay button (top right corner) */}
          <button
            onClick={toggleMute}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs z-10 cursor-pointer border border-white/5 transition-all shadow-sm"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-450" /> : <Volume2 className="w-4 h-4 text-emerald-450" />}
          </button>

          {/* Immersive overlay metadata details panel (bottom) */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end pt-24 font-sans select-none z-10 text-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-bold text-xs ring-1 ring-white/20 select-none">
                {engagement.channelName.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs text-zinc-100 flex items-center gap-1">
                  <span>{engagement.channelName}</span>
                  <CheckCircle className="w-3 h-3 text-rose-500 fill-rose-500/10 shrink-0" />
                </span>
                <span className="text-[9px] text-zinc-400 truncate">{engagement.subscribers}</span>
              </div>
            </div>

            {/* Title / Description */}
            <h1 className="text-xs md:text-sm font-semibold leading-relaxed text-slate-100 line-clamp-2 select-text font-sans mb-1 break-words drop-shadow-md">
              {activeFile.name}
            </h1>

            {/* Ambient Sound Icon overlay */}
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
              <Music className="w-3 h-3 text-rose-450 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="truncate select-all">{activeFile.name.replace(/\.[^/.]+$/, "")} original track</span>
            </div>
          </div>
        </div>

        {/* Vertical floating toolbar action buttons (right of the view) */}
        <div className="flex md:flex-col items-center justify-around md:justify-center gap-4 py-2 px-4 shadow-xl md:py-4 md:px-0 text-white rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xs max-w-full md:w-16 shrink-0" id="shorts-action-floater">
          
          {/* Like / Favorite Button */}
          <div className="flex flex-col items-center gap-1 group">
            <button
              onClick={(e) => onToggleFavorite(e, activeFile.id)}
              className={`p-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-90 cursor-pointer ${isFav ? 'bg-rose-50/10 text-rose-500 border border-rose-500/20' : 'bg-slate-800/60 text-slate-300 hover:text-white border border-transparent'}`}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <span className="text-[10px] text-slate-400 font-bold font-sans">
              {isFav ? 'Liked' : engagement.likesStr}
            </span>
          </div>

          {/* Comments Panel Slider toggle */}
          <div className="flex flex-col items-center gap-1 group">
            <button
              onClick={() => setShowComments(prev => !prev)}
              className={`p-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-90 cursor-pointer ${showComments ? 'bg-rose-50/10 text-rose-500 border border-rose-500/20' : 'bg-slate-800/60 text-slate-300 hover:text-white border border-transparent'}`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <span className="text-[10px] text-slate-400 font-bold font-sans">
              {comments.length}
            </span>
          </div>

          {/* Copy original reference file link */}
          <div className="flex flex-col items-center gap-1 group">
            <button
              onClick={() => {
                navigator.clipboard.writeText(activeFile.webViewLink || '');
                alert('Copied Drive path links to your clipboard!');
              }}
              className="p-3 rounded-full bg-slate-800/60 text-slate-300 hover:text-white border border-transparent transition-all duration-200 hover:scale-105 active:scale-90 cursor-pointer"
              title="Copy link"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <span className="text-[10px] text-slate-400 font-bold font-sans">Share</span>
          </div>

          {/* External original drive resource open */}
          <div className="flex flex-col items-center gap-1 group">
            <a
              href={activeFile.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-slate-800/60 text-slate-300 hover:text-white border border-transparent transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
              title="Open inside Google Drive"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <span className="text-[10px] text-slate-400 font-bold font-sans">Drive</span>
          </div>
        </div>
      </div>

      {/* Floating sliding drawer for comments inside shorts view */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute top-0 right-0 h-full w-full md:w-80 bg-white shadow-2xl border-l border-slate-250/30 flex flex-col z-30 font-sans text-slate-800"
            id="shorts-comments-panel"
          >
            {/* Comments Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="font-extrabold text-sm text-slate-900 leading-snug">Comments</h3>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Local Sandbox Reviews</span>
              </div>
              <button
                onClick={() => setShowComments(false)}
                className="p-1 px-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List and form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-2 pb-5 custom-scrollbar">
              {comments.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  Be the first to review this short! Write a post below.
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5 text-xs animate-in fade-in leading-relaxed">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 font-extrabold text-[10px] text-slate-500 border border-slate-200">
                      {comment.authorPhotoUrl ? (
                        <img src={comment.authorPhotoUrl} alt="profile" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        comment.authorName.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 font-bold">
                        <span className="text-slate-800">{comment.authorName}</span>
                        <span className="text-slate-400 text-[9px] font-normal">{getRelativeTime(new Date(comment.timestamp).toISOString())}</span>
                      </div>
                      <p className="text-slate-650 pr-1 break-words leading-normal select-text whitespace-pre-wrap">{comment.content}</p>
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-rose-600 mt-1 cursor-pointer transition-colors text-[10px] select-none"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{comment.likes}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comments Field input box */}
            <form onSubmit={handlePostComment} className="p-3 border-t border-slate-100 bg-slate-50 flex items-end gap-2 shrink-0">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add a public short review..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-rose-500 placeholder-slate-400 min-w-0"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold font-sans transition-all shrink-0 ${commentInput.trim() ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer active:scale-95 shadow-xs' : 'bg-slate-205 text-slate-400 cursor-not-allowed'}`}
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
