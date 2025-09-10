# Environment Setup Guide

This document explains how to configure the Exception Hub application for different environments (development, staging, production).

## Environment Files

The application uses different environment files for different deployment scenarios:

### 1. `.env.local` (Local Development)
Used for local development with mock data:
```
NEXT_PUBLIC_CO_DEV_ENV=mock
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_AVATAR_URL=https://api.dicebear.com/7.x/initials/svg
```

### 2. `.env.development` (Development Environment)
Used for development builds:
```
NEXT_PUBLIC_CO_DEV_ENV=mock
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_AVATAR_URL=https://api.dicebear.com/7.x/initials/svg
```

### 3. `.env.staging` (Staging Environment)
Used for staging deployments:
```
NEXT_PUBLIC_CO_DEV_ENV=staging
NEXT_PUBLIC_API_URL=http://staging-server:8080
NEXT_PUBLIC_AVATAR_URL=https://api.dicebear.com/7.x/initials/svg
```

### 4. `.env.production` (Production Environment)
Used for production deployments:
```
NEXT_PUBLIC_CO_DEV_ENV=production
NEXT_PUBLIC_API_URL=http://production-server:8080
NEXT_PUBLIC_AVATAR_URL=https://api.dicebear.com/7.x/initials/svg
```

## Environment Variables

### `NEXT_PUBLIC_CO_DEV_ENV`
- **Purpose**: Determines the application environment mode
- **Values**: 
  - `mock`: Uses mock data for all API calls
  - `development`: Development environment
  - `staging`: Staging environment  
  - `production`: Production environment

### `NEXT_PUBLIC_API_URL`
- **Purpose**: Base URL for API calls, including Windows AD authentication
- **Examples**:
  - Local: `http://localhost:3000`
  - Staging: `http://staging-server:8080`
  - Production: `http://production-server:8080`

### `NEXT_PUBLIC_AVATAR_URL`
- **Purpose**: Base URL for generating user avatar images
- **Default**: `https://api.dicebear.com/7.x/initials/svg`

## Mock Data

When `NEXT_PUBLIC_CO_DEV_ENV` is set to `mock` or when `NODE_ENV` is `development`, the application uses mock data:

### User Data
- Located in: `src/data/mock-users.json`
- Contains 10 sample users with different roles and locations
- Randomly selects a user on each session for demonstration

### Exception Data
- Located in: `src/data/exceptions.json`
- Contains sample exception records for testing and development

## API Integration

### Windows AD Authentication
- **Endpoint**: `${NEXT_PUBLIC_API_URL}/api/getADUsers`
- **Method**: GET
- **Authentication**: Windows Authentication (credentials: include)
- **Fallback**: Uses mock data if API call fails

### User Context
The application provides a global user context that:
- Fetches user data from Windows AD API in production
- Uses random mock users in development/mock mode
- Provides user information throughout the application
- Handles loading states and error scenarios

## Deployment Instructions

### For Development
1. Copy `.env.example` to `.env.local`
2. Update values as needed for your local setup
3. Run `npm run dev`

### For Staging
1. Use `.env.staging` configuration
2. Update `NEXT_PUBLIC_API_URL` to point to staging server
3. Deploy using your staging deployment process

### For Production
1. Use `.env.production` configuration
2. Update `NEXT_PUBLIC_API_URL` to point to production server
3. Ensure Windows AD authentication is properly configured
4. Deploy using your production deployment process

## Routing

The application uses Next.js file-based routing with proper browser URL support:

- `/dashboard` - Main dashboard
- `/exceptions` - Exception management
- `/workflow` - Workflow management
- `/reports` - Standard reports
- `/adhoc-reports` - Ad-hoc reporting with exception data
- `/admin` - Administration panel

Each route is properly configured in the sidebar navigation and supports direct browser navigation.

## Features by Environment

### Mock Environment
- Random user selection from mock data
- Sample exception data
- All functionality available for testing
- No external API dependencies

### Production Environment
- Windows AD integration for user authentication
- Real-time API calls with loading indicators
- Audit trail with authenticated user information
- Full exception management capabilities

## Troubleshooting

### Common Issues

1. **User data not loading**: Check `NEXT_PUBLIC_API_URL` and ensure the API endpoint is accessible
2. **Mock data not appearing**: Verify `NEXT_PUBLIC_CO_DEV_ENV` is set to `mock`
3. **Routing issues**: Ensure all page files exist in the `pages/` directory
4. **Environment variables not working**: Restart the development server after changing `.env` files

### Debug Mode
Set `NODE_ENV=development` to enable additional logging and error information.