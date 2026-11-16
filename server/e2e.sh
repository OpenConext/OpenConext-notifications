#!/bin/bash
# Starts the packaged server with the local profile, runs the e2e tests of the client and stops the server.
cd "$(dirname "$0")" || exit 1
JAR=$(ls target/server-*.jar | grep -v original | head -1)
if [ -z "$JAR" ]; then
  echo "No server jar found in target, run this after the package phase"
  exit 1
fi
java -jar "$JAR" --spring.profiles.active=local > target/e2e-server.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null' EXIT

for i in $(seq 1 60); do
  curl -sf http://localhost:8082/actuator/health > /dev/null && break
  if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "The server did not start:"; tail -30 target/e2e-server.log; exit 1
  fi
  sleep 1
done

cd ../client && yarn e2e
