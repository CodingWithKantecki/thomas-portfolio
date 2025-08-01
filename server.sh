#!/bin/bash

# Server management script for thomas-portfolio

case "$1" in
  start)
    echo "Starting server..."
    # Kill any existing processes
    pkill -f "node.*next" 2>/dev/null
    sleep 1
    # Start server in background
    nohup npm run dev > server.log 2>&1 &
    echo $! > server.pid
    sleep 3
    if ps -p $(cat server.pid) > /dev/null; then
      echo "Server started successfully!"
      echo "Access at: http://localhost:3000"
      echo "Logs: tail -f server.log"
    else
      echo "Server failed to start. Check server.log for errors."
    fi
    ;;
  stop)
    echo "Stopping server..."
    if [ -f server.pid ]; then
      kill $(cat server.pid) 2>/dev/null
      rm server.pid
      echo "Server stopped."
    else
      pkill -f "node.*next" 2>/dev/null
      echo "Server processes killed."
    fi
    ;;
  restart)
    $0 stop
    sleep 2
    $0 start
    ;;
  status)
    if [ -f server.pid ] && ps -p $(cat server.pid) > /dev/null; then
      echo "Server is running (PID: $(cat server.pid))"
      echo "Access at: http://localhost:3000"
    else
      echo "Server is not running."
    fi
    ;;
  logs)
    tail -f server.log
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs}"
    exit 1
    ;;
esac