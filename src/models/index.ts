import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: '',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otpCode: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Date,
    default: null,
  },
  playlists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
  }],
}, {
  timestamps: true,
});

const PlaylistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  playlistId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  thumbnailUrl: {
    type: String,
    default: '',
  },
  channelTitle: {
    type: String,
    default: '',
  },
  totalVideos: {
    type: Number,
    default: 0,
  },
  completedVideos: {
    type: Number,
    default: 0,
  },
  videos: [{
    videoId: String,
    title: String,
    description: String,
    thumbnailUrl: String,
    duration: String,
    isCompleted: {
      type: Boolean,
      default: false,
    },
    position: Number,
  }],
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null,
  },
  isStarred: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
  }],
}, {
  timestamps: true,
});

const NoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  playlistId: {
    type: String,
    required: true,
  },
  videoId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  htmlContent: {
    type: String, // Rich text HTML content
    default: '',
  },
  timestamp: {
    type: Number, // Video timestamp in seconds
    default: null,
  },
  category: {
    type: String,
    enum: ['general', 'important', 'question', 'summary', 'todo', 'insight'],
    default: 'general',
  },
  tags: [{
    type: String,
  }],
  isBookmark: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const FolderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: 'blue',
  },
}, {
  timestamps: true,
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Playlist = mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);
export const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema);
export const Folder = mongoose.models.Folder || mongoose.model('Folder', FolderSchema);