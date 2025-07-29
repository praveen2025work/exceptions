# Exception Hub - Complete Application Guide for Angular Developers

## 🎯 Overview
Exception Hub is a regulatory compliance application built with **React**, **Next.js**, **TypeScript**, **Tailwind CSS**, and **Shadcn UI** components. This guide will help Angular developers understand the architecture, components, and functionality.

## 📋 Table of Contents
1. [Technology Stack Comparison](#technology-stack-comparison)
2. [Project Structure](#project-structure)
3. [Application Architecture](#application-architecture)
4. [Core Components](#core-components)
5. [Data Flow & State Management](#data-flow--state-management)
6. [Routing System](#routing-system)
7. [UI Components & Styling](#ui-components--styling)
8. [Key Features](#key-features)
9. [Development Setup](#development-setup)
10. [Angular vs React Concepts](#angular-vs-react-concepts)

---

## 🔄 Technology Stack Comparison

| Angular Concept | React/Next.js Equivalent | Used In This App |
|----------------|-------------------------|------------------|
| Angular CLI | Next.js CLI | ✅ Next.js |
| Components | Functional Components | ✅ React Components |
| Services | Custom Hooks/Context | ✅ React Context |
| Modules | Pages/Components | ✅ Page-based routing |
| Angular Material | UI Libraries | ✅ Shadcn UI |
| RxJS | useState/useEffect | ✅ React Hooks |
| Routing | Next.js Router | ✅ File-based routing |
| TypeScript | TypeScript | ✅ Full TypeScript |

---

## 📁 Project Structure

```
exception-hub/
├── pages/                          # Next.js pages (like Angular routes)
│   ├── _app.tsx                    # App wrapper (like app.module.ts)
│   ├── index.tsx                   # Home page (redirects to dashboard)
│   ├── dashboard.tsx               # Dashboard page
│   ├── exceptions.tsx              # Exceptions page
│   ├── workflow.tsx                # Workflow page
│   ├── reports.tsx                 # Reports page
│   ├── adhoc-reports.tsx           # Adhoc Reports page
│   └── admin.tsx                   # Admin page
├── src/
│   ├── components/                 # Reusable components (like Angular components)
│   │   ├── Layout.tsx              # Main layout wrapper
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── ExceptionDashboard.tsx  # Dashboard component
│   │   ├── ExceptionList.tsx       # Exception list component
│   │   ├── WorkflowTab.tsx         # Workflow management
│   │   ├── AdhocReports.tsx        # Reports component
│   │   └── ui/                     # UI components (like Angular Material)
│   ├── contexts/                   # React Context (like Angular services)
│   │   └── ThemeContext.tsx        # Theme management
│   ├── data/                       # Static data (like Angular assets)
│   │   └── exceptions.json         # Exception data
│   ├── types/                      # TypeScript interfaces
│   │   └── exception.ts            # Data models
│   └── utils/                      # Utility functions
├── styles/
│   └── globals.css                 # Global styles (like Angular global styles)
└── public/                         # Static assets
```

---

## 🏗️ Application Architecture

### 1. **Main App Structure** (`pages/_app.tsx`)
```typescript
// Similar to Angular's app.module.ts
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>           {/* Like Angular providers */}
      <Layout>                {/* Main layout wrapper */}
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
```

### 2. **Layout Component** (`src/components/Layout.tsx`)
```typescript
// Similar to Angular's main layout component
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />               {/* Navigation */}
      <div className="flex-1">
        <Header />              {/* Top bar */}
        <main>{children}</main> {/* Page content */}
      </div>
    </div>
  );
};
```

### 3. **Page Components** (like Angular route components)
Each page in the `pages/` directory is automatically routed:
- `/dashboard` → `pages/dashboard.tsx`
- `/exceptions` → `pages/exceptions.tsx`
- `/workflow` → `pages/workflow.tsx`

---

## 🧩 Core Components

### 1. **Dashboard Component** (`src/components/ExceptionDashboard.tsx`)
**Purpose**: Main dashboard with metrics and charts
**Angular Equivalent**: Dashboard component with multiple child components

```typescript
const ExceptionDashboard: React.FC = () => {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  
  // Similar to Angular's ngOnInit
  useEffect(() => {
    loadExceptions();
  }, []);

  return (
    <div className="space-y-6">
      <KeyMetrics />          {/* Metrics cards */}
      <ExceptionAging />      {/* Aging chart */}
      <RecentExceptions />    {/* Recent items */}
    </div>
  );
};
```

### 2. **Exception List** (`src/components/ExceptionList.tsx`)
**Purpose**: Data table with filtering and sorting
**Angular Equivalent**: Data table component with Angular Material

```typescript
const ExceptionList: React.FC = () => {
  const [filteredData, setFilteredData] = useState<Exception[]>([]);
  const [filters, setFilters] = useState<ExceptionFilters>({});
  
  // Similar to Angular's reactive forms
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <FilterSection />       {/* Filter controls */}
      <DataTable />          {/* Exception table */}
    </Card>
  );
};
```

### 3. **Sidebar Navigation** (`src/components/Sidebar.tsx`)
**Purpose**: Main navigation menu
**Angular Equivalent**: Navigation component with Angular Router

```typescript
const Sidebar: React.FC = () => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/exceptions', label: 'Exceptions', icon: AlertTriangle },
    // ... more items
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {menuItems.map(item => (
        <NavItem 
          key={item.path}
          active={router.pathname === item.path}
          onClick={() => router.push(item.path)}
        />
      ))}
    </aside>
  );
};
```

---

## 📊 Data Flow & State Management

### 1. **Local State** (like Angular component properties)
```typescript
const [exceptions, setExceptions] = useState<Exception[]>([]);
const [loading, setLoading] = useState(false);
const [filters, setFilters] = useState<Filters>({});
```

### 2. **Context API** (like Angular services)
```typescript
// ThemeContext.tsx - Similar to Angular service
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Using context (like Angular dependency injection)
const { theme, setTheme } = useContext(ThemeContext);
```

### 3. **Data Loading** (like Angular HTTP client)
```typescript
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      // In real app, this would be an API call
      const data = await fetch('/api/exceptions');
      setExceptions(data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  loadData();
}, []);
```

---

## 🛣️ Routing System

### Next.js File-based Routing (vs Angular Router)

| Angular Router | Next.js Routing | File Location |
|---------------|----------------|---------------|
| `{ path: 'dashboard', component: DashboardComponent }` | Automatic | `pages/dashboard.tsx` |
| `{ path: 'exceptions', component: ExceptionsComponent }` | Automatic | `pages/exceptions.tsx` |
| `router.navigate(['/dashboard'])` | `router.push('/dashboard')` | Any component |

### Navigation Example
```typescript
import { useRouter } from 'next/router';

const Navigation = () => {
  const router = useRouter();
  
  // Similar to Angular's Router.navigate()
  const navigateTo = (path: string) => {
    router.push(path);
  };
  
  // Check active route (like Angular's routerLinkActive)
  const isActive = (path: string) => router.pathname === path;
};
```

---

## 🎨 UI Components & Styling

### 1. **Shadcn UI Components** (like Angular Material)
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell } from '@/components/ui/table';

// Usage (similar to Angular Material)
<Card>
  <CardHeader>
    <h2>Exception List</h2>
  </CardHeader>
  <CardContent>
    <Table>
      <TableBody>
        {exceptions.map(exception => (
          <TableRow key={exception.id}>
            <TableCell>{exception.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

### 2. **Tailwind CSS** (like Angular Material theming)
```typescript
// Utility-first CSS classes
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Exception Hub
  </h1>
</div>
```

### 3. **Theme System**
```typescript
// Similar to Angular Material theming
const themes = {
  light: { background: 'white', text: 'black' },
  dark: { background: 'gray-900', text: 'white' },
  blue: { background: 'blue-50', text: 'blue-900' }
};
```

---

## ⚡ Key Features

### 1. **Exception Management**
- **Dashboard**: Key metrics, aging charts, recent exceptions
- **Exception List**: Filterable data table with search
- **Workflow**: Step-by-step exception processing
- **Details**: Individual exception information

### 2. **Reporting System**
- **Adhoc Reports**: Custom report generation
- **Column Selection**: Choose which fields to display/export
- **Advanced Filtering**: Multiple filter criteria
- **CSV Export**: Download filtered data

### 3. **User Interface**
- **Responsive Design**: Works on all screen sizes
- **Dark/Light Themes**: Multiple theme options
- **Collapsible Sidebar**: Space-efficient navigation
- **Real-time Updates**: Live data refresh

### 4. **Data Structure**
```typescript
interface Exception {
  id: string;
  l04_business_area_name: string;
  l06_name: string;
  status: 'Unwind' | 'Centralise' | 'Writedown' | 'Insufficient Data' | 'Challenge' | 'Reassignment';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assigned_to: string;
  created_date: string;
  aging_days: number;
  // ... more fields
}
```

---

## 🚀 Development Setup

### 1. **Prerequisites**
```bash
# Install Node.js (v18+)
# Install npm or pnpm
```

### 2. **Installation**
```bash
# Clone repository
git clone <repository-url>
cd exception-hub

# Install dependencies
npm install
# or
pnpm install
```

### 3. **Development Server**
```bash
# Start development server (like ng serve)
npm run dev
# or
pnpm dev

# Open http://localhost:3000
```

### 4. **Build & Deploy**
```bash
# Build for production (like ng build)
npm run build

# Start production server
npm start
```

---

## 🔄 Angular vs React Concepts

### Component Lifecycle
| Angular | React Hooks |
|---------|-------------|
| `ngOnInit()` | `useEffect(() => {}, [])` |
| `ngOnDestroy()` | `useEffect(() => { return cleanup; }, [])` |
| `ngOnChanges()` | `useEffect(() => {}, [dependency])` |

### Data Binding
| Angular | React |
|---------|-------|
| `[(ngModel)]="value"` | `value={state} onChange={setState}` |
| `*ngFor="let item of items"` | `{items.map(item => <div key={item.id}>)}` |
| `*ngIf="condition"` | `{condition && <div>Content</div>}` |

### Services vs Hooks
| Angular Service | React Hook |
|----------------|------------|
| `@Injectable()` | `const useCustomHook = () => {}` |
| Dependency Injection | Context API or prop drilling |
| `constructor(private service: Service)` | `const data = useCustomHook()` |

### Event Handling
| Angular | React |
|---------|-------|
| `(click)="handleClick()"` | `onClick={handleClick}` |
| `@Output() eventEmitter` | `onEvent={callback}` prop |
| `EventEmitter.emit()` | `callback()` function call |

---

## 📝 Key Files to Understand

### 1. **Entry Points**
- `pages/_app.tsx` - Main app wrapper
- `pages/index.tsx` - Home page (redirects to dashboard)
- `src/components/Layout.tsx` - Main layout

### 2. **Core Components**
- `src/components/ExceptionDashboard.tsx` - Dashboard
- `src/components/ExceptionList.tsx` - Data table
- `src/components/AdhocReports.tsx` - Reporting
- `src/components/Sidebar.tsx` - Navigation

### 3. **Data & Types**
- `src/data/exceptions.json` - Sample data
- `src/types/exception.ts` - TypeScript interfaces
- `src/contexts/ThemeContext.tsx` - Theme management

### 4. **Styling**
- `styles/globals.css` - Global styles
- `tailwind.config.js` - Tailwind configuration
- `src/components/ui/` - Reusable UI components

---

## 🎯 Getting Started Checklist

### For Angular Developers:

1. **✅ Understand the file structure** - Pages vs Components
2. **✅ Learn React Hooks** - useState, useEffect, useContext
3. **✅ Understand JSX syntax** - Similar to Angular templates
4. **✅ Learn Tailwind CSS** - Utility-first CSS framework
5. **✅ Understand Next.js routing** - File-based vs Angular Router
6. **✅ Practice with components** - Start with simple ones
7. **✅ Learn state management** - Local state vs Context API
8. **✅ Understand the build process** - Next.js vs Angular CLI

### Recommended Learning Path:
1. Start with `src/components/ExceptionDashboard.tsx` (simple component)
2. Move to `src/components/ExceptionList.tsx` (data handling)
3. Study `src/components/AdhocReports.tsx` (complex interactions)
4. Understand `src/components/Layout.tsx` (app structure)
5. Learn `pages/_app.tsx` (app configuration)

---

## 🆘 Common Questions

### Q: How do I create a new page?
**A:** Create a new file in the `pages/` directory. For example, `pages/settings.tsx` will be available at `/settings`.

### Q: How do I add a new component?
**A:** Create a new file in `src/components/`. Import and use it in other components.

### Q: How do I handle forms?
**A:** Use `useState` for form data and controlled components:
```typescript
const [formData, setFormData] = useState({ name: '', email: '' });
const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});
```

### Q: How do I make API calls?
**A:** Use `fetch` or axios in `useEffect`:
```typescript
useEffect(() => {
  fetch('/api/data').then(res => res.json()).then(setData);
}, []);
```

### Q: How do I style components?
**A:** Use Tailwind CSS classes or create CSS modules. Prefer Tailwind for consistency.

---

This guide should help your Angular developers understand and work with the Exception Hub React/Next.js application. The key is understanding that React uses a more functional approach compared to Angular's class-based components, but the core concepts of component architecture, data flow, and user interaction remain similar.