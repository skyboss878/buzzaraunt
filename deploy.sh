#!/bin/bash

# Production Deployment Script for AI Marketing Creator Frontend
# Run this script from your project root directory (e.g., ~/buzzaraunt/)

set -e  # Exit on any error

echo "🚀 Starting production deployment process for frontend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output - THESE MUST BE AT THE TOP!
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# --- Frontend Deployment Steps ---

print_status "Starting frontend deployment steps..."

# Check if frontend directory exists and navigate into it
if [ ! -d "frontend" ]; then
    print_error "Frontend directory (./frontend) not found. Please ensure it exists at the root of your project."
    exit 1
fi

print_status "Changing to frontend directory: ./frontend"
cd frontend || { print_error "Failed to change to frontend directory. Exiting."; exit 1; }

# Check if we're in the right directory within frontend
if [ ! -f "package.json" ]; then
    print_error "package.json not found in frontend directory. Ensure you are in the correct frontend project folder."
    # Exit here, as subsequent npm commands will fail
    exit 1
fi

# Check Node.js version (from package.json engines)
REQUIRED_NODE_VERSION=$(grep '"node":' package.json | cut -d'"' -f4 | cut -d'>' -f2 | cut -d'.' -f1 | tr -d ' ' || echo 18) # Default to 18 if not found
CURRENT_NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)

print_status "Checking Node.js version..."
if [ "$CURRENT_NODE_VERSION" -lt "$REQUIRED_NODE_VERSION" ]; then
    print_error "Node.js version $REQUIRED_NODE_VERSION or higher is required. Current version: $(node --version)"
    exit 1
fi
print_success "Node.js version: $(node --version) ✓"

# Check if backend is running (assuming backend is sibling to frontend, at ../backend)
BACKEND_PORT=4000 # Make sure this matches your backend's actual port from server.js
print_status "Checking backend connection on port $BACKEND_PORT (at http://localhost:$BACKEND_PORT/)..."
# Temporarily go up to root to check backend, then return
cd ..
if curl -f http://localhost:$BACKEND_PORT/ > /dev/null 2>&1; then
    print_success "Backend is responding on http://localhost:$BACKEND_PORT/ ✓"
else
    print_warning "Backend is NOT responding on http://localhost:$BACKEND_PORT/. This might be okay for purely static deployments, but verify your setup."
fi
# Return to frontend directory
cd frontend


# Install dependencies if node_modules doesn't exist or package.json/package-lock.json are newer
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ] || [ "package-lock.json" -nt "node_modules" ]; then
    print_status "Installing production dependencies with npm ci (frontend)..."
    npm ci --only=production
    print_success "Frontend dependencies installed ✓"
else
    print_status "Frontend dependencies are up to date ✓"
fi

# Run pre-deployment checks (linting, formatting)
print_status "Running pre-deployment checks (lint & format check - frontend)..."
# Check if ESLint and Prettier configs exist before running. Remove these if you don't use them.
if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ]; then
    if npm run lint:check && npm run format:check; then
        print_success "Frontend lint and format checks passed ✓"
    else
        print_warning "Frontend lint or format issues found. It's recommended to fix them before deploying. Run 'npm run lint:fix' and 'npm run format'."
        # Optionally, exit here if you want strict pre-deployment checks:
        # exit 1
    fi
else
    print_warning "ESLint or Prettier config not found. Skipping lint/format checks."
fi


# Clean previous build
print_status "Cleaning previous frontend build artifacts..."
if npm run clean; then
    print_success "Frontend build directory cleaned ✓"
else
    print_warning "Failed to run 'npm run clean' for frontend. Proceeding anyway, but inspect manually."
fi


# Build for production
print_status "Building frontend for production..."
# Vite automatically handles NODE_ENV=production during 'vite build'
if npm run build; then
    print_success "Frontend build completed successfully into 'dist/' directory ✓"
else
    print_error "Frontend build failed! Check build logs above."
    exit 1
fi

# Check build size
if [ -d "dist" ]; then
    BUILD_SIZE=$(du -sh dist/ | awk '{print $1}')
    print_status "Final frontend build size: $BUILD_SIZE"

    BUILD_SIZE_MB=$(du -sm dist/ | awk '{print $1}')
    if [ "$BUILD_SIZE_MB" -gt 50 ]; then
        print_warning "Frontend build size is quite large ($BUILD_SIZE_MB MB). Consider optimizing assets, images, and code splitting."
    else
        print_success "Frontend build size ($BUILD_SIZE_MB MB) is within reasonable limits."
    fi
else
    print_error "Frontend 'dist/' directory not found after build process. Build likely failed or outputPath is different."
    exit 1
fi

print_success "Frontend deployment script finished. Your production build is in the 'dist/' directory within your frontend folder."

# --- Return to root directory after frontend steps ---
print_status "Returning to project root directory..."
cd ..

# --- Optional: Backend Deployment Steps (Uncomment and configure if needed) ---
# print_status "Starting backend deployment steps (if configured)..."
# if [ -d "backend" ]; then
#     print_status "Changing to backend directory: ./backend"
#     cd backend || { print_error "Failed to change to backend directory. Exiting."; exit 1; }

#     print_status "Installing backend dependencies..."
#     npm ci --only=production || npm install # Use npm ci if package-lock.json is reliable

#     # For production, you might not run 'dev'. You might start it with a process manager like PM2.
#     # For simple deployments, you might just ensure dependencies are installed.
#     # npm start # Or whatever your production start command is

#     print_status "Returning to project root directory..."
#     cd ..
# else
#     print_warning "Backend directory (./backend) not found. Skipping backend deployment steps."
# fi

print_success "Deployment script completed."

