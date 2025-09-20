import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Playlist } from '@/models';
import { fetchPlaylistDetails, extractPlaylistId } from '@/lib/youtube';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const { playlistUrl } = await request.json();

    if (!playlistUrl) {
      return NextResponse.json(
        { error: 'Playlist URL is required' },
        { status: 400 }
      );
    }

    // Extract playlist ID from URL
    const playlistId = extractPlaylistId(playlistUrl);
    
    if (!playlistId) {
      return NextResponse.json(
        { error: 'Invalid YouTube playlist URL' },
        { status: 400 }
      );
    }

    // Check if playlist already exists for this user
    const existingPlaylist = await Playlist.findOne({
      userId: user._id,
      playlistId,
    });

    if (existingPlaylist) {
      return NextResponse.json(
        { error: 'Playlist already added' },
        { status: 400 }
      );
    }

    // Fetch playlist details from YouTube API
    const playlistData = await fetchPlaylistDetails(playlistId);
    
    if (!playlistData) {
      return NextResponse.json(
        { error: 'Failed to fetch playlist details or playlist not found' },
        { status: 400 }
      );
    }

    // Save playlist to database
    const playlist = new Playlist({
      userId: user._id,
      playlistId: playlistData.playlistId,
      title: playlistData.title,
      description: playlistData.description,
      thumbnailUrl: playlistData.thumbnailUrl,
      channelTitle: playlistData.channelTitle,
      totalVideos: playlistData.totalVideos,
      completedVideos: 0,
      videos: playlistData.videos.map(video => ({
        ...video,
        isCompleted: false,
      })),
    });

    await playlist.save();

    return NextResponse.json({
      message: 'Playlist added successfully',
      playlist,
    });

  } catch (error) {
    console.error('Add playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}