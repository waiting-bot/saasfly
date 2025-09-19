#!/bin/bash

# Netlify Build Script for Saasfly Project
# This script handles the build process for Netlify deployment

echo "🚀 Starting Netlify build process..."

# Install Bun if not available
if ! command -v bun &> /dev/null; then
    echo "Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi

# Clean up problematic files before build
echo "Cleaning up problematic files..."
find saasfly -name "*" | grep -E "[#?]" | grep -v node_modules | while read file; do
    echo "Removing problematic file: $file"
    rm -f "$file"
done

# Install dependencies
echo "Installing dependencies..."
cd saasfly && bun install

# Build the project
echo "Building project..."
bun run build

# Copy standalone output to Netlify publish directory
echo "Preparing build output..."
mkdir -p ../netlify-dist

# Copy static assets
cp -r apps/nextjs/.next/static ../netlify-dist/
cp -r apps/nextjs/public ../netlify-dist/

# Copy server files for standalone mode
cp apps/nextjs/.next/standalone/apps/nextjs/server.js ../netlify-dist/
cp -r apps/nextjs/.next/standalone/apps/nextjs/.next/server ../netlify-dist/

# Copy locale-specific static pages
if [ -d "apps/nextjs/.next/standalone/apps/nextjs/.next/server/app/en" ]; then
  echo "Copying English locale pages..."
  mkdir -p ../netlify-dist/en
  cp -r apps/nextjs/.next/standalone/apps/nextjs/.next/server/app/en/* ../netlify-dist/en/
fi

if [ -d "apps/nextjs/.next/standalone/apps/nextjs/.next/server/app/zh" ]; then
  echo "Copying Chinese locale pages..."
  mkdir -p ../netlify-dist/zh
  cp -r apps/nextjs/.next/standalone/apps/nextjs/.next/server/app/zh/* ../netlify-dist/zh/
fi

if [ -d "apps/nextjs/.next/standalone/apps/nextjs/.next/server/app/ko" ]; then
  echo "Copying Korean locale pages..."
  mkdir -p ../netlify-dist/ko
  cp -r apps/nextjs/.next/standalone/apps/nextjs/.next/server/app/ko/* ../netlify-dist/ko/
fi

if [ -d "apps/nextjs/.next/standalone/apps/nextjs/.next/server/app/ja" ]; then
  echo "Copying Japanese locale pages..."
  mkdir -p ../netlify-dist/ja
  cp -r apps/nextjs/.next/standalone/apps/nextjs/.next/server/app/ja/* ../netlify-dist/ja/
fi

# Create root index files for each locale
echo "Creating root index files..."
for locale in en zh ko ja; do
  if [ -d "../netlify-dist/$locale" ]; then
    # Copy the locale's page to root for direct access
    cp -r ../netlify-dist/$locale/* ../netlify-dist/ 2>/dev/null || true
  fi
done

# Verify no problematic files in output
echo "Verifying output files..."
find ../netlify-dist -name "*" | grep -E "[#?]" | while read file; do
    echo "Warning: Found problematic file in output: $file"
    rm -f "$file"
done

# List what we've created
echo "Build output contents:"
ls -la ../netlify-dist/

echo "✅ Build completed successfully!"