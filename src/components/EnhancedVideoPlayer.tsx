'use client';

import { useState, useRef, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Settings, 
  Maximize, 
  Minimize, 
  PictureInPicture, 
  Repeat, 
  Repeat1, 
  SkipBack, 
  SkipForward,
  RotateCcw,
  RotateCw,
  Info
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  onProgressUpdate?: (videoId: string, currentTime: number, duration: number) => void;
}

type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;
type LoopMode = 'none' | 'single' | 'playlist';

export default function EnhancedVideoPlayer({ 
  video, 
  onVideoComplete, 
  onVideoSelect, 
  playlistVideos,
  onProgressUpdate
}: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loopMode, setLoopMode] = useState<LoopMode>('none');
  const [autoPlay, setAutoPlay] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isPiPSupported, setIsPiPSupported] = useState(false);

  useEffect(() => {
    // Check if Picture-in-Picture is supported
    setIsPiPSupported('pictureInPictureEnabled' in document);
    
    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playerRef.current) return;

      const player = playerRef.current.getInternalPlayer();
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlaying) {
            player.pauseVideo();
          } else {
            player.playVideo();
          }
          break;
        case 'KeyJ':
          e.preventDefault();
          player.seekTo(currentTime - 10, true);
          toast.info('Rewound 10 seconds');
          break;
        case 'KeyK':
          e.preventDefault();
          if (isPlaying) {
            player.pauseVideo();
          } else {
            player.playVideo();
          }
          break;
        case 'KeyL':
          e.preventDefault();
          player.seekTo(currentTime + 10, true);
          toast.info('Fast forwarded 10 seconds');
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          player.seekTo(currentTime - 5, true);
          break;
        case 'ArrowRight':
          e.preventDefault();
          player.seekTo(currentTime + 5, true);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(100, volume + 10));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 10));
          break;
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
          e.preventDefault();
          const percentage = parseInt(e.code.replace('Digit', '')) * 10;
          player.seekTo((duration * percentage) / 100, true);
          break;
        case 'Digit0':
          e.preventDefault();
          player.seekTo(0, true);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, duration, volume]);

  useEffect(() => {
    // Update progress every second when playing
    const interval = setInterval(() => {
      if (playerRef.current && isPlaying) {
        const player = playerRef.current.getInternalPlayer();
        const current = player.getCurrentTime();
        const total = player.getDuration();
        
        setCurrentTime(current);
        setDuration(total);
        
        // Call progress update callback
        if (onProgressUpdate && video) {
          onProgressUpdate(video.videoId, current, total);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, video, onProgressUpdate]);

  const handleVideoEnd = () => {
    if (video) {
      onVideoComplete(video.videoId);
      
      if (loopMode === 'single') {
        playerRef.current?.getInternalPlayer().seekTo(0);
        playerRef.current?.getInternalPlayer().playVideo();
      } else if (loopMode === 'playlist' || autoPlay) {
        playNextVideo();
      }
    }
  };

  const handleVideoReady = (event: any) => {
    playerRef.current = event.target;
    const player = event.target;
    
    setDuration(player.getDuration());
    setCurrentTime(player.getCurrentTime());
    
    // Set initial volume
    player.setVolume(volume);
    
    // Set initial playback speed
    player.setPlaybackRate(playbackSpeed);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoStateChange = (event: any) => {
    const state = event.data;
    // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    setIsPlaying(state === 1);
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    
    const player = playerRef.current.getInternalPlayer();
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    
    const player = playerRef.current.getInternalPlayer();
    if (isMuted) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    
    if (playerRef.current) {
      const player = playerRef.current.getInternalPlayer();
      player.setVolume(vol);
      
      if (vol === 0) {
        setIsMuted(true);
        player.mute();
      } else if (isMuted) {
        setIsMuted(false);
        player.unMute();
      }
    }
  };

  const handleProgressChange = (newTime: number[]) => {
    const time = newTime[0];
    setCurrentTime(time);
    
    if (playerRef.current) {
      const player = playerRef.current.getInternalPlayer();
      player.seekTo(time, true);
    }
  };

  const changePlaybackSpeed = (speed: PlaybackSpeed) => {
    setPlaybackSpeed(speed);
    
    if (playerRef.current) {
      const player = playerRef.current.getInternalPlayer();
      player.setPlaybackRate(speed);
    }
    
    toast.info(`Playback speed: ${speed}x`);
  };

  const toggleFullscreen = () => {
    const videoContainer = document.getElementById('youtube-player-container');
    if (!videoContainer) return;
    
    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          toast.info('Press F or ESC to exit fullscreen');
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

  const togglePictureInPicture = async () => {
    if (!isPiPSupported) {
      toast.error('Picture-in-Picture not supported');
      return;
    }

    try {
      const iframe = document.querySelector('#youtube-player iframe') as HTMLIFrameElement;
      if (iframe) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await (iframe as any).requestPictureInPicture();
        }
      }
    } catch (error) {
      toast.error('Failed to toggle Picture-in-Picture');
    }
  };

  const cycleLoopMode = () => {
    const modes: LoopMode[] = ['none', 'single', 'playlist'];
    const currentIndex = modes.indexOf(loopMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setLoopMode(nextMode);
    
    const modeLabels = {
      none: 'Loop: Off',
      single: 'Loop: Single Video',
      playlist: 'Loop: Playlist'
    };
    
    toast.info(modeLabels[nextMode]);
  };

  const playNextVideo = () => {
    const currentIndex = playlistVideos.findIndex(v => v.videoId === video?.videoId);
    if (currentIndex < playlistVideos.length - 1) {
      onVideoSelect(playlistVideos[currentIndex + 1]);
    } else if (loopMode === 'playlist') {
      onVideoSelect(playlistVideos[0]);
    }
  };

  const playPreviousVideo = () => {
    const currentIndex = playlistVideos.findIndex(v => v.videoId === video?.videoId);
    if (currentIndex > 0) {
      onVideoSelect(playlistVideos[currentIndex - 1]);
    } else if (loopMode === 'playlist') {
      onVideoSelect(playlistVideos[playlistVideos.length - 1]);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLoopIcon = () => {
    switch (loopMode) {
      case 'single':
        return <Repeat1 className="h-4 w-4" />;
      case 'playlist':
        return <Repeat className="h-4 w-4" />;
      default:
        return <Repeat className="h-4 w-4 opacity-50" />;
    }
  };

  const opts: YouTubeProps['opts'] = {
    height: '400',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0, // Hide default controls
      modestbranding: 1,
      rel: 0,
      fs: 1, // Enable fullscreen button
      cc_load_policy: 1,
      iv_load_policy: 3,
      autohide: 1,
      enablejsapi: 1, // Enable JavaScript API
    },
  };

  if (!video) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Select a video to start watching
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        {/* Video Player */}
        <div 
          id="youtube-player-container"
          className={`relative bg-black group ${isFullscreen ? 'fullscreen-video' : ''}`}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <div id="youtube-player" className={isFullscreen ? 'h-screen' : ''}>
            <YouTube
              videoId={video.videoId}
              opts={isFullscreen ? { ...opts, height: '100%', width: '100%' } : opts}
              onReady={handleVideoReady}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onEnd={handleVideoEnd}
              onStateChange={handleVideoStateChange}
              className={`w-full ${isFullscreen ? 'h-full' : ''}`}
            />
          </div>
          
          {/* Custom Controls Overlay */}
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={handleProgressChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Previous/Next */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={playPreviousVideo}
                  className="text-white hover:bg-white/20"
                  disabled={playlistVideos.findIndex(v => v.videoId === video.videoId) === 0 && loopMode !== 'playlist'}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                {/* Play/Pause */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={playNextVideo}
                  className="text-white hover:bg-white/20"
                  disabled={playlistVideos.findIndex(v => v.videoId === video.videoId) === playlistVideos.length - 1 && loopMode !== 'playlist'}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                
                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>
                
                {/* Loop Mode */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cycleLoopMode}
                  className="text-white hover:bg-white/20"
                >
                  {getLoopIcon()}
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Settings Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                      <DropdownMenuItem
                        key={speed}
                        onClick={() => changePlaybackSpeed(speed as PlaybackSpeed)}
                        className="cursor-pointer"
                      >
                        {speed}x {speed === playbackSpeed && '✓'}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Auto-play</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => setAutoPlay(!autoPlay)}
                      className="cursor-pointer"
                    >
                      {autoPlay ? 'Disable' : 'Enable'} Auto-play {autoPlay && '✓'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Picture-in-Picture */}
                {isPiPSupported && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePictureInPicture}
                    className="text-white hover:bg-white/20"
                  >
                    <PictureInPicture className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Video Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">{video.title}</h3>
          {video.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {video.description}
            </p>
          )}
        </div>
      </CardContent>
      
      {/* Keyboard Shortcuts Info */}
      <div className="px-4 pb-4">
        <details className="text-xs text-gray-500 dark:text-gray-400">
          <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
            <Info className="inline h-3 w-3 mr-1" />
            Keyboard Shortcuts
          </summary>
          <div className="mt-2 space-y-1 ml-4">
            <div>Space/K: Play/Pause</div>
            <div>J: Rewind 10s | L: Forward 10s</div>
            <div>←/→: Seek 5s | ↑/↓: Volume</div>
            <div>0-9: Jump to percentage</div>
            <div>F: Fullscreen | M: Mute</div>
          </div>
        </details>
      </div>
    </Card>
  );
}