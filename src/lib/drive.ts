/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DriveFile, DriveFileListResponse } from '../types';

/**
 * Fetches files and folders inside a given Google Drive folder.
 */
export async function fetchFolderContents(
  folderId: string,
  accessToken: string,
  pageToken?: string
): Promise<DriveFileListResponse> {
  const fields = 'nextPageToken,files(id,name,mimeType,thumbnailLink,webContentLink,webViewLink,size,createdTime,videoMediaMetadata,imageMediaMetadata)';
  
  // Query to get all items inside the specific folder that are not trashed,
  // including folders, images, and videos.
  const query = `'${folderId}' in parents and trashed = false and (mimeType = 'application/vnd.google-apps.folder' or mimeType contains 'video/' or mimeType contains 'image/')`;
  
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=100${pageToken ? `&pageToken=${pageToken}` : ''}`;
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch folder contents: ${res.statusText}`);
  }
  
  return res.json();
}

/**
 * Fetches all media files (images/videos) in the folder AND nested folders recursively
 * in case the user has a sub-folder structure.
 */
export async function fetchFileMetadata(
  fileId: string,
  accessToken: string
): Promise<DriveFile> {
  const fields = 'id,name,mimeType,thumbnailLink,webContentLink,webViewLink,size,createdTime,videoMediaMetadata,imageMediaMetadata';
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=${encodeURIComponent(fields)}`;
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch file metadata: ${res.statusText}`);
  }
  
  return res.json();
}

/**
 * Downloads a file as a blob using stream reader to track progress percentage.
 */
export async function downloadFileBlob(
  fileId: string,
  accessToken: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to download binary file: ${response.statusText}`);
  }
  
  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  
  if (total === 0 || !response.body) {
    // Fallback if content-length is not present or stream is not readable
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
  
  const reader = response.body.getReader();
  let loaded = 0;
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      loaded += value.length;
      if (onProgress && total > 0) {
        onProgress(Math.round((loaded / total) * 100));
      }
    }
  }
  
  const blob = new Blob(chunks, { type: response.headers.get('content-type') || undefined });
  return URL.createObjectURL(blob);
}

/**
 * Generates regular mock views, likes, and channels based on the Google Drive file hash.
 * This makes the interface feel EXACTLY like YouTube while staying consistent.
 */
export function getMediaEngagement(file: DriveFile) {
  // Use file id as seed for deterministic random-like values
  let hash = 0;
  for (let i = 0; i < file.id.length; i++) {
    hash = file.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const absHash = Math.abs(hash);
  const views = (absHash % 480) * 1200 + 450; // Between 450 and ~570k views
  const likes = Math.round(views * (0.02 + (absHash % 8) / 100)); // ~2% to 10% of views
  
  // Format views
  let viewsStr = '';
  if (views >= 1000000) {
    viewsStr = `${(views / 1000000).toFixed(1)}M views`;
  } else if (views >= 1000) {
    viewsStr = `${Math.round(views / 1000)}K views`;
  } else {
    viewsStr = `${views} views`;
  }

  // Format likes
  let likesStr = likes.toLocaleString();
  if (likes >= 1000) {
    likesStr = `${(likes / 1000).toFixed(1)}K`;
  }
  
  // Channel name based on the upload time/size or folders
  const creators = [
    'Private Archive',
    'Self Collection',
    'Media Space',
    'Direct Stream',
    'Studio Vault',
    'My Feed',
    'Personal Vault'
  ];
  const channelName = creators[absHash % creators.length];
  const subscribers = `${((absHash % 900) + 12).toLocaleString()} subscribers`;
  
  return {
    views,
    viewsStr,
    likes,
    likesStr,
    channelName,
    subscribers
  };
}

/**
 * Helper to humanize Drive createdTime
 */
export function getRelativeTime(dateString?: string): string {
  if (!dateString) return 'Just now';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 365) {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
  if (diffDays > 30) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins > 0) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  }
  
  return 'Just now';
}

/**
 * Format milliseconds to YouTube duration format (e.g., 5:14 or 1:04:30)
 */
export function formatDuration(durationMillis?: string): string {
  if (!durationMillis) return '';
  const totalSecs = Math.floor(parseInt(durationMillis, 10) / 1000);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
