# Playlist Player# 🎵 Playlist Player - YouTube Learning Platform



A modern YouTube playlist learning platform built with Next.js 15, featuring drag-and-drop playlist organization, note-taking, progress tracking, and analytics.A modern, feature-rich YouTube playlist learning platform built with Next.js, TypeScript, and MongoDB. Transform your YouTube playlists into structured courses with progress tracking, notes, and seamless video management.



## Features## ✨ Features



### 🎯 Core Features### 🔐 **Authentication**

- **Smart Playlist Organization**: Drag-and-drop interface for organizing playlists into custom folders- **OTP-based Authentication** via Twilio SMS

- **Integrated Video Player**: Enhanced YouTube player with fullscreen support and custom controls- Secure login, registration, and password reset

- **Note-Taking System**: Rich text editor for taking notes while watching videos- Phone number verification system

- **Progress Tracking**: Automatic progress tracking with visual progress bars- JWT-based session management

- **Learning Analytics**: Comprehensive analytics dashboard for learning insights

- **Modern UI/UX**: Dark/light theme support with responsive design### 📚 **Course Management**

- **Add YouTube Playlists** by URL

### 🔧 Technical Features- Automatic video metadata fetching via YouTube Data API v3

- **Authentication**: Secure JWT-based authentication with OTP verification- Course-like dashboard with playlist cards

- **Responsive Design**: Mobile-first design that works across all devices- Progress tracking per playlist

- **Real-time Updates**: Live progress tracking and note synchronization

- **Fast Performance**: Built with Next.js 15 and React 19 for optimal performance### 🎥 **Video Player**

- **Embedded YouTube Player** with react-youtube

## Tech Stack- Chapter-based video navigation

- Manual and automatic video completion tracking

- **Frontend**: Next.js 15, React 19, TypeScript- Seamless video switching within playlists

- **Styling**: Tailwind CSS with shadcn/ui components

- **Database**: MongoDB with Mongoose ODM### 📝 **Notes System**

- **Authentication**: JWT with OTP verification- **Per-video notes** with CRUD operations

- **Drag & Drop**: @hello-pangea/dnd- Rich text editing and formatting

- **Rich Text Editor**: Tiptap editor- Persistent storage with MongoDB

- **Video Integration**: YouTube API- Easy note management (edit/delete)

- **Deployment**: Vercel/Docker support

### 📊 **Progress Tracking**

## Getting Started- **Visual progress bars** for each playlist

- Completion percentage tracking

### Prerequisites- Video completion status

- Persistent progress state

- Node.js 18.0 or later

- MongoDB database### 👤 **User Management**

- YouTube API key- **Profile management** with editable information

- Twilio account (for OTP)- Phone number change with OTP verification

- Secure user settings and preferences

### Installation

### 🎨 **Modern UI/UX**

1. Clone the repository:- **Responsive design** with TailwindCSS

```bash- Clean, dashboard-style layout

git clone https://github.com/SanketsMane/Playlist-Player.git- shadcn/ui component library

cd Playlist-Player- Dark/light mode support

```- Mobile-friendly interface



2. Install dependencies:## 🛠️ Tech Stack

```bash

npm install- **Frontend**: Next.js 15, React, TypeScript

```- **Styling**: TailwindCSS, shadcn/ui

- **Database**: MongoDB Atlas with Mongoose

3. Create environment file:- **Authentication**: JWT, Twilio SMS OTP

```bash- **Video Player**: react-youtube

cp .env.example .env.local- **API Integration**: YouTube Data API v3

```

## 📂 Project Structure

4. Configure environment variables:

```bash```

# Databasesrc/

MONGODB_URI=your_mongodb_connection_string├── app/

│   ├── api/                    # API routes

# JWT│   │   ├── auth/              # Authentication endpoints

JWT_SECRET=your_jwt_secret_key│   │   ├── playlists/         # Playlist management

│   │   ├── notes/             # Notes CRUD operations

# YouTube API│   │   └── user/              # User profile management

YOUTUBE_API_KEY=your_youtube_api_key│   ├── auth/                   # Authentication page

│   ├── dashboard/              # Main dashboard

# Twilio Configuration│   ├── playlist/[id]/          # Individual playlist view

TWILIO_ACCOUNT_SID=your_twilio_account_sid_here│   ├── profile/                # User profile page

TWILIO_AUTH_TOKEN=your_twilio_auth_token_here│   └── layout.tsx              # Root layout

TWILIO_PHONE_NUMBER=your_twilio_phone_number_here├── components/

│   ├── ui/                     # shadcn/ui components

# App URL│   ├── AuthPage.tsx            # Authentication component

NEXTAUTH_URL=http://localhost:3000│   ├── PlaylistCard.tsx        # Playlist card component

```│   ├── VideoPlayer.tsx         # Video player with chapters

│   ├── Notes.tsx               # Notes management

5. Run the development server:│   └── ProgressBar.tsx         # Progress visualization

```bash├── lib/

npm run dev│   ├── mongodb.ts              # Database connection

```│   ├── twilio.ts               # SMS/OTP service

│   ├── youtube.ts              # YouTube API integration

6. Open [http://localhost:3000](http://localhost:3000) in your browser.│   ├── auth.ts                 # Authentication utilities

│   └── utils.ts                # Utility functions

## Project Structure└── models/

    └── index.ts                # MongoDB schemas

``````

src/

├── app/                   # Next.js 15 app directory## 🚀 Setup Instructions

│   ├── api/              # API routes

│   ├── auth/             # Authentication pages### 1. **Clone and Install Dependencies**

│   ├── dashboard/        # Main dashboard

│   └── playlist/         # Playlist pages```bash

├── components/           # React components# Clone the repository

│   ├── ui/              # shadcn/ui componentsgit clone <repository-url>

│   └── ...              # Custom componentscd playlist-player

├── hooks/               # Custom React hooks

├── lib/                 # Utility libraries# Install dependencies

└── models/              # Database modelsnpm install

``````



## Key Components### 2. **Environment Configuration**



### Dashboard Sidebar (`/src/components/DashboardSidebar.tsx`)Create a `.env.local` file in the root directory:

Modern navigation sidebar with:

- Playlists management```env

- Organize (drag-and-drop)# Database

- Notes accessMONGODB_URI=your_mongodb_connection_string_here

- Analytics dashboard

- Compact toggle mode# Twilio Configuration

TWILIO_ACCOUNT_SID=your_twilio_account_sid_here

### Smart Playlist Organizer (`/src/components/SmartPlaylistOrganizer.tsx`)TWILIO_AUTH_TOKEN=your_twilio_auth_token_here

Drag-and-drop interface for:TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

- Creating custom folders

- Organizing playlists# YouTube API

- Bulk operationsYOUTUBE_API_KEY=your_youtube_api_key_here

- Real-time updates

# NextAuth & JWT Secrets

### Enhanced Video Player (`/src/components/EnhancedVideoPlayer.tsx`)NEXTAUTH_URL=http://localhost:3000

Feature-rich video player with:NEXTAUTH_SECRET=your-nextauth-secret-here

- Fullscreen supportJWT_SECRET=your-jwt-secret-here

- Custom controls```

- Progress tracking

- Note integration### 3. **Get YouTube API Key**



## API Endpoints1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project or select existing one

### Authentication3. Enable **YouTube Data API v3**

- `POST /api/auth/register` - User registration4. Create credentials (API Key)

- `POST /api/auth/login` - User login5. Add the API key to your `.env.local` file

- `POST /api/auth/verify-otp` - OTP verification

- `POST /api/auth/logout` - User logout### 4. **Run the Application**

- `POST /api/auth/forgot-password` - Password reset

```bash

### Playlists# Development server

- `GET /api/playlists` - Get all playlistsnpm run dev

- `POST /api/playlists/add` - Add new playlist

- `GET /api/playlists/[id]` - Get specific playlist# Production build

- `PUT /api/playlists/[id]` - Update playlistnpm run build

- `POST /api/playlists/[id]/complete` - Mark video as completenpm start

```

### Notes

- `GET /api/notes` - Get all notesVisit `http://localhost:3000` to access the application.

- `POST /api/notes` - Create new note

- `PUT /api/notes/[id]` - Update note## 📱 Usage Guide

- `DELETE /api/notes/[id]` - Delete note

### **Getting Started**

### User1. **Register/Login** using your phone number

- `GET /api/user/profile` - Get user profile2. **Verify** with the OTP sent to your phone

- `PUT /api/user/profile` - Update profile3. **Add playlists** by pasting YouTube playlist URLs

- `POST /api/user/change-phone` - Change phone number4. **Start learning** with your organized courses!



## Features in Detail### **Adding Playlists**

1. Copy any YouTube playlist URL

### Drag-and-Drop Playlist Organization2. Click "Add Playlist" on the dashboard

- Create custom folders for organizing playlists3. Paste the URL and click "Add Playlist"

- Drag playlists between folders4. The system will fetch all videos and metadata

- Real-time updates across all connected clients

- Responsive design for mobile devices### **Learning Flow**

1. Click on any playlist card to start

### Note-Taking System2. Watch videos in the embedded player

- Rich text editor with formatting options3. Mark videos as complete (manual or automatic)

- Video timestamp integration4. Add notes for each video

- Search and filter notes5. Track your progress visually

- Export notes functionality

### **Managing Content**

### Progress Tracking- **Notes**: Add, edit, or delete notes per video

- Automatic progress calculation- **Progress**: Automatic tracking with visual indicators

- Visual progress indicators- **Profile**: Update personal information and phone number

- Completion statistics- **Playlists**: Manage your course collection

- Learning time tracking

## 🔧 Development

### Analytics Dashboard

- Learning progress insights### **Available Scripts**

- Time spent analytics

- Completion rates```bash

- Performance metricsnpm run dev          # Start development server

npm run build        # Build for production

## Deploymentnpm run start        # Start production server

npm run lint         # Run ESLint

### Vercel Deploymentnpm run type-check   # TypeScript type checking

```

1. Connect your GitHub repository to Vercel

2. Configure environment variables in Vercel dashboard### **Database Schema**

3. Deploy automatically on push to main branch

The application uses three main MongoDB collections:

### Docker Deployment

- **Users**: User authentication and profile data

```bash- **Playlists**: YouTube playlist metadata and videos

# Build the image- **Notes**: User notes associated with specific videos

docker build -t playlist-player .

## 🔐 Security Features

# Run the container

docker run -p 3000:3000 --env-file .env.local playlist-player- **JWT Authentication** with HTTP-only cookies

```- **OTP Verification** for all authentication flows

- **Input validation** and sanitization

## Contributing- **Secure API endpoints** with authentication middleware

- **Environment variable protection**

1. Fork the repository

2. Create a feature branch (`git checkout -b feature/amazing-feature`)## 🌟 Key Features in Detail

3. Commit your changes (`git commit -m 'Add some amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)### **Playlist Management**

5. Open a Pull Request- Automatic video extraction from YouTube playlists

- Metadata fetching (title, description, duration, thumbnails)

## License- Progress calculation and visualization

- Course-style organization

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### **Video Experience**

## Support- Seamless YouTube integration

- Chapter-based navigation

For support, email your-email@example.com or join our Slack channel.- Completion tracking

- Notes synchronized with video content

## Roadmap

### **User Experience**

- [ ] Mobile app development- Responsive design for all devices

- [ ] Advanced analytics with AI insights- Intuitive dashboard interface

- [ ] Collaborative learning features- Fast navigation and loading

- [ ] Integration with more video platforms- Modern UI components with shadcn/ui

- [ ] Offline mode support

- [ ] Advanced search and filtering## 🤝 Contributing

- [ ] Custom themes and personalization

1. Fork the repository

---2. Create a feature branch (`git checkout -b feature/amazing-feature`)

3. Commit your changes (`git commit -m 'Add amazing feature'`)

Made with ❤️ by [Your Name](https://github.com/SanketsMane)4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
