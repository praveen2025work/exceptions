# Exception Hub - Hands-On Tutorial for Angular Developers

## 🎯 Quick Start Tutorial

This tutorial will walk your Angular developers through creating their first React component in the Exception Hub application, step by step.

---

## 📚 Tutorial 1: Creating a Simple Component

### Step 1: Create a New Component File
Create `src/components/UserProfile.tsx`:

```typescript
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// TypeScript interface (like Angular interface)
interface User {
  name: string;
  email: string;
  role: string;
}

// React Functional Component (like Angular Component)
const UserProfile: React.FC = () => {
  // State management (like Angular component properties)
  const [user, setUser] = useState<User>({
    name: 'Praveen Kumar',
    email: 'praveen.kumar@company.com',
    role: 'Risk Manager'
  });
  
  const [isEditing, setIsEditing] = useState(false);

  // Event handler (like Angular methods)
  const handleSave = () => {
    // In real app, this would call an API
    console.log('Saving user:', user);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  // JSX return (like Angular template)
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          {isEditing ? (
            <Input
              id="name"
              value={user.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{user.name}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          {isEditing ? (
            <Input
              id="email"
              type="email"
              value={user.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{user.email}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="role">Role</Label>
          <p className="text-sm text-muted-foreground">{user.role}</p>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
```

### Step 2: Add Component to a Page
Update `pages/admin.tsx` to include your new component:

```typescript
import React from "react";
import UserProfile from "../src/components/UserProfile";

export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserProfile />
        {/* Add more components here */}
      </div>
    </div>
  );
}
```

---

## 📚 Tutorial 2: Working with Data and Effects

### Step 1: Create a Data Service Hook
Create `src/hooks/useExceptions.ts`:

```typescript
import { useState, useEffect } from 'react';
import exceptionsData from '../data/exceptions.json';

// Custom Hook (like Angular Service)
export const useExceptions = () => {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Similar to Angular's ngOnInit
  useEffect(() => {
    const loadExceptions = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setExceptions(exceptionsData.exceptions);
      } catch (err) {
        setError('Failed to load exceptions');
      } finally {
        setLoading(false);
      }
    };

    loadExceptions();
  }, []);

  return { exceptions, loading, error };
};
```

### Step 2: Use the Hook in a Component
Create `src/components/ExceptionSummary.tsx`:

```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useExceptions } from '../hooks/useExceptions';

const ExceptionSummary: React.FC = () => {
  const { exceptions, loading, error } = useExceptions();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const statusCounts = exceptions.reduce((acc: any, exception: any) => {
    acc[exception.status] = (acc[exception.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exception Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="text-center">
              <Badge variant="secondary" className="mb-2">
                {status}
              </Badge>
              <p className="text-2xl font-bold">{count as number}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Total Exceptions: {exceptions.length}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExceptionSummary;
```

---

## 📚 Tutorial 3: Form Handling

### Step 1: Create a Form Component
Create `src/components/ExceptionForm.tsx`:

```typescript
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ExceptionFormData {
  title: string;
  description: string;
  priority: string;
  assignedTo: string;
  dueDate: string;
}

const ExceptionForm: React.FC = () => {
  const [formData, setFormData] = useState<ExceptionFormData>({
    title: '',
    description: '',
    priority: '',
    assignedTo: '',
    dueDate: ''
  });

  const [errors, setErrors] = useState<Partial<ExceptionFormData>>({});

  // Form validation (like Angular validators)
  const validateForm = (): boolean => {
    const newErrors: Partial<ExceptionFormData> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Form submitted:', formData);
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: '',
        assignedTo: '',
        dueDate: ''
      });
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof ExceptionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Exception</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={errors.description ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="priority">Priority *</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => handleInputChange('priority', value)}
            >
              <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className="text-sm text-red-500 mt-1">{errors.priority}</p>
            )}
          </div>

          <div>
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Input
              id="assignedTo"
              value={formData.assignedTo}
              onChange={(e) => handleInputChange('assignedTo', e.target.value)}
              placeholder="Enter assignee name"
            />
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">Create Exception</Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setFormData({
                title: '',
                description: '',
                priority: '',
                assignedTo: '',
                dueDate: ''
              })}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExceptionForm;
```

---

## 📚 Tutorial 4: Adding Components to Navigation

### Step 1: Update Sidebar with New Menu Item
Update `src/components/Sidebar.tsx` to add a new menu item:

```typescript
// Add this to the menuItems array
const menuItems = [
  // ... existing items
  {
    path: '/admin',
    label: 'Admin',
    icon: Settings,
  },
];
```

### Step 2: Update Admin Page
Update `pages/admin.tsx` to include all your new components:

```typescript
import React from "react";
import UserProfile from "../src/components/UserProfile";
import ExceptionSummary from "../src/components/ExceptionSummary";
import ExceptionForm from "../src/components/ExceptionForm";

export default function AdminPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserProfile />
        <ExceptionSummary />
      </div>
      
      <div className="max-w-4xl">
        <ExceptionForm />
      </div>
    </div>
  );
}
```

---

## 🎯 Practice Exercises

### Exercise 1: Create a Status Filter Component
Create a component that filters exceptions by status and displays the count.

### Exercise 2: Add Loading States
Enhance the ExceptionSummary component with skeleton loading states.

### Exercise 3: Create a Modal Component
Build a modal that shows exception details when clicked.

### Exercise 4: Add Form Validation
Extend the ExceptionForm with more complex validation rules.

---

## 🔧 Common Patterns for Angular Developers

### 1. **Component Communication**
```typescript
// Parent to Child (like Angular @Input)
<ChildComponent data={parentData} />

// Child to Parent (like Angular @Output)
<ChildComponent onEvent={(data) => handleEvent(data)} />
```

### 2. **Conditional Rendering**
```typescript
// Angular: *ngIf
{condition && <Component />}

// Angular: *ngFor
{items.map(item => <Item key={item.id} data={item} />)}
```

### 3. **Event Handling**
```typescript
// Angular: (click)="method()"
<button onClick={handleClick}>Click me</button>

// Angular: (change)="method($event)"
<input onChange={(e) => handleChange(e.target.value)} />
```

### 4. **Styling**
```typescript
// Conditional classes (like Angular [class.active])
<div className={`base-class ${isActive ? 'active' : ''}`}>

// Dynamic styles
<div style={{ color: isError ? 'red' : 'black' }}>
```

---

## 🚀 Next Steps

1. **Practice**: Try modifying existing components
2. **Experiment**: Create your own components
3. **Learn**: Study the existing codebase
4. **Ask**: Don't hesitate to ask questions

Remember: React is more functional and declarative compared to Angular's class-based approach, but the core concepts of component architecture remain the same!