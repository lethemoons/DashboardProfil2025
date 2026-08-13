#!/bin/bash
# Install openpyxl at runtime to avoid build phase issues
python3 -m pip install openpyxl --break-system-packages || true

# Start the node server
npm run start
