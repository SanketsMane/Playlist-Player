'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, BookOpen, User, LogOut, Settings, BarChart3, FolderOpen, PenTool, Mail, Github, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import PlaylistCard from '@/components/PlaylistCard';
import EnhancedNotes from '@/components/EnhancedNotes';
import SmartPlaylistOrganizer from '@/components/SmartPlaylistOrganizer';
import LearningAnalytics from '@/components/LearningAnalytics';
import DashboardSidebar from '@/components/DashboardSidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface Playlist {
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
  folderId?: string;
  isStarred?: boolean;
  tags?: string[];
  progress?: number;
  duration?: number;
  lastWatched?: string;
  videoCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Note {
  _id: string;
  content: string;
  htmlContent?: string;
  timestamp?: number;
  category: string;
  tags: string[];
  isBookmark: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Folder {
  _id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  playlistCount: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeSection, setActiveSection] = useState('playlists');

  useEffect(() => {
    fetchUserData();
    fetchPlaylists();
    fetchNotes();
    fetchFolders();
  }, []);

  useEffect(() => {
    // Filter playlists based on search query
    if (searchQuery.trim()) {
      const filtered = playlists.filter(playlist => 
        playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        playlist.channelTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        playlist.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPlaylists(filtered);
    } else {
      setFilteredPlaylists(playlists);
    }
  }, [searchQuery, playlists]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/auth');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      router.push('/auth');
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists');
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data.playlists);
      } else {
        toast.error('Failed to fetch playlists');
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast.error('Failed to fetch playlists');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/folders');
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders || []);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleAddPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingPlaylist(true);

    try {
      const response = await fetch('/api/playlists/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Playlist added successfully!');
        setPlaylistUrl('');
        setShowAddDialog(false);
        fetchPlaylists(); // Refresh the playlists
      } else {
        toast.error(data.error || 'Failed to add playlist');
      }
    } catch (error) {
      console.error('Error adding playlist:', error);
      toast.error('Failed to add playlist');
    } finally {
      setIsAddingPlaylist(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Note handlers
  const handleAddNote = async (content: string, htmlContent: string, timestamp?: number, category?: string, tags?: string[]) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, htmlContent, timestamp, category, tags }),
      });

      if (response.ok) {
        fetchNotes();
      } else {
        toast.error('Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const handleUpdateNote = async (noteId: string, content: string, htmlContent: string, timestamp?: number, category?: string, tags?: string[]) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, htmlContent, timestamp, category, tags }),
      });

      if (response.ok) {
        fetchNotes();
      } else {
        toast.error('Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchNotes();
      } else {
        toast.error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  // Folder handlers
  const handleCreateFolder = async (name: string, description: string, color: string) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, color }),
      });

      if (response.ok) {
        fetchFolders();
      } else {
        toast.error('Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const handleUpdateFolder = async (folderId: string, name: string, description: string, color: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, color }),
      });

      if (response.ok) {
        fetchFolders();
      } else {
        toast.error('Failed to update folder');
      }
    } catch (error) {
      console.error('Error updating folder:', error);
      toast.error('Failed to update folder');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFolders();
      } else {
        toast.error('Failed to delete folder');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  const handleMovePlaylistToFolder = async (playlistId: string, folderId: string | null) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/folder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId }),
      });

      if (response.ok) {
        fetchPlaylists();
        toast.success('Playlist moved successfully!');
      } else {
        toast.error('Failed to move playlist');
      }
    } catch (error) {
      console.error('Error moving playlist:', error);
      toast.error('Failed to move playlist');
    }
  };

  const handleTogglePlaylistStar = async (playlistId: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/star`, {
        method: 'PUT',
      });

      if (response.ok) {
        fetchPlaylists();
      } else {
        toast.error('Failed to update playlist');
      }
    } catch (error) {
      console.error('Error updating playlist:', error);
      toast.error('Failed to update playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPlaylists();
      } else {
        toast.error('Failed to delete playlist');
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast.error('Failed to delete playlist');
    }
  };

  const handlePlayPlaylist = (playlistId: string) => {
    router.push(`/playlist/${playlistId}`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Mock data for analytics (in real app, this would come from your backend)
  const mockAnalyticsData = {
    sessions: [
      { date: '2024-01-20', duration: 45, videosWatched: 3, notesCreated: 5, playlistsCompleted: 1, categories: ['JavaScript', 'React'] },
      { date: '2024-01-21', duration: 60, videosWatched: 4, notesCreated: 7, playlistsCompleted: 0, categories: ['JavaScript'] },
      { date: '2024-01-22', duration: 30, videosWatched: 2, notesCreated: 3, playlistsCompleted: 1, categories: ['CSS'] },
    ],
    playlistProgress: playlists.map(p => ({
      playlistId: p._id,
      title: p.title,
      category: 'Programming',
      progress: (p.completedVideos / p.totalVideos) * 100,
      timeSpent: 120,
      lastWatched: new Date().toISOString(),
      difficulty: 'intermediate' as const,
      isCompleted: p.completedVideos === p.totalVideos,
    })),
    goals: [
      {
        id: '1',
        title: 'Complete React Course',
        description: 'Finish the React fundamentals playlist',
        targetHours: 20,
        currentHours: 12,
        deadline: '2024-02-15',
        category: 'Frontend',
        isCompleted: false,
      }
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg shadow-sm border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Playlist Player
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user ? getInitials(user.name) : 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.phone}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex h-[calc(100vh-4rem)] bg-transparent">
        {/* Sidebar */}
        <DashboardSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-border/50 backdrop-blur-sm">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
                  Welcome back, {user?.name}! 👋
                </h2>
                <p className="text-muted-foreground text-lg">
                  Continue your learning journey with enhanced features
                </p>
              </div>
            </div>

            {/* Content based on active section */}
            {activeSection === 'playlists' && (
              <div className="space-y-6">
                {/* Actions Bar */}
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search playlists..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                        />
                      </div>
                    </div>
                    
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md">
                          <Plus className="h-4 w-4" />
                          Add Playlist
                        </Button>
                      </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add YouTube Playlist</DialogTitle>
                        <DialogDescription>
                          Paste a YouTube playlist URL to add it to your courses
                        </DialogDescription>
                      </DialogHeader>
                  <form onSubmit={handleAddPlaylist} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="playlist-url">Playlist URL</Label>
                      <Input
                        id="playlist-url"
                        type="url"
                        placeholder="https://www.youtube.com/playlist?list=..."
                        value={playlistUrl}
                        onChange={(e) => setPlaylistUrl(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isAddingPlaylist}>
                      {isAddingPlaylist ? 'Adding...' : 'Add Playlist'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Playlists Grid */}
            {filteredPlaylists.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="text-xl mb-2">No playlists found</CardTitle>
                  <CardDescription className="mb-4">
                    {searchQuery ? 'No playlists match your search.' : 'Start by adding your first YouTube playlist!'}
                  </CardDescription>
                  {!searchQuery && (
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Playlist
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredPlaylists.map((playlist) => (
                  <PlaylistCard key={playlist._id} playlist={playlist} />
                ))}
              </div>
            )}
                </div>
              </div>
            )}

            {/* Organize Section */}
            {activeSection === 'organize' && (
              <SmartPlaylistOrganizer
                playlists={playlists}
                folders={folders}
                onCreateFolder={handleCreateFolder}
                onUpdateFolder={handleUpdateFolder}
                onDeleteFolder={handleDeleteFolder}
                onMovePlaylistToFolder={handleMovePlaylistToFolder}
                onTogglePlaylistStar={handleTogglePlaylistStar}
                onDeletePlaylist={handleDeletePlaylist}
                onPlayPlaylist={handlePlayPlaylist}
              />
            )}

            {/* Notes Section */}
            {activeSection === 'notes' && (
              <EnhancedNotes
                notes={notes}
                onAddNote={handleAddNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
              />
            )}

            {/* Analytics Section */}
            {activeSection === 'analytics' && (
              <LearningAnalytics
                sessions={mockAnalyticsData.sessions}
                playlistProgress={mockAnalyticsData.playlistProgress}
                goals={mockAnalyticsData.goals}
                totalPlaylists={playlists.length}
                totalVideos={playlists.reduce((sum, p) => sum + p.totalVideos, 0)}
                totalNotes={notes.length}
              />
            )}
          </div>
        </main>
      </div>

      {/* Developer Credits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Developed with ❤️ by Sanket Mane
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Full-stack developer passionate about creating amazing learning experiences
              </p>
              <div className="flex justify-center items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>sanket.mane@example.com</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Github className="h-4 w-4" />
                  <span>@sanketmane</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>India</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}