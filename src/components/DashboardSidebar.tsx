'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BookOpen, FolderOpen, PenTool, BarChart3, Home, Menu, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  className?: string;
}

const sidebarItems = [
  {
    id: 'playlists',
    label: 'Playlists',
    icon: BookOpen,
    description: 'Your learning playlists'
  },
  {
    id: 'organize',
    label: 'Organize',
    icon: FolderOpen,
    description: 'Manage folders and organization'
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: PenTool,
    description: 'View and manage your notes'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Learning progress and analytics'
  }
];

export default function DashboardSidebar({ 
  activeSection, 
  onSectionChange, 
  className 
}: SidebarProps) {
  const [isCompact, setIsCompact] = useState(false);

  return (
    <div className={cn(
      "flex flex-col bg-card border-r border-border/50 h-full transition-all duration-300 shadow-sm",
      isCompact ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          {!isCompact && (
            <div className="flex items-center gap-2">
              <Home className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Dashboard
              </h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCompact(!isCompact)}
            className="h-8 w-8 p-0 hover:bg-accent"
          >
            {isCompact ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        {!isCompact && (
          <p className="text-sm text-muted-foreground mt-1">
            Learning Management
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 transition-all duration-200",
                  isCompact ? "h-12 px-3" : "h-12 px-4",
                  isActive && "bg-primary text-primary-foreground shadow-md shadow-primary/25",
                  !isActive && "hover:bg-accent hover:shadow-sm"
                )}
                onClick={() => onSectionChange(item.id)}
                title={isCompact ? item.label : undefined}
              >
                <Icon className={cn(
                  "flex-shrink-0 transition-transform duration-200",
                  isCompact ? "h-5 w-5" : "h-5 w-5",
                  isActive && "scale-110"
                )} />
                {!isCompact && (
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-medium text-sm truncate">{item.label}</span>
                    <span className={cn(
                      "text-xs truncate",
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {item.description}
                    </span>
                  </div>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {!isCompact && (
        <div className="p-4 border-t border-border/50 bg-muted/20">
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p className="font-medium">Playlist Player v1.0</p>
            <p>Enhanced Learning Experience</p>
          </div>
        </div>
      )}
    </div>
  );
}