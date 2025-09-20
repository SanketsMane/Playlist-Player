'use client';

import { Progress } from '@/components/ui/progress';
import { CheckCircle, Play } from 'lucide-react';

interface ProgressBarProps {
  completedVideos: number;
  totalVideos: number;
  title?: string;
  showDetails?: boolean;
}

export default function ProgressBar({ 
  completedVideos, 
  totalVideos, 
  title = "Progress",
  showDetails = true 
}: ProgressBarProps) {
  const progressPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

  return (
    <div className="space-y-2">
      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-900 dark:text-gray-100">{title}</span>
          <span className="text-gray-600 dark:text-gray-400">
            {completedVideos}/{totalVideos} videos
          </span>
        </div>
      )}
      
      <Progress value={progressPercentage} className="h-2" />
      
      {showDetails && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>{completedVideos} completed</span>
          </div>
          <div className="flex items-center gap-1">
            <Play className="h-3 w-3" />
            <span>{totalVideos - completedVideos} remaining</span>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <span className="text-sm font-medium text-green-600 dark:text-green-400">
          {progressPercentage.toFixed(1)}% Complete
        </span>
      </div>
    </div>
  );
}