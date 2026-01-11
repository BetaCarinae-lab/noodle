echo "running"
node "./js/noodle.js" "./test.nd" "$1"

if [ "$1" = "--ast" ]; then
    exit 0
else
    cargo run
fi
