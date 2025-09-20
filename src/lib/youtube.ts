interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  position: number;
}

interface YouTubePlaylist {
  playlistId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  totalVideos: number;
  videos: YouTubeVideo[];
}

export function extractPlaylistId(url: string): string | null {
  const regex = /[&?]list=([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function fetchPlaylistDetails(playlistId: string): Promise<YouTubePlaylist | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  try {
    // Fetch playlist details
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`
    );
    
    if (!playlistResponse.ok) {
      throw new Error('Failed to fetch playlist details');
    }
    
    const playlistData = await playlistResponse.json();
    
    if (!playlistData.items || playlistData.items.length === 0) {
      return null;
    }
    
    const playlist = playlistData.items[0];
    
    // Fetch playlist items (videos)
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`
    );
    
    if (!videosResponse.ok) {
      throw new Error('Failed to fetch playlist videos');
    }
    
    const videosData = await videosResponse.json();
    
    // Get video durations
    const videoIds = videosData.items.map((item: { snippet: { resourceId: { videoId: string } } }) => item.snippet.resourceId.videoId).join(',');
    const durationsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`
    );
    
    let durations: { [key: string]: string } = {};
    if (durationsResponse.ok) {
      const durationsData = await durationsResponse.json();
      durations = durationsData.items.reduce((acc: { [key: string]: string }, video: {
        id: string;
        contentDetails: { duration: string };
      }) => {
        acc[video.id] = formatDuration(video.contentDetails.duration);
        return acc;
      }, {});
    }
    
    const videos: YouTubeVideo[] = videosData.items.map((item: {
      snippet: {
        resourceId: { videoId: string };
        title: string;
        description: string;
        thumbnails?: {
          medium?: { url: string };
          default?: { url: string };
        };
      };
    }, index: number) => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
      duration: durations[item.snippet.resourceId.videoId] || 'Unknown',
      position: index,
    }));
    
    return {
      playlistId,
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      thumbnailUrl: playlist.snippet.thumbnails?.medium?.url || playlist.snippet.thumbnails?.default?.url || '',
      channelTitle: playlist.snippet.channelTitle,
      totalVideos: videos.length,
      videos,
    };
    
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return null;
  }
}

function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  if (!match) return 'Unknown';
  
  const hours = parseInt(match[1]?.replace('H', '') || '0');
  const minutes = parseInt(match[2]?.replace('M', '') || '0');
  const seconds = parseInt(match[3]?.replace('S', '') || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}