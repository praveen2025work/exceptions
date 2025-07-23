# Exception Hub

A comprehensive exception management hub for regulatory compliance, processing financial instrument position data with automated exception detection, aging management, workflow integration, and real-time monitoring. Built with Next.js, React, TypeScript, and Tailwind CSS.

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
   cd exception-hub
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

### Windows Server IIS Deployment (Recommended for Enterprise)

#### Prerequisites

1. **Windows Server** with IIS installed
2. **Node.js** (version 18 or higher) installed on the server
3. **IIS URL Rewrite Module** installed
4. **IIS Application Request Routing (ARR)** installed (optional, for load balancing)

#### Step-by-Step IIS Deployment

##### 1. Prepare the Application

```bash
# Clone the repository on your development machine
git clone [repository-url]
cd exception-hub

# Install dependencies
npm install

# Create production build
npm run build

# The build output will be in the .next folder
```

##### 2. Server Setup

**Install Required IIS Features:**
```powershell
# Run as Administrator
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer
Enable-WindowsOptionalFeature -Online -FeatureName IIS-CommonHttpFeatures
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpErrors
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpLogging
Enable-WindowsOptionalFeature -Online -FeatureName IIS-RequestFiltering
Enable-WindowsOptionalFeature -Online -FeatureName IIS-StaticContent
```

**Install Node.js on Windows Server:**
1. Download Node.js LTS from https://nodejs.org/
2. Install with default settings
3. Verify installation: `node --version` and `npm --version`

**Install IIS URL Rewrite Module:**
1. Download from: https://www.iis.net/downloads/microsoft/url-rewrite
2. Install the module
3. Restart IIS

##### 3. Deploy to IIS

**Option A: Static Export (Recommended for IIS)**

1. **Modify next.config.mjs for static export:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['assets.co.dev'],
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/exception-management' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/exception-management' : '',
};

export default nextConfig;
```

2. **Build for static export:**
```bash
npm run build
```

3. **Copy files to IIS:**
   - Copy the entire `out` folder contents to `C:\inetpub\wwwroot\exception-management\`
   - Or your preferred IIS site directory

4. **Configure IIS Site:**
   - Open IIS Manager
   - Create new site or application
   - Set physical path to your deployment folder
   - Set binding (port 80/443)

**Option B: Node.js with IIS (For Server-Side Rendering)**

1. **Install iisnode:**
   - Download from: https://github.com/Azure/iisnode
   - Install the appropriate version (x64/x86)

2. **Create web.config in your deployment folder:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    <httpErrors existingResponse="PassThrough" />
    <iisnode watchedFiles="web.config;*.js"/>
  </system.webServer>
</configuration>
```

3. **Create server.js:**
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

4. **Deploy files:**
   - Copy entire project to `C:\inetpub\wwwroot\exception-management\`
   - Run `npm install --production` on the server
   - Configure IIS site to point to this directory

##### 4. Environment Variables Setup

**Set environment variables in IIS:**

1. **Open IIS Manager**
2. **Select your application**
3. **Double-click "Configuration Editor"**
4. **Navigate to:** `system.webServer/iisnode`
5. **Add environment variables:**
   ```
   NEXT_PUBLIC_AVATAR_URL=https://your-api-endpoint.com/avatar
   NODE_ENV=production
   ```

**Alternative - Use web.config:**
```xml
<configuration>
  <system.webServer>
    <iisnode>
      <environmentVariables>
        <add name="NEXT_PUBLIC_AVATAR_URL" value="https://your-api-endpoint.com/avatar" />
        <add name="NODE_ENV" value="production" />
      </environmentVariables>
    </iisnode>
  </system.webServer>
</configuration>
```

##### 5. SSL/HTTPS Configuration

1. **Obtain SSL Certificate**
2. **Bind certificate in IIS:**
   - Right-click site → Edit Bindings
   - Add HTTPS binding (port 443)
   - Select your SSL certificate

3. **Force HTTPS redirect (web.config):**
```xml
<rule name="Redirect to HTTPS" stopProcessing="true">
  <match url=".*" />
  <conditions>
    <add input="{HTTPS}" pattern="off" ignoreCase="true" />
  </conditions>
  <action type="Redirect" url="https://{HTTP_HOST}/{R:0}" redirectType="Permanent" />
</rule>
```

##### 6. Performance Optimization

**Enable compression in web.config:**
```xml
<system.webServer>
  <httpCompression>
    <dynamicTypes>
      <add mimeType="application/json" enabled="true" />
      <add mimeType="application/javascript" enabled="true" />
    </dynamicTypes>
    <staticTypes>
      <add mimeType="text/css" enabled="true" />
      <add mimeType="application/javascript" enabled="true" />
    </staticTypes>
  </httpCompression>
</system.webServer>
```

**Set caching headers:**
```xml
<location path="static">
  <system.webServer>
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="31536000" />
    </staticContent>
  </system.webServer>
</location>
```

##### 7. Monitoring and Logging

**Enable detailed logging:**
```xml
<system.webServer>
  <iisnode loggingEnabled="true" logDirectory="logs" />
</system.webServer>
```

**Monitor application:**
- Check IIS logs in `C:\inetpub\logs\LogFiles\`
- Monitor Node.js logs in your application's `logs` folder
- Use Windows Event Viewer for system-level issues

##### 8. Troubleshooting Common Issues

**Issue: 500 Internal Server Error**
- Check iisnode logs
- Verify Node.js is installed correctly
- Ensure all dependencies are installed

**Issue: Static files not loading**
- Verify URL Rewrite rules
- Check file permissions
- Ensure static content handler is enabled

**Issue: Environment variables not working**
- Verify web.config syntax
- Restart IIS application pool
- Check iisnode configuration

##### 9. Security Considerations

1. **Firewall Configuration:**
   - Open only necessary ports (80, 443)
   - Restrict access to management ports

2. **Application Pool Identity:**
   - Use least privilege principle
   - Create dedicated service account

3. **File Permissions:**
   - Grant read access to IIS_IUSRS
   - Restrict write access to logs folder only

4. **Regular Updates:**
   - Keep Node.js updated
   - Update application dependencies
   - Apply Windows security patches

### Alternative Deployment Options

For firm-wide deployment, also consider:
- **Azure App Service** (Microsoft's cloud platform)
- **AWS EC2** with Windows Server
- **Docker containers** on Windows Server
- **Internal company cloud infrastructure**
- **Hybrid cloud solutions**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for internal use.