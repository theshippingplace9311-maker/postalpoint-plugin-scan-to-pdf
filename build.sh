#!/bin/bash
# Build the plugin zip with the correct folder structure.
# PostalPoint expects the plugin files inside a folder inside the zip - not at the root.

set -e

VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"\([^"]*\)".*$/\1/' | tail -c +1)
VERSION=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)
FOLDER_NAME="ScanToPDF"
ZIP_NAME="scan-to-pdf-v${VERSION}.zip"

echo "Building ${ZIP_NAME}..."

# Clean previous build
rm -f "${ZIP_NAME}"
rm -rf "/tmp/${FOLDER_NAME}"

# Stage into folder
mkdir -p "/tmp/${FOLDER_NAME}"
cp package.json plugin.js page.f7 README.md "/tmp/${FOLDER_NAME}/"

# Zip from /tmp so the folder is the root of the archive
cd /tmp
zip -rq "${OLDPWD}/${ZIP_NAME}" "${FOLDER_NAME}/"
cd "${OLDPWD}"

# Clean stage
rm -rf "/tmp/${FOLDER_NAME}"

echo "Done: ${ZIP_NAME}"
unzip -l "${ZIP_NAME}"
