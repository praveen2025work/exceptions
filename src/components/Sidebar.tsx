import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, List, GitBranch, FileText, FileBarChart, UserCog } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'exceptions', label: 'Workflow', icon: List },
  { id: 'workflow', label: 'Exceptions', icon: GitBranch },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'adhoc-reports', label: 'Adhoc Reports', icon: FileBarChart },
  { id: 'admin', label: 'Admin', icon: UserCog },
];

const Sidebar = ({ activeView, setActiveView }: SidebarProps) => {
  return (
    <aside className="w-64 flex-shrink-0 border-r bg-background p-4">
      <div className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeView === item.id ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView(item.id)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;