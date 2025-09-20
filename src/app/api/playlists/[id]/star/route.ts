import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Playlist } from '@/models';

// PUT /api/playlists/[id]/star - Toggle star status of playlist
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Check if playlist exists and belongs to the user
    const playlist = await Playlist.findOne({ 
      _id: params.id, 
      userId: user._id 
    });

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    // Toggle the star status
    playlist.isStarred = !playlist.isStarred;
    await playlist.save();

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Error toggling playlist star:', error);
    return NextResponse.json(
      { error: 'Failed to toggle playlist star' },
      { status: 500 }
    );
  }
}