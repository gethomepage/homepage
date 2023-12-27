#!/bin/bash

# Run this script after logo update

cd public/

npx pwa-asset-generator logo.png . -f -w -x --opaque false --type png
npx pwa-asset-generator logo.png . -x --dark-mode --background "#333333" --splash-only

# Copy stdout to src/pages/site.webmanifest.jsx if there is new icons
