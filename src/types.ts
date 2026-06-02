/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
  webViewLink?: string;
  size?: string;
  createdTime?: string;
  videoMediaMetadata?: {
    durationMillis?: string;
    width?: number;
    height?: number;
  };
  imageMediaMetadata?: {
    width?: number;
    height?: number;
    location?: {
      latitude?: number;
      longitude?: number;
      altitude?: number;
    };
  };
}

export interface DriveFileListResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

export interface Comment {
  id: string;
  fileId: string;
  authorName: string;
  authorPhotoUrl?: string;
  content: string;
  timestamp: number; // unix epoch ms
  likes: number;
}

export interface PlaylistItem {
  id: string;
  name: string;
  fileIds: string[];
  createdTime: number;
}

export interface UserPreferences {
  favorites: string[]; // fileIds
  watchHistory: string[]; // fileIds
  likedMedia: string[]; // fileIds
}
