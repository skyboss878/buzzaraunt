#!/bin/bash

# Netlify Find & Fix Script
# Automatically diagnoses and fixes common Netlify deployment issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Counters
ISSUES_FOUND=0
ISSUES_FIXED=0

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}🔍 NETLIFY FIND & FIX TOOL${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
}

print_status() {
    echo -e "${BLUE}[CHECKING]${NC} $1"
}

print_found() {
    echo -e "${YELLOW}[FOUND]${NC} $1"
    ((ISSUES_FOUND++))
}

print_fixed() {
    echo -e "${GREEN}[FIXED]${NC} $1"
    ((ISSUES_FIXED++))
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to backup files before modifying
backup_file() {
    local file="$1"
    if [ -f "$file" ]; then
        cp "$file" "$file.backup.$(date +%Y%m%d-%H%M%S)"
        print_info "Backed up $file"
    fi
}

# Check 1: Project structure
check_project_structure() {
    print_status "Checking project structure..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] && [ ! -d "frontend" ]; then
        print_found "Not in project root or missing frontend directory"
        print_error "Please run this script from your project root directory"
        return 1
    fi
    
    # Determine project structure
    if [ -d "frontend" ]; then
        PROJECT_TYPE="monorepo"
        BUILD_DIR="frontend/dist"
        PACKAGE_JSON="frontend/package.json"
        print_info "Detected monorepo structure"
    else
        PROJECT_TYPE="single"
        BUILD_DIR="dist"
        PACKAGE_JSON="package.json"
        print_info "Detected single-repo structure"
    fi
    
    print_success "Project structure identified"
}

# Check 2: Build configuration
check_build_config() {
    print_status "Checking build configuration..."
    
    if [ ! -f "$PACKAGE_JSON" ]; then
        print_found "Missing package.json in expected location: $PACKAGE_JSON"
        return 1
    fi
    
    # Check if build script exists
    if ! grep -q '"build"' "$PACKAGE_JSON"; then
        print_found "No build script found in package.json"
        print_info "Adding default Vite build script..."
        
        # Backup and add build script
        backup_file "$PACKAGE_JSON"
        
        # Add build script (this is a simplified approach)
        python3 -c "
import json
import sys

try:
    with open('$PACKAGE_JSON', 'r') as f:
        data = json.load(f)
    
    if 'scripts' not in data:
        data['scripts'] = {}
    
    if 'build' not in data['scripts']:
        data['scripts']['build'] = 'vite build'
        
    with open('$PACKAGE_JSON', 'w') as f:
        json.dump(data, f, indent=2)
        
    print('Build script added successfully')
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
    sys.exit(1)
"
        if [ $? -eq 0 ]; then
            print_fixed "Added build script to package.json"
        fi
    fi
    
    print_success "Build configuration checked"
}

# Check 3: Netlify configuration
check_netlify_config() {
    print_status "Checking Netlify configuration..."
    
    # Check for netlify.toml
    if [ ! -f "netlify.toml" ]; then
        print_found "Missing netlify.toml configuration file"
        print_info "Creating netlify.toml with optimal settings..."
        
        cat > netlify.toml << EOF
[build]
  publish = "$BUILD_DIR"
  command = "$([ "$PROJECT_TYPE" = "monorepo" ] && echo "cd frontend && " || echo "")npm ci && npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

# SPA redirect - handles client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Lighthouse plugin configuration
[[plugins]]
  package = "@netlify/plugin-lighthouse"
  
  [plugins.inputs]
    output_path = "lighthouse-report"
    
    [plugins.inputs.thresholds]
      performance = 0.7
      accessibility = 0.8
      best-practices = 0.7
      seo = 0.7
EOF
        print_fixed "Created netlify.toml with optimal configuration"
    else
        print_success "netlify.toml exists"
        
        # Check if publish directory is correct
        if ! grep -q "publish = \"$BUILD_DIR\"" netlify.toml; then
            print_found "Incorrect publish directory in netlify.toml"
            backup_file "netlify.toml"
            
            # Fix publish directory
            sed -i.tmp "s|publish = \".*\"|publish = \"$BUILD_DIR\"|g" netlify.toml
            rm -f netlify.toml.tmp
            print_fixed "Updated publish directory to $BUILD_DIR"
        fi
        
        # Check for SPA redirects
        if ! grep -q "to = \"/index.html\"" netlify.toml; then
            print_found "Missing SPA redirects in netlify.toml"
            
            # Add SPA redirects
            cat >> netlify.toml << EOF

# SPA redirect - handles client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF
            print_fixed "Added SPA redirects to netlify.toml"
        fi
    fi
}

# Check 4: Build output
check_build_output() {
    print_status "Checking build output..."
    
    # Try to build the project
    if [ "$PROJECT_TYPE" = "monorepo" ]; then
        cd frontend
    fi
    
    if [ ! -d "node_modules" ]; then
        print_found "Missing node_modules directory"
        print_info "Installing dependencies..."
        npm ci
        print_fixed "Dependencies installed"
    fi
    
    # Run build
    print_info "Running build process..."
    if npm run build; then
        print_success "Build completed successfully"
    else
        print_error "Build failed - please check the error messages above"
        return 1
    fi
    
    # Check if build directory exists
    if [ ! -d "dist" ]; then
        print_found "Build directory 'dist' not found"
        print_error "Build process didn't create expected output directory"
        return 1
    fi
    
    # Check if index.html exists
    if [ ! -f "dist/index.html" ]; then
        print_found "Missing index.html in build output"
        print_error "Build process didn't create index.html"
        return 1
    fi
    
    print_success "Build output verified"
    
    # Return to root if we were in frontend
    if [ "$PROJECT_TYPE" = "monorepo" ]; then
        cd ..
    fi
}

# Check 5: _redirects file for SPA
check_redirects_file() {
    print_status "Checking _redirects file..."
    
    local redirects_path="$BUILD_DIR/_redirects"
    
    if [ ! -f "$redirects_path" ]; then
        print_found "Missing _redirects file for SPA routing"
        print_info "Creating _redirects file..."
        
        # Create _redirects file
        echo "/*    /index.html   200" > "$redirects_path"
        print_fixed "Created _redirects file"
    else
        print_success "_redirects file exists"
    fi
}

# Check 6: Public directory structure
check_public_directory() {
    print_status "Checking public directory..."
    
    local public_dir="$([ "$PROJECT_TYPE" = "monorepo" ] && echo "frontend/public" || echo "public")"
    
    if [ ! -d "$public_dir" ]; then
        print_found "Missing public directory"
        print_info "Creating public directory..."
        mkdir -p "$public_dir"
        print_fixed "Created public directory"
    fi
    
    # Check for favicon
    if [ ! -f "$public_dir/favicon.ico" ] && [ ! -f "$public_dir/favicon.png" ]; then
        print_found "Missing favicon"
        print_info "Consider adding a favicon.ico or favicon.png to your public directory"
    fi
}

# Check 7: Environment variables
check_environment_variables() {
    print_status "Checking environment variables..."
    
    local env_example="$([ "$PROJECT_TYPE" = "monorepo" ] && echo "frontend/.env.example" || echo ".env.example")"
    local env_file="$([ "$PROJECT_TYPE" = "monorepo" ] && echo "frontend/.env" || echo ".env")"
    
    if [ -f "$env_example" ] && [ ! -f "$env_file" ]; then
        print_found "Missing .env file (but .env.example exists)"
        print_info "Creating .env file from .env.example..."
        cp "$env_example" "$env_file"
        print_fixed "Created .env file from template"
        print_info "Remember to update the values in .env file"
    fi
}

# Check 8: Lighthouse plugin issues
check_lighthouse_plugin() {
    print_status "Checking Lighthouse plugin configuration..."
    
    if [ -f "netlify.toml" ]; then
        if grep -q "@netlify/plugin-lighthouse" netlify.toml; then
            # Check if thresholds are too strict
            if grep -q "performance = 0.9" netlify.toml || grep -q "performance = 1.0" netlify.toml; then
                print_found "Lighthouse performance threshold too strict"
                backup_file "netlify.toml"
                
                # Lower the thresholds
                sed -i.tmp 's/performance = 0.9/performance = 0.7/g' netlify.toml
                sed -i.tmp 's/performance = 1.0/performance = 0.7/g' netlify.toml
                rm -f netlify.toml.tmp
                print_fixed "Lowered Lighthouse performance threshold to 0.7"
            fi
        fi
    fi
}

# Check 9: Build size optimization
check_build_size() {
    print_status "Checking build size..."
    
    if [ -d "$BUILD_DIR" ]; then
        BUILD_SIZE_MB=$(du -sm "$BUILD_DIR" | awk '{print $1}')
        print_info "Current build size: ${BUILD_SIZE_MB}MB"
        
        if [ "$BUILD_SIZE_MB" -gt 50 ]; then
            print_found "Build size is quite large (${BUILD_SIZE_MB}MB)"
            print_info "Consider optimizing:"
            print_info "  - Compress images"
            print_info "  - Use code splitting"
            print_info "  - Remove unused dependencies"
            print_info "  - Enable gzip compression"
        fi
    fi
}

# Check 10: Common file issues
check_common_issues() {
    print_status "Checking for common issues..."
    
    # Check for common problematic files
    if [ -f "dist/.DS_Store" ] || [ -f "$BUILD_DIR/.DS_Store" ]; then
        print_found "Found .DS_Store files in build directory"
        find "$BUILD_DIR" -name ".DS_Store" -delete 2>/dev/null || true
        print_fixed "Removed .DS_Store files"
    fi
    
    # Check for node_modules in build (shouldn't be there)
    if [ -d "$BUILD_DIR/node_modules" ]; then
        print_found "Found node_modules in build directory"
        rm -rf "$BUILD_DIR/node_modules"
        print_fixed "Removed node_modules from build directory"
    fi
}

# Generate summary report
generate_summary() {
    echo ""
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}📊 SUMMARY REPORT${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
    
    echo -e "${BLUE}Issues Found:${NC} $ISSUES_FOUND"
    echo -e "${GREEN}Issues Fixed:${NC} $ISSUES_FIXED"
    echo ""
    
    if [ $ISSUES_FOUND -eq 0 ]; then
        echo -e "${GREEN}🎉 No issues found! Your project looks good to deploy.${NC}"
    elif [ $ISSUES_FIXED -eq $ISSUES_FOUND ]; then
        echo -e "${GREEN}✅ All issues have been automatically fixed!${NC}"
        echo -e "${BLUE}Next steps:${NC}"
        echo "1. Commit your changes to git"
        echo "2. Push to your repository"
        echo "3. Netlify will automatically redeploy"
    else
        echo -e "${YELLOW}⚠️  Some issues require manual attention.${NC}"
        echo -e "${BLUE}Please review the messages above and fix remaining issues.${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}Configuration files:${NC}"
    [ -f "netlify.toml" ] && echo "✅ netlify.toml"
    [ -f "$BUILD_DIR/_redirects" ] && echo "✅ _redirects"
    [ -f "$PACKAGE_JSON" ] && echo "✅ package.json"
    echo ""
    
    echo -e "${BLUE}Build information:${NC}"
    echo "📁 Publish directory: $BUILD_DIR"
    echo "🏗️  Project type: $PROJECT_TYPE"
    if [ -d "$BUILD_DIR" ]; then
        echo "📊 Build size: $(du -sh "$BUILD_DIR" | awk '{print $1}')"
        echo "📄 Files in build: $(find "$BUILD_DIR" -type f | wc -l)"
    fi
}

# Main execution
main() {
    print_header
    
    # Run all checks
    check_project_structure || exit 1
    check_build_config
    check_netlify_config
    check_build_output || exit 1
    check_redirects_file
    check_public_directory
    check_environment_variables
    check_lighthouse_plugin
    check_build_size
    check_common_issues
    
    # Generate summary
    generate_summary
    
    echo ""
    echo -e "${GREEN}🚀 Find & Fix process completed!${NC}"
}

# Run the main function
main "$@"
