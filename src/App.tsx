/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout } from './lib/firebase';
import { fetchFolderContents } from './lib/drive';
import { DriveFile } from './types';

// Importing Custom UI Elements
import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoGrid from './components/VideoGrid';
import WatchView from './components/WatchView';
import UploadWizard from './components/UploadWizard';

// The absolute root folder ID provided by the user
const ROOT_FOLDER_ID = '1K5az6LdVNCA0a5_06PUCaPlWoOVaDQHW';

export default function App() {
  // Authentication states
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Layout states
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showUploadWizard, setShowUploadWizard] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeChip, setActiveChip] = useState<string>('All');

  // Media files states
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [subfolders, setSubfolders] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [selectedMedia, setSelectedMedia] = useState<DriveFile | null>(null);

  // Local storage lists for Favorites and History
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('drive_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('drive_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Current playlist/navigation selection filter
  const [currentFilter, setFilter] = useState<{
    type: 'all' | 'video' | 'image' | 'folder' | 'favorites' | 'history';
    folderId?: string;
  }>({ type: 'all' });

  // Initialize Auth state listeners
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setAuthError(null);
        setIsLoadingAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsLoadingAuth(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync favorites in localstorage
  const handleToggleFavorite = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const up = prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId];
      localStorage.setItem('drive_favorites', JSON.stringify(up));
      return up;
    });
  };

  // Sync watch history and view state on selection
  const handleSelectMedia = (file: DriveFile) => {
    setSelectedMedia(file);
    if (!history.includes(file.id)) {
      setHistory((prev) => {
        const up = [file.id, ...prev.filter((id) => id !== file.id)].slice(0, 50); // limit 50 items
        localStorage.setItem('drive_history', JSON.stringify(up));
        return up;
      });
    }
  };

  // Load Folder Files
  useEffect(() => {
    if (!token) return;

    async function loadResources() {
      setIsLoadingFiles(true);
      try {
        // Decide what folder we are fetching
        const targetId = currentFilter.type === 'folder' && currentFilter.folderId 
          ? currentFilter.folderId 
          : ROOT_FOLDER_ID;

        const res = await fetchFolderContents(targetId, token);
        
        // Split subfolders and visual files
        const foldersList = res.files.filter((f) => f.mimeType === 'application/vnd.google-apps.folder');
        const mediaList = res.files.filter((f) => f.mimeType !== 'application/vnd.google-apps.folder');

        // Only update subfolders index on the root load, keeping Playlists sidebar pinned consistently
        if (targetId === ROOT_FOLDER_ID) {
          setSubfolders(foldersList);
        }

        setFiles(mediaList);
      } catch (err: any) {
        console.error('File index retrieval error:', err);
        // Treat unauthorized tokens by re-triggering authorization
        if (err.message && (err.message.includes('401') || err.message.includes('invalid_grant'))) {
          setAuthError('Authentication session expired. Please sign in with Google again.');
          setUser(null);
          setToken(null);
        }
      } finally {
        setIsLoadingFiles(false);
      }
    }

    loadResources();
  }, [token, currentFilter.type, currentFilter.folderId]);

  // Handle Login Event
  const handleLogin = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
      }
    } catch (err: any) {
      console.error('Auth failure:', err);
      setAuthError(err.message || 'Third-party authorization failed or dialog closed.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Handle Logout Event
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setSelectedMedia(null);
      setFiles([]);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Filter lists in memory for Favorites / History or Search Inputs
  const getRenderableFiles = () => {
    let result = [...files];

    // Filter by general layout filters
    if (currentFilter.type === 'video') {
      result = result.filter((f) => f.mimeType.startsWith('video/'));
    } else if (currentFilter.type === 'image') {
      result = result.filter((f) => f.mimeType.startsWith('image/'));
    } else if (currentFilter.type === 'favorites') {
      result = result.filter((f) => favorites.includes(f.id));
    } else if (currentFilter.type === 'history') {
      result = result.filter((f) => history.includes(f.id));
    }

    // Filter by top search bar query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((f) => f.name.toLowerCase().includes(query));
    }

    return result;
  };

  const renderableFiles = getRenderableFiles();

  // If loading auth state, show a clean, native loading screen
  if (isLoadingAuth && !user) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center text-white" id="initial-loading">
        <div className="relative mb-4">
          <div className="w-12 h-12 border-4 border-zinc-900 border-t-red-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-zinc-500 font-mono text-xs tracking-wider uppercase">Loading security state...</p>
      </div>
    );
  }

  // If not authenticated, render the stylish YouTube landing screen
  if (!user || !token) {
    return (
      <AuthScreen 
        onLogin={handleLogin} 
        isLoading={isLoadingAuth} 
        error={authError} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col font-sans" id="app-root-shell">
      {/* Dynamic YouTube Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenUploadWizard={() => setShowUploadWizard(true)}
      />

      <div className="flex flex-1 overflow-hidden" id="main-content-layout">
        {/* Dynamic Navigation Sidebar */}
        <Sidebar
          currentFilter={currentFilter}
          setFilter={(newFilter) => {
            setFilter(newFilter);
            setSelectedMedia(null); // Return to list view when changing catalog filters
          }}
          subfolders={subfolders}
          favoritesCount={favorites.filter(id => files.some(f => f.id === id)).length}
          historyCount={history.length}
          collapsed={sidebarCollapsed}
        />

        {/* Content Viewer Panel */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0f0f0f]">
          {selectedMedia ? (
            <WatchView
              file={selectedMedia}
              accessToken={token}
              allFiles={files}
              onSelectMedia={(newFile) => handleSelectMedia(newFile)}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onBackToGrid={() => setSelectedMedia(null)}
              userDisplayName={user.displayName}
              userPhotoURL={user.photoURL}
            />
          ) : (
            <VideoGrid
              files={renderableFiles}
              onSelectMedia={handleSelectMedia}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              isLoading={isLoadingFiles}
              activeChip={activeChip}
              setActiveChip={setActiveChip}
            />
          )}
        </main>
      </div>

      {/* Upload Wizard Guide popup */}
      {showUploadWizard && (
        <UploadWizard 
          onClose={() => setShowUploadWizard(false)} 
          folderId={ROOT_FOLDER_ID} 
        />
      )}
    </div>
  );
}
