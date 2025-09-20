'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface PlaylistCardProps {
  playlist: {
    _id: string;
    playlistId: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    channelTitle: string;
    totalVideos: number;
    completedVideos: number;
    videos: Array<{
      videoId: string;
      title: string;
      isCompleted: boolean;
    }>;
  };
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  const progressPercentage = playlist.totalVideos > 0 
    ? (playlist.completedVideos / playlist.totalVideos) * 100 
    : 0;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden">
          {playlist.thumbnailUrl ? (
            <Image
              src={playlist.thumbnailUrl}
              alt={playlist.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
        <CardTitle className="line-clamp-2">{playlist.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {playlist.description || 'No description available'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Play className="h-4 w-4" />
              {playlist.totalVideos} videos
            </span>
            <Badge variant="secondary">{playlist.channelTitle}</Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Progress</span>
              <span>{playlist.completedVideos}/{playlist.totalVideos}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-gray-500">
              {progressPercentage.toFixed(0)}% complete
            </p>
          </div>
          
          <Link href={`/playlist/${playlist._id}`} className="block">
            <Button className="w-full">
              {playlist.completedVideos > 0 ? 'Continue' : 'Start'} Course
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}