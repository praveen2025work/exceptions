# Simple IIS Deployment Guide - Angular Style

This guide shows how to deploy your Exception Hub React/Next.js application to IIS exactly like you would deploy an Angular application - using just static files.

## Quick Deployment Steps (Just like Angular)

### 1. Build the Static Files

```bash
# Install dependencies (if not already done)
npm install

# Build static files (creates 'out' folder - equivalent to Angular's 'dist')
npm run build
```

This creates an `out` folder with all static HTML, CSS, and JavaScript files - just like Angular's `dist` folder.

### 2. Deploy to IIS

**Copy the `out` folder contents to your IIS directory:**

```
Copy everything from: /out/
To: C:\inetpub\wwwroot\exception-hub\
```

**That's it!** Just like Angular deployment.

### 3. Configure IIS (One-time setup)

Create a `web.config` file in your IIS directory:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- Handle client-side routing -->
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    
    <!-- Enable compression -->
    <httpCompression>
      <staticTypes>
        <add mimeType="text/css" enabled="true" />
        <add mimeType="application/javascript" enabled="true" />
        <add mimeType="application/json" enabled="true" />
      </staticTypes>
    </httpCompression>
    
    <!-- Set cache headers -->
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="31536000" />
    </staticContent>
  </system.webServer>
</configuration>
```

## Comparison with Angular

| Step | Angular | React/Next.js (Static Export) |
|------|---------|-------------------------------|
| Build Command | `ng build` | `npm run build` |
| Output Folder | `dist/` | `out/` |
| Deployment | Copy `dist/` to IIS | Copy `out/` to IIS |
| Configuration | `web.config` for routing | `web.config` for routing |
| Runtime Required | None (static files) | None (static files) |

## Automated Deployment Script

Create a simple batch file `deploy-simple.bat`:

```batch
@echo off
echo Building Exception Hub...
npm run build

echo Copying files to IIS...
xcopy /E /I /Y out\* C:\inetpub\wwwroot\exception-hub\

echo Deployment complete!
echo Visit: http://localhost/exception-hub
pause
```

## Advantages of Static Export

✅ **Simple deployment** - Just copy files like Angular  
✅ **No Node.js required** on server  
✅ **Better performance** - Static files served directly by IIS  
✅ **Easier maintenance** - No server-side processes to manage  
✅ **Better security** - No server-side code execution  
✅ **Familiar process** - Exactly like Angular deployment  

## Limitations

❌ **No server-side rendering** (SSR)  
❌ **No API routes** (but you can use separate API server)  
❌ **No dynamic imports** at runtime  

## Environment Variables

For static export, environment variables must be set at build time:

```bash
# Windows
set NEXT_PUBLIC_AVATAR_URL=https://your-api.com/avatar
npm run build

# Linux/Mac
NEXT_PUBLIC_AVATAR_URL=https://your-api.com/avatar npm run build
```

## Troubleshooting

**Issue: Blank page after deployment**
- Check browser console for errors
- Verify all files copied correctly
- Check `web.config` syntax

**Issue: 404 errors on page refresh**
- Ensure URL Rewrite module is installed in IIS
- Verify `web.config` rewrite rules are correct

**Issue: Images not loading**
- Check image paths in your code
- Verify images are in the `out` folder after build

## Summary

Your Exception Hub React/Next.js application can now be deployed to IIS exactly like an Angular application:

1. **Build**: `npm run build` (creates `out` folder)
2. **Deploy**: Copy `out` folder contents to IIS
3. **Configure**: Add `web.config` for routing
4. **Done**: Static files served by IIS

No Node.js runtime, no complex setup - just static files like Angular!