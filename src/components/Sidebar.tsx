import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import {
  Home,
  List,
  GitBranch,
  FileText,
  FileBarChart,
  UserCog,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
  { id: 'exceptions', label: 'Exceptions', icon: List, href: '/exceptions' },
  { id: 'workflow', label: 'Workflow', icon: GitBranch, href: '/workflow' },
  { id: 'reports', label: 'Reports', icon: FileText, href: '/reports' },
  { id: 'adhoc-reports', label: 'Adhoc Reports', icon: FileBarChart, href: '/adhoc-reports' },
  { id: 'admin', label: 'Admin', icon: UserCog, href: '/admin' },
];

const Sidebar = () => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`flex-shrink-0 border-r bg-background transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">Navigation</h2>
          )}
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <TooltipProvider>
            {navItems.map((item) => (
              <Tooltip key={item.id} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      router.pathname === item.href || 
                      (router.pathname === '/' && item.href === '/dashboard') 
                        ? 'secondary' 
                        : 'ghost'
                    }
                    className={`w-full ${
                      isCollapsed ? 'justify-center' : 'justify-start'
                    }`}
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon className={`h-4 w-4 ${!isCollapsed && 'mr-2'}`} />
                    {!isCollapsed && item.label}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;