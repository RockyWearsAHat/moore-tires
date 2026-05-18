#!/usr/bin/env zsh
# screenshot-mobile.sh — kill old Metro, launch Expo iOS, capture screenshot
# Usage: ./scripts/screenshot-mobile.sh [--keep-screenshots] [--port 8082]

set -euo pipefail

WORKSPACE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MOBILE_DIR="$WORKSPACE_ROOT/apps/mobile"
SCREENSHOT_DIR="$WORKSPACE_ROOT/.tmp/screenshots"
LATEST_LINK="$WORKSPACE_ROOT/.tmp/ios-latest.png"
PORT=8082
CLEAN_SCREENSHOTS=true

for arg in "$@"; do
  case $arg in
    --keep-screenshots) CLEAN_SCREENSHOTS=false ;;
    --port) shift; PORT="$1" ;;
    --port=*) PORT="${arg#--port=}" ;;
  esac
done

echo "==> Moore Tires mobile screenshot tool"
echo "    workspace: $WORKSPACE_ROOT"
echo "    port:      $PORT"
echo "    clean:     $CLEAN_SCREENSHOTS"
echo ""

# 1. Clean old screenshots
if [[ "$CLEAN_SCREENSHOTS" == "true" ]]; then
  echo "--> Clearing old screenshots..."
  rm -rf "$SCREENSHOT_DIR"
fi
mkdir -p "$SCREENSHOT_DIR"

# 2. Kill any existing Metro / Expo processes on the target port
echo "--> Killing existing Metro/Expo processes..."
lsof -ti:"$PORT" | xargs -r kill -9 2>/dev/null || true
pkill -f "expo|metro" 2>/dev/null || true
sleep 1

# 3. Launch Expo in the background
echo "--> Starting Expo on port $PORT (iOS simulator)..."
cd "$MOBILE_DIR"
npx expo start --localhost --port "$PORT" --ios &
EXPO_PID=$!

# Trap so we kill Expo when this script exits
trap "kill $EXPO_PID 2>/dev/null; exit 0" EXIT INT TERM

# 4. Wait for Metro to respond on the port
echo "--> Waiting for Metro to be ready..."
RETRIES=30
until curl -sf "http://127.0.0.1:$PORT/status" >/dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [[ $RETRIES -le 0 ]]; then
    echo "ERROR: Metro did not become ready in time." >&2
    exit 1
  fi
  printf "."
  sleep 2
done
echo " ready"

# 5. Extra wait for the bundle to finish and the simulator to render
echo "--> Waiting for bundle + simulator render (15s)..."
sleep 15

# 6. Capture screenshot
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
SCREENSHOT="$SCREENSHOT_DIR/ios-$TIMESTAMP.png"
echo "--> Capturing screenshot..."
xcrun simctl io booted screenshot "$SCREENSHOT"

# Symlink latest for easy access
ln -sf "$SCREENSHOT" "$LATEST_LINK"

echo ""
echo "==> Screenshot saved:"
echo "    $SCREENSHOT"
echo "    $LATEST_LINK (symlink)"
echo ""
echo "    Open with: open \"$SCREENSHOT\""

# Keep Expo alive until the user presses Ctrl-C
echo "--> Expo is still running on http://localhost:$PORT — press Ctrl-C to stop."
wait $EXPO_PID
