import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { Note } from '@/models';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const playlistId = searchParams.get('playlistId');
    const videoId = searchParams.get('videoId');

    if (!playlistId || !videoId) {
      return NextResponse.json(
        { error: 'Playlist ID and Video ID are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const notes = await Note.find({
      userId: user._id,
      playlistId,
      videoId,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ notes });

  } catch (error) {
    console.error('Get notes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    
    const { playlistId, videoId, content } = await request.json();

    if (!playlistId || !videoId || !content) {
      return NextResponse.json(
        { error: 'Playlist ID, Video ID, and content are required' },
        { status: 400 }
      );
    }

    const note = new Note({
      userId: user._id,
      playlistId,
      videoId,
      content,
    });

    await note.save();

    return NextResponse.json({
      message: 'Note added successfully',
      note,
    });

  } catch (error) {
    console.error('Add note error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}