# Exception Management System

A comprehensive exception management system for regulatory compliance, processing financial instrument position data with automated exception detection, aging management, workflow integration, and real-time monitoring. Built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- **Dashboard**: Real-time metrics, exception aging visualization, and comprehensive exception list
- **Exception Management**: Level 6 categories with responsive panels and filtering capabilities
- **Workflow Management**: 6-step workflow process with detailed tracking and bulk operations
- **Multi-Theme Support**: Light, Dark, Ocean, Modern, and System themes
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Updates**: Live exception status updates and notifications

## Tech Stack

- **Framework**: Next.js 14
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **Build Tool**: Vite (for development tooling)

## Getting Started

### Prerequisites

Make sure you have Node.js installed (version 14 or higher).

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd exception-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the application.

## Running Locally for Team Access

### Option 1: Local Network Access (Recommended for Internal Use)

1. **Find your computer's IP address:**
   - **Windows**: Open Command Prompt and run `ipconfig`
   - **Mac/Linux**: Open Terminal and run `ifconfig` or `ip addr show`
   - Look for your local IP (usually starts with 192.168.x.x or 10.x.x.x)

2. **Start the server with host binding:**
   ```bash
   npm run dev -- -H 0.0.0.0
   # or
   next dev -H 0.0.0.0
   ```

3. **Share the URL with your team:**
   Others can access it using: `http://[YOUR-IP-ADDRESS]:3000`
   - Example: `http://192.168.1.100:3000`

### Option 2: Using Tunneling Services (For External Access)

**Using ngrok:**
1. Install ngrok from https://ngrok.com/
2. Run your Next.js app: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Share the provided ngrok URL (e.g., `https://abc123.ngrok.io`)

**Using Cloudflare Tunnel:**
1. Install cloudflared
2. Run: `cloudflared tunnel --url http://localhost:3000`

### Option 3: Production Build

For a more stable deployment:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

## Important Security Considerations

1. **Firewall**: Ensure your company firewall allows the port (default 3000)
2. **Network Access**: Verify your network allows other devices to connect to your machine
3. **HTTPS**: For production use, consider setting up HTTPS
4. **Authentication**: Consider adding authentication for firm-wide use

## Troubleshooting

1. **Port already in use**: Use a different port:
   ```bash
   npm run dev -- -p 3001
   ```

2. **Can't access from other machines**: 
   - Check Windows Defender/firewall settings
   - Ensure you're using `0.0.0.0` as the host
   - Verify the IP address is correct

3. **Network restrictions**: Some corporate networks block peer-to-peer connections. Contact your IT department or use tunneling services.

## Project Structure

```
├── pages/                 # Next.js pages
│   ├── _app.js           # App wrapper with theme provider
│   └── index.js          # Main application page
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── ExceptionDashboard.tsx
│   │   ├── ExceptionList.tsx
│   │   ├── WorkflowTab.tsx
│   │   └── WorkflowStepTab.tsx
│   ├── contexts/        # React contexts
│   │   └── ThemeContext.tsx
│   ├── types/           # TypeScript type definitions
│   └── lib/             # Utility functions
├── styles/              # Global styles
└── public/              # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Customization

### User Profile Configuration

To customize the user profile image API:

1. Open `pages/index.js`
2. Locate the `fetchUserImage` function (lines 18-30)
3. Replace the placeholder API URL with your actual endpoint:

```javascript
// Replace this with your API endpoint
const response = await fetch('/api/user/profile');
const userData = await response.json();
setUserImage(userData.profileImage);
```

### Theme Customization

The application supports 5 themes:
- Light
- Dark
- Ocean
- Modern
- System (follows OS preference)

To add new themes, modify:
- `src/contexts/ThemeContext.tsx`
- `src/components/ThemeToggle.tsx`
- `src/index.css`
- `tailwind.config.js`

## Production Deployment Options

For firm-wide deployment, consider:
- Internal company servers
- Cloud platforms (AWS, Azure, Google Cloud)
- Container platforms (Docker + Kubernetes)
- Company's internal hosting infrastructure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for internal use.