'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, User, Play } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';
import VideoPlayer from '@/components/VideoPlayer';
import EnhancedVideoPlayer from '@/components/EnhancedVideoPlayer';
import Notes from '@/components/Notes';
import ProgressBar from '@/components/ProgressBar';

interface Video {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  isCompleted: boolean;
  position: number;
}

interface Playlist {
  _id: string;
  playlistId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  totalVideos: number;
  completedVideos: number;
  videos: Video[];
}

interface Note {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function PlaylistView() {
  const router = useRouter();
  const params = useParams();
  const playlistId = params.id as string;

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId]);

  useEffect(() => {
    if (currentVideo) {
      fetchNotes();
    }
  }, [currentVideo]);

  const fetchPlaylist = async () => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}`);
      if (response.ok) {
        const data = await response.json();
        setPlaylist(data.playlist);
        // Set first incomplete video as current, or first video if all complete
        const firstIncomplete = data.playlist.videos.find((v: Video) => !v.isCompleted);
        setCurrentVideo(firstIncomplete || data.playlist.videos[0] || null);
      } else {
        toast.error('Failed to fetch playlist');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
      toast.error('Failed to fetch playlist');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotes = async () => {
    if (!currentVideo) return;
    
    try {
      const response = await fetch(`/api/notes?playlistId=${playlist?.playlistId}&videoId=${currentVideo.videoId}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleVideoComplete = async (videoId: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      });

      if (response.ok) {
        toast.success('Video marked as complete!');
        fetchPlaylist(); // Refresh playlist data
      } else {
        toast.error('Failed to mark video as complete');
      }
    } catch (error) {
      console.error('Error marking video complete:', error);
      toast.error('Failed to mark video as complete');
    }
  };

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video);
  };

  const handleAddNote = async (content: string) => {
    if (!currentVideo || !playlist) return;

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistId: playlist.playlistId,
          videoId: currentVideo.videoId,
          content,
        }),
      });

      if (response.ok) {
        toast.success('Note added successfully!');
        fetchNotes();
      } else {
        toast.error('Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const handleUpdateNote = async (noteId: string, content: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        toast.success('Note updated successfully!');
        fetchNotes();
      } else {
        toast.error('Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Note deleted successfully!');
        fetchNotes();
      } else {
        toast.error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleProgressUpdate = async (videoId: string, currentTime: number, duration: number) => {
    // Update video progress (could save to backend for resume watching feature)
    // For now, we'll just log the progress
    if (duration > 0) {
      const progress = (currentTime / duration) * 100;
      // You could save this progress to localStorage or send to backend
      localStorage.setItem(`video_progress_${videoId}`, JSON.stringify({
        currentTime,
        duration,
        progress,
        lastWatched: new Date().toISOString()
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Playlist not found</h2>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                  {playlist.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="h-3 w-3" />
                  <span>{playlist.channelTitle}</span>
                  <span>•</span>
                  <Play className="h-3 w-3" />
                  <span>{playlist.totalVideos} videos</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressBar
                completedVideos={playlist.completedVideos}
                totalVideos={playlist.totalVideos}
                title="Overall Progress"
              />
            </CardContent>
          </Card>
        </div>

        {/* Video Player Section */}
        <div className="mb-8">
          <EnhancedVideoPlayer
            video={currentVideo}
            onVideoComplete={handleVideoComplete}
            onVideoSelect={handleVideoSelect}
            playlistVideos={playlist.videos}
            onProgressUpdate={handleProgressUpdate}
          />
        </div>

        {/* Notes Section */}
        {currentVideo && (
          <div className="mb-8">
            <Notes
              notes={notes}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
            />
          </div>
        )}
      </main>
    </div>
  );
}