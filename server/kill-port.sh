#!/bin/bash
# Kill any process using port 5001
lsof -ti :5001 | xargs kill -9 2>/dev/null || true
echo "Port 5001 cleared"