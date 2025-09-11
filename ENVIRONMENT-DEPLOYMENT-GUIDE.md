# Environment Deployment Guide

This guide explains how to build and deploy the Exception Hub application for different environments with the new multi-API URL configuration.

## Environment Configuration

The application now supports four environments with three separate API URLs each:

### Environment Files

- `.env.dev` - Development Environment
- `.env.uat` - User Acceptance Testing Environment  
- `.env.prod` - Production Environment
- `.env.dr` - Disaster Recovery Environment

### API URL Configuration

Each environment file contains three separate API URLs:

1. **User Info API URL** (`NEXT_PUBLIC_USER_INFO_API_URL`)
   - Used for: Top header panel user info, Windows AD authentication
   - Endpoints: `/api/getADUsers`, `/api/user/*`

2. **Exception Data API URL** (`NEXT_PUBLIC_EXCEPTION_API_URL`)
   - Used for: Exception data, commentary, file uploads, categories
   - Endpoints: `/api/exception*`, `/api/upload*`, `/api/file*`, `/api/comment*`

3. **BAM Authentication API URL** (`NEXT_PUBLIC_BAM_AUTH_API_URL`)
   - Used for: BAM authentication services
   - Endpoints: `/api/auth*`, `/api/bam*`

## Building for Specific Environments

### Using NPM Scripts

```bash
# Build for Development
npm run build:dev

# Build for UAT
npm run build:uat

# Build for Production
npm run build:prod

# Build for Disaster Recovery
npm run build:dr

# Build all environments at once
npm run build:all
```

### Using Batch Files (Windows)

```bash
# Build for Development
build-dev.bat

# Build for UAT
build-uat.bat

# Build for Production
build-prod.bat

# Build for Disaster Recovery
build-dr.bat

# Build all environments
build-all.bat
```

## Build Output Structure

After building, the output will be organized as follows:

```
dist/
├── dev/          # Development build
├── uat/          # UAT build
├── prod/         # Production build
└── dr/           # DR build
```

Each folder contains a complete static build ready for IIS deployment.

## IIS Deployment

### Prerequisites

1. IIS with URL Rewrite module installed
2. Node.js (for building only, not required on production server)
3. Appropriate network access to API servers

### Deployment Steps

1. **Build the application** for your target environment:
   ```bash
   npm run build:prod  # or build-prod.bat
   ```

2. **Copy the build output** to your IIS web directory:
   ```bash
   # Copy contents of dist/prod/ to your IIS site folder
   xcopy /E /I /Y "dist\prod\*" "C:\inetpub\wwwroot\exception-hub\"
   ```

3. **Configure IIS site** to point to the deployment folder

4. **Verify web.config** is present (should be copied automatically)

### Environment-Specific Deployment

For multiple environments on the same server:

```
C:\inetpub\wwwroot\
├── exception-hub-dev/     # Development site
├── exception-hub-uat/     # UAT site
├── exception-hub-prod/    # Production site
└── exception-hub-dr/      # DR site
```

## Environment Variables Reference

### Development (.env.dev)
```env
NEXT_PUBLIC_CO_DEV_ENV=development
NEXT_PUBLIC_USER_INFO_API_URL=http://dev-server:8080/api
NEXT_PUBLIC_EXCEPTION_API_URL=http://dev-server:8081/api
NEXT_PUBLIC_BAM_AUTH_API_URL=http://dev-server:8082/api
NEXT_PUBLIC_AVATAR_URL=https://api.dicebear.com/7.x/initials/svg
```

### UAT (.env.uat)
```env
NEXT_PUBLIC_CO_DEV_ENV=uat
NEXT_PUBLIC_USER_INFO_API_URL=http://uat-server:8080/api
NEXT_PUBLIC_EXCEPTION_API_URL=http://uat-server:8081/api
NEXT_PUBLIC_BAM_AUTH_API_URL=http://uat-server:8082/api
NEXT_PUBLIC_AVATAR_URL=https://api.dicebear.com/7.x/initials/svg
```

### Production (.env.prod)
```env
NEXT_PUBLIC_CO_DEV_ENV=production
NEXT_PUBLIC_USER_INFO_API_URL=http://prod-server:8080/api
NEXT_PUBLIC_EXCEPTION_API_URL=http://prod-server:8081/api
NEXT_PUBLIC_BAM_AUTH_API_URL=http://prod-server:8082/api
NEXT_PUBLIC_AVATAR_URL=https://api.dicebear.com/7.x/initials/svg
```

### Disaster Recovery (.env.dr)
```env
NEXT_PUBLIC_CO_DEV_ENV=dr
NEXT_PUBLIC_USER_INFO_API_URL=http://dr-server:8080/api
NEXT_PUBLIC_EXCEPTION_API_URL=http://dr-server:8081/api
NEXT_PUBLIC_BAM_AUTH_API_URL=http://dr-server:8082/api
NEXT_PUBLIC_AVATAR_URL=https://api.dicebear.com/7.x/initials/svg
```

## Customizing Environment URLs

To customize URLs for your specific environment:

1. **Edit the appropriate environment file** (e.g., `.env.prod`)
2. **Update the server names and ports** to match your infrastructure
3. **Rebuild the application** using the corresponding build command
4. **Redeploy** to IIS

Example customization:
```env
# Custom production URLs
NEXT_PUBLIC_USER_INFO_API_URL=https://userapi.company.com/api
NEXT_PUBLIC_EXCEPTION_API_URL=https://exceptionapi.company.com/api
NEXT_PUBLIC_BAM_AUTH_API_URL=https://authapi.company.com/api
```

## API Endpoint Routing

The application automatically routes API calls to the appropriate server based on the endpoint:

- **User Info endpoints** → `NEXT_PUBLIC_USER_INFO_API_URL`
  - `/api/getADUsers`
  - `/api/user/*`

- **BAM Authentication endpoints** → `NEXT_PUBLIC_BAM_AUTH_API_URL`
  - `/api/auth*`
  - `/api/bam*`

- **Exception Data endpoints** → `NEXT_PUBLIC_EXCEPTION_API_URL` (default for all other endpoints)
  - `/api/exception*`
  - `/api/upload*`
  - `/api/file*`
  - `/api/comment*`
  - All other API endpoints

## Troubleshooting

### Build Issues

1. **Environment file not found**: Ensure the environment file exists and has the correct name
2. **Permission errors**: Run command prompt as administrator
3. **Node modules issues**: Run `npm install` before building

### Deployment Issues

1. **API calls failing**: Verify the URLs in your environment file are correct and accessible
2. **Authentication issues**: Ensure Windows authentication is properly configured in IIS
3. **CORS errors**: Configure your API servers to allow requests from your web application domain

### Network Connectivity

1. **Test API endpoints** manually using tools like Postman or curl
2. **Verify firewall rules** allow communication between web server and API servers
3. **Check DNS resolution** for server names used in environment files

## Best Practices

1. **Use HTTPS** in production environments
2. **Implement proper error handling** for API failures
3. **Monitor API performance** and set appropriate timeouts
4. **Keep environment files secure** and don't commit sensitive URLs to version control
5. **Test thoroughly** in each environment before promoting to production
6. **Maintain separate IIS sites** for each environment to avoid conflicts