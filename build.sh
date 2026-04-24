#!/bin/bash

# VNS.Umbraco.PropertyEditors Build Script
# Dette script bygger projektet og forbereder det til distribution

set -e

# Get current version from package.json
CURRENT_VERSION=$(grep -o '"version": "[^"]*"' package.json | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
APP_PLUGIN_DIR="App_Plugins/VNS.Umbraco.PropertyEditors"
UMBRACO_PACKAGE_FILE="$APP_PLUGIN_DIR/umbraco-package.json"

echo "Building VNS.Umbraco.PropertyEditors..."
echo "Current version: $CURRENT_VERSION"
echo ""
read -p "Enter new version (or press Enter to keep $CURRENT_VERSION): " NEW_VERSION

# Update version if provided
if [ ! -z "$NEW_VERSION" ]; then
    # Validate semantic version format
    if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "Error: Version must be in semantic version format (e.g., 1.0.1)"
        exit 1
    fi

    echo "Updating version to $NEW_VERSION..."

    # Update package.json
    if command -v jq &> /dev/null; then
        jq --arg ver "$NEW_VERSION" '.version = $ver' package.json > package.json.tmp && mv package.json.tmp package.json
    else
        sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" package.json
    fi

    # Update App_Plugins/VNS.Umbraco.PropertyEditors/umbraco-package.json
    if command -v jq &> /dev/null; then
        jq --arg ver "$NEW_VERSION" '.version = $ver' "$UMBRACO_PACKAGE_FILE" > "$UMBRACO_PACKAGE_FILE.tmp" && mv "$UMBRACO_PACKAGE_FILE.tmp" "$UMBRACO_PACKAGE_FILE"
    else
        sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" "$UMBRACO_PACKAGE_FILE"
    fi

    # Update package-lock.json
    echo "Updating package-lock.json..."
    npm install --package-lock-only

    echo "Version updated to $NEW_VERSION"
    echo ""
fi

# Ensure target plugin directory exists
mkdir -p "$APP_PLUGIN_DIR"

# Clean previous build output
if [ -d "$APP_PLUGIN_DIR/dist" ]; then
    echo "Cleaning previous build..."
    rm -rf "$APP_PLUGIN_DIR/dist"
fi

# Build with Vite
echo "Running Vite build..."
npm run vite:build

echo "Build completed successfully!"
echo "Distribution files are in: $APP_PLUGIN_DIR/dist/"
echo ""
echo "Files ready for deployment:"
ls -la "$APP_PLUGIN_DIR/dist/"
