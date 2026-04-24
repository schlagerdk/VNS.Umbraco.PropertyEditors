#!/bin/bash

# VNS.Umbraco.PropertyEditors Build Script
# Dette script bygger projektet og forbereder det til distribution

set -e

# Get current package version from package.json
CURRENT_PACKAGE_VERSION=$(grep -o '"version": "[^"]*"' package.json | head -n 1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
APP_PLUGIN_DIR="App_Plugins/VNS.Umbraco.PropertyEditors"
PROPERTY_EDITORS_DIR="src/PropertyEditors"
DIST_DIR="dist"
RELEASE_DIR="release"

echo "Building VNS.Umbraco.PropertyEditors..."
echo "Current package version: $CURRENT_PACKAGE_VERSION"
echo "Current editor versions:"
for editor_package_file in "$PROPERTY_EDITORS_DIR"/*/umbraco-package.json; do
    [ -f "$editor_package_file" ] || continue
    editor_name=$(basename "$(dirname "$editor_package_file")")
    editor_version=$(grep -o '"version": "[^"]*"' "$editor_package_file" | head -n 1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
    echo "- $editor_name: $editor_version"
done
echo ""
read -p "Enter new package version (or press Enter to keep $CURRENT_PACKAGE_VERSION): " NEW_PACKAGE_VERSION
read -p "Enter editor version updates (format: Editor=1.2.3, comma-separated, or Enter to keep): " EDITOR_VERSION_UPDATES

# Update package version if provided
if [ ! -z "$NEW_PACKAGE_VERSION" ]; then
    # Validate semantic version format
    if ! [[ $NEW_PACKAGE_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "Error: Package version must be in semantic version format (e.g., 1.0.1)"
        exit 1
    fi

    echo "Updating package version to $NEW_PACKAGE_VERSION..."

    # Update package.json
    if command -v jq &> /dev/null; then
        jq --arg ver "$NEW_PACKAGE_VERSION" '.version = $ver' package.json > package.json.tmp && mv package.json.tmp package.json
    else
        sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_PACKAGE_VERSION\"/" package.json
    fi

    echo "Updating package-lock.json..."
    npm install --package-lock-only
fi

# Update selected editor versions if provided
if [ ! -z "$EDITOR_VERSION_UPDATES" ]; then
    IFS=',' read -ra EDITOR_UPDATES <<< "$EDITOR_VERSION_UPDATES"
    for update in "${EDITOR_UPDATES[@]}"; do
        entry=$(echo "$update" | tr -d ' ')
        if [ -z "$entry" ]; then
            continue
        fi

        if [[ "$entry" != *=* ]]; then
            echo "Error: Invalid editor update format '$entry'. Use Editor=1.2.3"
            exit 1
        fi

        editor_name="${entry%%=*}"
        editor_version="${entry#*=}"

        if ! [[ $editor_version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "Error: Version for $editor_name must be semantic (e.g., 1.0.1)"
            exit 1
        fi

        editor_package_file="$PROPERTY_EDITORS_DIR/$editor_name/umbraco-package.json"
        if [ ! -f "$editor_package_file" ]; then
            echo "Error: Editor '$editor_name' not found at $editor_package_file"
            exit 1
        fi

        echo "Updating $editor_name version to $editor_version..."
        if command -v jq &> /dev/null; then
            jq --arg ver "$editor_version" '.version = $ver' "$editor_package_file" > "$editor_package_file.tmp" && mv "$editor_package_file.tmp" "$editor_package_file"
        else
            sed -i '' "s/\"version\": \".*\"/\"version\": \"$editor_version\"/" "$editor_package_file"
        fi
    done
fi

if [ ! -z "$NEW_PACKAGE_VERSION" ] || [ ! -z "$EDITOR_VERSION_UPDATES" ]; then
    echo "Version updates completed."
    echo ""
fi

# Ensure target plugin directory exists
mkdir -p "$APP_PLUGIN_DIR"
mkdir -p "$DIST_DIR"
mkdir -p "$RELEASE_DIR"

# Clean previous generated output
echo "Cleaning previous build output..."
find "$APP_PLUGIN_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
find "$DIST_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
find "$RELEASE_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true

EDITOR_COUNT=0

for editor_dir in "$PROPERTY_EDITORS_DIR"/*; do
    [ -d "$editor_dir" ] || continue

    editor_name=$(basename "$editor_dir")
    editor_package_file="$editor_dir/umbraco-package.json"
    editor_version=$(grep -o '"version": "[^"]*"' "$editor_package_file" | head -n 1 | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
    editor_entry_file=$(find "$editor_dir" -maxdepth 1 -name '*.element.ts' | head -n 1)
    editor_app_plugin_dir="$APP_PLUGIN_DIR/$editor_name"
    dist_package_dir="$DIST_DIR/$editor_name"
    package_name="$editor_name-$editor_version.zip"
    package_path="$RELEASE_DIR/$package_name"

    if [ ! -f "$editor_package_file" ]; then
        echo "Error: Missing package manifest for $editor_name at $editor_package_file"
        exit 1
    fi

    if [ -z "$editor_entry_file" ]; then
        echo "Error: Missing .element.ts entry file for $editor_name"
        exit 1
    fi

    echo "Running Vite build for $editor_name..."
    EDITOR_NAME="$editor_name" EDITOR_ENTRY="$editor_entry_file" npm run vite:build

    mkdir -p "$dist_package_dir"
    cp "$editor_package_file" "$editor_app_plugin_dir/umbraco-package.json"
    cp "$editor_package_file" "$dist_package_dir/umbraco-package.json"
    cp "$editor_app_plugin_dir/umbraco-package.js" "$dist_package_dir/umbraco-package.js"

    echo "Packaging release artifact for $editor_name..."
    zip -qr "$package_path" "$dist_package_dir"

    echo "Built editor files are in: $editor_app_plugin_dir/"
    echo "Deployable package files are in: $dist_package_dir/"
    echo "Release artifact: $package_path"
    echo ""
    echo "Files ready for deployment:"
    ls -la "$editor_app_plugin_dir/"
    echo ""

    EDITOR_COUNT=$((EDITOR_COUNT + 1))
done

if [ "$EDITOR_COUNT" -eq 0 ]; then
    echo "Error: No property editor folders found in $PROPERTY_EDITORS_DIR"
    exit 1
fi

echo "Build completed successfully for $EDITOR_COUNT editor(s)!"
