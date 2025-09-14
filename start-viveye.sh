#!/bin/bash

# VivEye Startup Script with Tor Integration
# This script starts Tor and the VivEye services

set -e

echo "Starting VivEye Command & Control System with Tor..."

# Determine Tor base directory
TOR_BASE_DEFAULT="$(pwd)/tor-data"
if [ -n "$LOCAL_PREVIEW" ]; then
  TOR_BASE="$(pwd)/tor-data"
else
  TOR_BASE="$TOR_BASE_DEFAULT"
fi

# Create necessary directories (Tor data is stored in ./tor-data)
mkdir -p "$TOR_BASE/backend" "$TOR_BASE/frontend" "$TOR_BASE/agents"
mkdir -p "$(pwd)/logs"

# Set proper permissions for Tor directories
chmod 700 "$TOR_BASE/backend" "$TOR_BASE/frontend" "$TOR_BASE/agents"

# Remove any stale hardcoded workspace mkdirs; use TOR_BASE instead

# Set proper permissions for Tor directories

# Check if Tor is installed
if ! command -v tor &> /dev/null; then
    echo "Error: 'tor' binary not found in PATH. Install Tor or add it to PATH."
    echo "On macOS with Tor Browser: export PATH=\"/Applications/Tor Browser.app/Contents/MacOS:$PATH\""
    exit 1
fi

# Start Tor in the background
echo "Starting Tor service..."
# Prepare a temporary torrc with TOR_BASE substituted
TMP_TORRC="$(pwd)/tor/torrc.runtime"
sed "s#__TOR_BASE__#${TOR_BASE}#g" tor/torrc > "$TMP_TORRC"
tor -f "$TMP_TORRC" &
TOR_PID=$!

# Wait for Tor to start and generate onion addresses
echo "Waiting for Tor to generate onion addresses..."
sleep 10

# Check if onion addresses are generated
if [ ! -f "${TOR_BASE}/backend/hostname" ]; then
    echo "Error: Tor failed to generate onion addresses"
    exit 1
fi

echo "Tor onion services created:"
echo "Backend: $(cat "${TOR_BASE}/backend/hostname")"
echo "Frontend: $(cat "${TOR_BASE}/frontend/hostname")"
echo "Agents: $(cat "${TOR_BASE}/agents/hostname")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Start the services
echo "Starting VivEye services..."

# Start backend API server
echo "Starting backend API server..."
cd server
npm run dev:api &
API_PID=$!
cd ..

# Start agent server
echo "Starting agent server..."
cd server
npm run start:agent &
AGENT_PID=$!
cd ..

# Start frontend (wait a bit for backend to be ready)
sleep 5
echo "Starting frontend..."
cd client
npm start &
FRONTEND_PID=$!
cd ..

# Function to cleanup on exit
cleanup() {
    echo "Shutting down VivEye services..."
    kill $API_PID $AGENT_PID $FRONTEND_PID $TOR_PID 2>/dev/null || true
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

echo "VivEye is now running!"
echo "Backend API: http://$(cat "${TOR_BASE}/backend/hostname")"
echo "Frontend: http://$(cat "${TOR_BASE}/frontend/hostname")"
echo "Agent Server: http://$(cat "${TOR_BASE}/agents/hostname")"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for all background processes
wait
