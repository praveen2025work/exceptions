# Angular to React Quick Reference Cheat Sheet

## 🚀 Essential Conversions for Angular Developers

---

## 📋 Component Structure

### Angular Component
```typescript
@Component({
  selector: 'app-user',
  template: `
    <div class="user-card">
      <h2>{{user.name}}</h2>
      <p>{{user.email}}</p>
      <button (click)="editUser()">Edit</button>
    </div>
  `,
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  @Input() user: User;
  @Output() userUpdated = new EventEmitter<User>();
  
  ngOnInit() {
    this.loadUser();
  }
  
  editUser() {
    this.userUpdated.emit(this.user);
  }
}
```

### React Component
```typescript
import React, { useEffect } from 'react';

interface UserProps {
  user: User;
  onUserUpdated: (user: User) => void;
}

const UserComponent: React.FC<UserProps> = ({ user, onUserUpdated }) => {
  useEffect(() => {
    loadUser();
  }, []);
  
  const editUser = () => {
    onUserUpdated(user);
  };
  
  return (
    <div className="user-card">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button onClick={editUser}>Edit</button>
    </div>
  );
};
```

---

## 🔄 Lifecycle Methods

| Angular | React Hook | Usage |
|---------|------------|-------|
| `ngOnInit()` | `useEffect(() => {}, [])` | Component initialization |
| `ngOnDestroy()` | `useEffect(() => { return cleanup; }, [])` | Cleanup |
| `ngOnChanges()` | `useEffect(() => {}, [prop])` | When props change |

### Examples:

**Angular:**
```typescript
ngOnInit() {
  this.loadData();
}

ngOnDestroy() {
  this.subscription.unsubscribe();
}
```

**React:**
```typescript
useEffect(() => {
  loadData();
  
  return () => {
    // Cleanup code here
  };
}, []); // Empty array = runs once on mount
```

---

## 📊 State Management

### Angular
```typescript
export class MyComponent {
  user: User = { name: '', email: '' };
  loading = false;
  
  updateUser(newUser: User) {
    this.user = newUser;
  }
}
```

### React
```typescript
const MyComponent: React.FC = () => {
  const [user, setUser] = useState<User>({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  
  const updateUser = (newUser: User) => {
    setUser(newUser);
  };
};
```

---

## 🎯 Event Handling

| Angular | React |
|---------|-------|
| `(click)="handleClick()"` | `onClick={handleClick}` |
| `(change)="handleChange($event)"` | `onChange={(e) => handleChange(e)}` |
| `(submit)="onSubmit()"` | `onSubmit={handleSubmit}` |
| `(keyup)="onKeyUp($event)"` | `onKeyUp={(e) => handleKeyUp(e)}` |

---

## 🔗 Data Binding

### Angular Template Syntax
```html
<!-- Interpolation -->
<h1>{{title}}</h1>

<!-- Property Binding -->
<img [src]="imageUrl" [alt]="imageAlt">

<!-- Two-way Binding -->
<input [(ngModel)]="username">

<!-- Event Binding -->
<button (click)="save()">Save</button>

<!-- Conditional -->
<div *ngIf="isVisible">Content</div>

<!-- Loop -->
<li *ngFor="let item of items; trackBy: trackByFn">{{item.name}}</li>

<!-- Class Binding -->
<div [class.active]="isActive">Content</div>

<!-- Style Binding -->
<div [style.color]="textColor">Content</div>
```

### React JSX
```jsx
{/* Interpolation */}
<h1>{title}</h1>

{/* Property Binding */}
<img src={imageUrl} alt={imageAlt} />

{/* Controlled Input */}
<input value={username} onChange={(e) => setUsername(e.target.value)} />

{/* Event Binding */}
<button onClick={save}>Save</button>

{/* Conditional */}
{isVisible && <div>Content</div>}

{/* Loop */}
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}

{/* Class Binding */}
<div className={`base-class ${isActive ? 'active' : ''}`}>Content</div>

{/* Style Binding */}
<div style={{ color: textColor }}>Content</div>
```

---

## 🏗️ Services vs Hooks

### Angular Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users$ = new BehaviorSubject<User[]>([]);
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
  
  addUser(user: User): Observable<User> {
    return this.http.post<User>('/api/users', user);
  }
}
```

### React Custom Hook
```typescript
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  const getUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };
  
  const addUser = async (user: User) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    return response.json();
  };
  
  return { users, loading, getUsers, addUser };
};
```

---

## 🛣️ Routing

### Angular Router
```typescript
// app-routing.module.ts
const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'users/:id', component: UserDetailComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];

// Component
constructor(private router: Router, private route: ActivatedRoute) {}

navigateToUser(id: string) {
  this.router.navigate(['/users', id]);
}

ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
}
```

### Next.js Router
```typescript
// File-based routing: pages/dashboard.tsx, pages/users/[id].tsx

import { useRouter } from 'next/router';

const MyComponent = () => {
  const router = useRouter();
  
  const navigateToUser = (id: string) => {
    router.push(`/users/${id}`);
  };
  
  // Get route parameters
  const { id } = router.query;
};
```

---

## 📝 Forms

### Angular Reactive Forms
```typescript
export class UserFormComponent {
  userForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]]
  });
  
  constructor(private fb: FormBuilder) {}
  
  onSubmit() {
    if (this.userForm.valid) {
      console.log(this.userForm.value);
    }
  }
}
```

```html
<form [formGroup]="userForm" (ngSubmit)="onSubmit()">
  <input formControlName="name" />
  <div *ngIf="userForm.get('name')?.errors?.['required']">
    Name is required
  </div>
  <button type="submit" [disabled]="userForm.invalid">Submit</button>
</form>
```

### React Forms
```typescript
const UserForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<any>({});
  
  const validate = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      {errors.name && <div>{errors.name}</div>}
      <button type="submit">Submit</button>
    </form>
  );
};
```

---

## 🎨 Styling

### Angular
```typescript
// Component styles
@Component({
  styleUrls: ['./component.css'],
  styles: [`
    .my-class { color: red; }
  `]
})

// Global styles in styles.css
// CSS classes with [class.active]="condition"
```

### React with Tailwind
```typescript
// Inline styles
<div style={{ color: 'red', fontSize: '16px' }}>

// CSS classes
<div className="text-red-500 text-lg">

// Conditional classes
<div className={`base-class ${isActive ? 'active' : 'inactive'}`}>

// Tailwind utilities
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800">
```

---

## 🔧 Common Patterns

### Angular Dependency Injection
```typescript
constructor(
  private userService: UserService,
  private router: Router
) {}
```

### React Context/Hooks
```typescript
const userService = useUserService();
const router = useRouter();
```

### Angular Pipes
```html
{{ user.name | uppercase }}
{{ user.createdAt | date:'short' }}
{{ users | async }}
```

### React Functions
```jsx
{user.name.toUpperCase()}
{new Date(user.createdAt).toLocaleDateString()}
{/* Use custom hooks for async data */}
```

---

## 📦 Project Structure Comparison

### Angular
```
src/
├── app/
│   ├── components/
│   ├── services/
│   ├── models/
│   ├── guards/
│   └── modules/
├── assets/
└── environments/
```

### React/Next.js
```
src/
├── components/
├── hooks/
├── types/
├── contexts/
└── utils/
pages/
styles/
public/
```

---

## 🚀 Quick Migration Tips

1. **Start Small**: Convert one component at a time
2. **Think Functional**: React is more functional, less class-based
3. **State Management**: Use useState for local state, Context for global
4. **Effects**: useEffect replaces most lifecycle methods
5. **Props**: React props = Angular @Input/@Output
6. **Styling**: Tailwind CSS replaces Angular Material
7. **Routing**: File-based routing is simpler than Angular Router
8. **Forms**: More manual but flexible than Angular Reactive Forms

---

## 🆘 Common Gotchas

1. **JSX**: Use `className` not `class`, `htmlFor` not `for`
2. **Events**: React events are SyntheticEvents, not native DOM events
3. **Keys**: Always provide `key` prop when rendering lists
4. **State Updates**: State updates are asynchronous
5. **useEffect**: Dependencies array is crucial for performance
6. **Immutability**: Always create new objects/arrays when updating state

---

This cheat sheet should help your Angular developers quickly understand the React equivalents and start being productive in the Exception Hub application!