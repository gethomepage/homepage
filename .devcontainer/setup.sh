#!/usr/bin/env bash

# Install Node packages
pnpm install

python3 -m pip install -r requirements.txt

# Copy in skeleton configuration if there is no existing configuration
if [ ! -d "config/" ]; then
  echo "Adding skeleton config"
  mkdir config/
  cp -r src/skeleton/* config
fi
