import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Playlist } from '@/models';

// PUT /api/playlists/[id]/folder - Move playlist to folder
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { folderId } = body;

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

    // Update the playlist's folder
    playlist.folderId = folderId || null;
    await playlist.save();

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Error moving playlist to folder:', error);
    return NextResponse.json(
      { error: 'Failed to move playlist to folder' },
      { status: 500 }
    );
  }
}