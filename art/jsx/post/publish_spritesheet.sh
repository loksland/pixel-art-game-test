#!/bin/bash

# Ensure script is run in the base dir
cd "`dirname "$0"`"

# TexturePacker --help
now=$(date +"%T")

echo "Publishing TPS: $now" > log.txt
echo "" >> log.txt
echo "Got path $1" >> log.txt
echo "" >> log.txt

target=$1
target="${target/#\~/$HOME}"

/usr/local/bin/TexturePacker "$target" --force-publish >> log.txt

$SHELL
