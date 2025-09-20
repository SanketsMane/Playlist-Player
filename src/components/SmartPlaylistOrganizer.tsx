'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Folder, PlayCircle, Star } from 'lucide-react';

interface Playlist {
  _id: string;
  playlistId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  videoCount: number;
  isStarred?: boolean;
  folderId?: string;
}

interface Folder {
  _id: string;
  name: string;
  description?: string;
}

interface SmartPlaylistOrganizerProps {
  playlists: Playlist[];
  folders: Folder[];
  onCreateFolder: (name: string, description: string, color: string) => Promise<void>;
  onUpdateFolder: (folderId: string, name: string, description: string, color: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onMovePlaylistToFolder: (playlistId: string, folderId: string) => Promise<void>;
  onDeletePlaylist: (playlistId: string) => Promise<void>;
  onTogglePlaylistStar: (playlistId: string) => Promise<void>;
  onPlayPlaylist: (playlistId: string) => void;
}

const SmartPlaylistOrganizer: React.FC<SmartPlaylistOrganizerProps> = ({
  playlists,
  folders,
  onMovePlaylistToFolder,
  onPlayPlaylist,
  onTogglePlaylistStar,
}) => {
  // Group playlists by folder
  const playlistsByFolder: Record<string, Playlist[]> = {
    unorganized: playlists.filter(p => !p.folderId),
  };
  
  // Add folder-specific playlists
  folders.forEach(folder => {
    playlistsByFolder[folder._id] = playlists.filter(p => p.folderId === folder._id);
  });

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const playlistId = draggableId;
    const targetFolderId = destination.droppableId === 'unorganized' ? '' : destination.droppableId;

    onMovePlaylistToFolder(playlistId, targetFolderId);
  };

  const PlaylistCard = ({ playlist, index }: { playlist: Playlist; index: number }) => (
    <Draggable draggableId={playlist._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 ${snapshot.isDragging ? 'opacity-50' : ''}`}
        >
          <Card className="hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                  {playlist.thumbnail ? (
                    <img
                      src={playlist.thumbnail}
                      alt={playlist.title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <PlayCircle className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate text-gray-900 dark:text-gray-100">{playlist.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{playlist.videoCount} videos</p>
                </div>
                <div className="flex items-center gap-2">
                  {playlist.isStarred && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayPlaylist(playlist._id);
                    }}
                  >
                    <PlayCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Playlist Organization</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Drag playlists between folders to organize them
          </p>
        </div>

        {/* Folders */}
        {folders.map((folder) => (
          <Card key={folder._id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">{folder.name}</CardTitle>
                <Badge variant="secondary">
                  {playlistsByFolder[folder._id]?.length || 0} playlists
                </Badge>
              </div>
              {folder.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {folder.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <Droppable droppableId={folder._id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[120px] p-4 rounded-lg border-2 border-dashed transition-colors ${
                      snapshot.isDraggingOver
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {playlistsByFolder[folder._id]?.length > 0 ? (
                      playlistsByFolder[folder._id].map((playlist, index) => (
                        <PlaylistCard key={playlist._id} playlist={playlist} index={index} />
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-24 text-gray-500 dark:text-gray-400">
                        <p>Drop playlists here to organize them</p>
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>
        ))}

        {/* Unorganized Playlists */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Unorganized Playlists</CardTitle>
              <Badge variant="secondary">
                {playlistsByFolder.unorganized?.length || 0} playlists
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Droppable droppableId="unorganized">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[120px] p-4 rounded-lg border-2 border-dashed transition-colors ${
                    snapshot.isDraggingOver
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {playlistsByFolder.unorganized?.length > 0 ? (
                    playlistsByFolder.unorganized.map((playlist, index) => (
                      <PlaylistCard key={playlist._id} playlist={playlist} index={index} />
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-24 text-gray-500 dark:text-gray-400">
                      <p>No unorganized playlists</p>
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </CardContent>
        </Card>
      </div>
    </DragDropContext>
  );
};

export default SmartPlaylistOrganizer;
