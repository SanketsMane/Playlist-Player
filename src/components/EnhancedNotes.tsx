'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Share, 
  Clock, 
  Tag, 
  Bookmark, 
  BookmarkCheck,
  MoreVertical,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

interface EnhancedNotesProps {
  notes: Note[];
  onAddNote: (content: string, htmlContent: string, timestamp?: number, category?: string, tags?: string[]) => void;
  onUpdateNote: (noteId: string, content: string, htmlContent: string, timestamp?: number, category?: string, tags?: string[]) => void;
  onDeleteNote: (noteId: string) => void;
  currentVideoTime?: number;
  onSeekToTimestamp?: (timestamp: number) => void;
}

const categories = [
  { value: 'general', label: 'General', color: 'bg-gray-500' },
  { value: 'important', label: 'Important', color: 'bg-red-500' },
  { value: 'question', label: 'Question', color: 'bg-yellow-500' },
  { value: 'summary', label: 'Summary', color: 'bg-blue-500' },
  { value: 'todo', label: 'To Do', color: 'bg-green-500' },
  { value: 'insight', label: 'Insight', color: 'bg-purple-500' },
];

export default function EnhancedNotes({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  currentVideoTime,
  onSeekToTimestamp,
}: EnhancedNotesProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [newTags, setNewTags] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [includeTimestamp, setIncludeTimestamp] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 border rounded-md',
      },
    },
  });

  const editEditor = useEditor({
    extensions: [StarterKit],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 border rounded-md',
      },
    },
  });

  // Filter notes based on search and filters
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    
    const matchesTags = filterTags.length === 0 || 
                       filterTags.some(tag => note.tags.includes(tag));
    
    return matchesSearch && matchesCategory && matchesTags;
  });

  // Get all unique tags from notes
  const allTags = [...new Set(notes.flatMap(note => note.tags))];

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTags = (tagsString: string) => {
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  const handleAddNote = async () => {
    if (!editor) return;
    
    const content = editor.getText();
    const htmlContent = editor.getHTML();
    
    if (!content.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }

    const tags = parseTags(newTags);
    const timestamp = includeTimestamp && currentVideoTime ? currentVideoTime : undefined;

    onAddNote(content, htmlContent, timestamp, selectedCategory, tags);
    
    // Reset form
    editor.commands.clearContent();
    setNewTags('');
    setSelectedCategory('general');
    setIncludeTimestamp(false);
    setIsAddingNote(false);
    
    toast.success('Note added successfully!');
  };

  const handleUpdateNote = async () => {
    if (!editEditor || !editingNote) return;
    
    const content = editEditor.getText();
    const htmlContent = editEditor.getHTML();
    
    if (!content.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }

    const tags = parseTags(newTags);
    const timestamp = includeTimestamp && currentVideoTime ? currentVideoTime : editingNote.timestamp;

    onUpdateNote(editingNote._id, content, htmlContent, timestamp, selectedCategory, tags);
    
    setEditingNote(null);
    toast.success('Note updated successfully!');
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setSelectedCategory(note.category);
    setNewTags(note.tags.join(', '));
    setIncludeTimestamp(!!note.timestamp);
    
    if (editEditor) {
      editEditor.commands.setContent(note.htmlContent || note.content);
    }
  };

  const exportToPDF = async () => {
    try {
      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.height;
      let yPosition = 20;
      
      // Title
      pdf.setFontSize(20);
      pdf.text('Video Notes Export', 20, yPosition);
      yPosition += 20;
      
      pdf.setFontSize(12);
      pdf.text(`Exported on: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 20;
      
      // Notes
      filteredNotes.forEach((note, index) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Note header
        pdf.setFontSize(14);
        const category = categories.find(c => c.value === note.category);
        pdf.text(`${index + 1}. ${category?.label || 'General'} Note`, 20, yPosition);
        yPosition += 10;
        
        // Timestamp
        if (note.timestamp) {
          pdf.setFontSize(10);
          pdf.text(`Timestamp: ${formatTime(note.timestamp)}`, 20, yPosition);
          yPosition += 8;
        }
        
        // Content
        pdf.setFontSize(10);
        const lines = pdf.splitTextToSize(note.content, 170);
        pdf.text(lines, 20, yPosition);
        yPosition += lines.length * 5 + 10;
        
        // Tags
        if (note.tags.length > 0) {
          pdf.text(`Tags: ${note.tags.join(', ')}`, 20, yPosition);
          yPosition += 10;
        }
        
        yPosition += 5;
      });
      
      pdf.save('video-notes.pdf');
      toast.success('Notes exported to PDF!');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'important': return '⚠️';
      case 'question': return '❓';
      case 'summary': return '📝';
      case 'todo': return '✅';
      case 'insight': return '💡';
      default: return '📄';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Notes ({filteredNotes.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToPDF}
              disabled={filteredNotes.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Add New Note</DialogTitle>
                  <DialogDescription>
                    Create a rich text note with categories and tags
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Editor Toolbar */}
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      className={editor?.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      className={editor?.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      className={editor?.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                      className={editor?.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                      className={editor?.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-700' : ''}
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor?.chain().focus().undo().run()}
                    >
                      <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor?.chain().focus().redo().run()}
                    >
                      <Redo className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Rich Text Editor */}
                  <EditorContent editor={editor} />
                  
                  {/* Note Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center gap-2">
                                <span>{getCategoryIcon(category.value)}</span>
                                {category.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={newTags}
                        onChange={(e) => setNewTags(e.target.value)}
                        placeholder="learning, important, review"
                      />
                    </div>
                  </div>
                  
                  {currentVideoTime && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="timestamp"
                        checked={includeTimestamp}
                        onChange={(e) => setIncludeTimestamp(e.target.checked)}
                      />
                      <Label htmlFor="timestamp">
                        Include current timestamp ({formatTime(currentVideoTime)})
                      </Label>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddNote}>
                      Add Note
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes and tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-sm text-gray-500">Filter by tags:</span>
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={filterTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  if (filterTags.includes(tag)) {
                    setFilterTags(filterTags.filter(t => t !== tag));
                  } else {
                    setFilterTags([...filterTags, tag]);
                  }
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {filteredNotes.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {notes.length === 0 ? 'No notes yet. Add your first note!' : 'No notes match your filters.'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => {
              const category = categories.find(c => c.value === note.category);
              return (
                <Card key={note._id} className="border-l-4" style={{ borderLeftColor: category?.color.replace('bg-', '#') || '#6b7280' }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(note.category)}</span>
                        <Badge variant="outline">
                          {category?.label || 'General'}
                        </Badge>
                        {note.timestamp && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSeekToTimestamp?.(note.timestamp!)}
                            className="h-6 px-2 text-xs"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(note.timestamp)}
                          </Button>
                        )}
                        {note.isBookmark && (
                          <BookmarkCheck className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEditNote(note)}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDeleteNote(note._id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ 
                        __html: note.htmlContent || note.content.replace(/\n/g, '<br>') 
                      }}
                    />
                    
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {note.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Edit Note Dialog */}
        <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Editor Toolbar */}
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editEditor?.chain().focus().toggleBold().run()}
                  className={editEditor?.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editEditor?.chain().focus().toggleItalic().run()}
                  className={editEditor?.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editEditor?.chain().focus().toggleBulletList().run()}
                  className={editEditor?.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editEditor?.chain().focus().toggleOrderedList().run()}
                  className={editEditor?.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </div>
              
              <EditorContent editor={editEditor} />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <span>{getCategoryIcon(category.value)}</span>
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                  <Input
                    id="edit-tags"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="learning, important, review"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingNote(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateNote}>
                  Update Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}