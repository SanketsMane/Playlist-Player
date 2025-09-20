'use client';

import { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Clock, Maximize, Minimize } from 'lucide-react';
import { toast } from 'sonner';

interface Video {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  isCompleted: boolean;
  position: number;
}

interface VideoPlayerProps {
  video: Video | null;
  onVideoComplete: (videoId: string) => void;
  onVideoSelect: (video: Video) => void;
  playlistVideos: Video[];
}

export default function VideoPlayer({ 
  video, 
  onVideoComplete, 
  onVideoSelect, 
  playlistVideos 
}: VideoPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleVideoEnd = () => {
    if (video) {
      onVideoComplete(video.videoId);
    }
  };

  const handleVideoReady = () => {
    // Video is ready to play
  };

  const handleVideoPlay = () => {
    // Video started playing
  };

  const handleVideoPause = () => {
    // Video paused
  };

  const toggleFullscreen = () => {
    const videoContainer = document.getElementById('basic-youtube-player-container');
    if (!videoContainer) return;
    
    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          toast.info('Press ESC to exit fullscreen');
        })
        .catch((err: Error) => {
          console.error('Error attempting to enable fullscreen:', err);
          toast.error('Fullscreen not supported');
        });
    } else {
      document.exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch((err: Error) => {
          console.error('Error attempting to exit fullscreen:', err);
        });
    }
  };

  const opts = {
    height: '400',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
      fs: 1, // Enable fullscreen
      enablejsapi: 1, // Enable JavaScript API
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video Player */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-0">
            {video ? (
              <div 
                id="basic-youtube-player-container"
                className={`relative bg-black ${isFullscreen ? 'fullscreen-video' : ''}`}
              >
                <div className="aspect-video">
                  <YouTube
                    videoId={video.videoId}
                    opts={isFullscreen ? { ...opts, height: '100%', width: '100%' } : opts}
                    onEnd={handleVideoEnd}
                    onReady={handleVideoReady}
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    className="w-full h-full"
                  />
                </div>
                
                {/* Fullscreen Toggle Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">Select a video to start watching</p>
              </div>
            )}
          </CardContent>
          
          {video && (
            <CardHeader>
              <CardTitle className="flex items-start justify-between gap-4">
                <span className="flex-1">{video.title}</span>
                <Button
                  onClick={() => onVideoComplete(video.videoId)}
                  variant={video.isCompleted ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {video.isCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4" />
                      Mark Complete
                    </>
                  )}
                </Button>
              </CardTitle>
              {video.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {video.description}
                </p>
              )}
            </CardHeader>
          )}
        </Card>
      </div>

      {/* Video List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Chapters</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {playlistVideos.map((playlistVideo, index) => (
                <button
                  key={playlistVideo.videoId}
                  onClick={() => onVideoSelect(playlistVideo)}
                  className={`w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                    video?.videoId === playlistVideo.videoId ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {playlistVideo.isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {index + 1}. {playlistVideo.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {playlistVideo.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}