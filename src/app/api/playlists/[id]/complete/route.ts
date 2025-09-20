import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Playlist } from '@/models';

interface VideoDocument {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  isCompleted: boolean;
  position: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const { videoId } = await request.json();
    const { id } = await params;

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const playlist = await Playlist.findOne({
      _id: id,
      userId: user._id,
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    // Find the video and toggle its completion status
    const video = playlist.videos.find((v: VideoDocument) => v.videoId === videoId);
    
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found in playlist' },
        { status: 404 }
      );
    }

    video.isCompleted = !video.isCompleted;

    // Update completed videos count
    playlist.completedVideos = playlist.videos.filter((v: VideoDocument) => v.isCompleted).length;

    await playlist.save();

    return NextResponse.json({
      message: video.isCompleted ? 'Video marked as completed' : 'Video marked as incomplete',
      playlist,
    });

  } catch (error) {
    console.error('Complete video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}