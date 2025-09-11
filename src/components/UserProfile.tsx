import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { User, Mail, Building, RefreshCw, LogOut } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, loading, error, refreshUser } = useUser();

  if (loading) {
    return (
      <div className="flex items-center gap-3 pl-3 border-l">
        <LoadingSpinner size="sm" />
        <div className="hidden md:block">
          <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
          <div className="h-3 w-20 bg-muted animate-pulse rounded mt-1"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center gap-3 pl-3 border-l">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-destructive/10 text-destructive">
            ?
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-destructive">Auth Error</p>
          <p className="text-xs text-muted-foreground">Click to retry</p>
        </div>
      </div>
    );
  }

  // Extract initials from display name or fall back to username
  const getInitials = (displayName: string, userName: string) => {
    if (displayName) {
      const parts = displayName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return displayName.substring(0, 2).toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  };

  // Extract role from description or displayName
  const getRole = () => {
    if (user.description) {
      const match = user.description.match(/: (.+?) \(/);
      return match ? match[1] : 'User';
    }
    if (user.displayName) {
      const match = user.displayName.match(/: (.+?) \(/);
      return match ? match[1] : 'User';
    }
    return 'User';
  };

  // Extract location from description or displayName
  const getLocation = () => {
    if (user.description) {
      const match = user.description.match(/\((.+?)\)$/);
      return match ? match[1] : '';
    }
    if (user.displayName) {
      const match = user.displayName.match(/\((.+?)\)$/);
      return match ? match[1] : '';
    }
    return '';
  };

  const initials = getInitials(user.displayName, user.userName);
  const role = getRole();
  const location = getLocation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-3 pl-3 border-l h-auto p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={process.env.NEXT_PUBLIC_AVATAR_URL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userName}`}
              alt={user.displayName}
            />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium">{user.givenName} {user.surname}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={process.env.NEXT_PUBLIC_AVATAR_URL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userName}`}
                alt={user.displayName}
              />
              <AvatarFallback className="text-sm">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{user.displayName}</p>
              <p className="text-xs text-muted-foreground mt-1">{user.userName}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <div className="p-2 space-y-3">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground min-w-0 flex-shrink-0">Email:</span>
              <span className="font-mono text-xs truncate">{user.emailAddress}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground min-w-0 flex-shrink-0">Employee ID:</span>
              <span className="font-mono text-xs">{user.employeeId}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground min-w-0 flex-shrink-0">Username:</span>
              <span className="font-mono text-xs">{user.userName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground min-w-0 flex-shrink-0">SAM Account:</span>
              <span className="font-mono text-xs">{user.samAccountName}</span>
            </div>
            
            {user.description && (
              <div className="flex items-start gap-2">
                <Building className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground min-w-0 flex-shrink-0">Description:</span>
                <span className="text-xs break-words">{user.description}</span>
              </div>
            )}
            
            {user.distinguishedName && (
              <div className="flex items-start gap-2">
                <Building className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground min-w-0 flex-shrink-0">DN:</span>
                <span className="font-mono text-xs break-all">{user.distinguishedName}</span>
              </div>
            )}
            
            {user.domain && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground min-w-0 flex-shrink-0">Domain:</span>
                <span className="font-mono text-xs">{user.domain}</span>
              </div>
            )}
            
            {user.middleName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground min-w-0 flex-shrink-0">Middle Name:</span>
                <span className="text-xs">{user.middleName}</span>
              </div>
            )}
            
            {location && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground min-w-0 flex-shrink-0">Location:</span>
                <Badge variant="secondary" className="text-xs">{location}</Badge>
              </div>
            )}
            
            {role && role !== 'User' && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground min-w-0 flex-shrink-0">Role:</span>
                <Badge variant="outline" className="text-xs">{role}</Badge>
              </div>
            )}
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={refreshUser} className="cursor-pointer">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Profile
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};