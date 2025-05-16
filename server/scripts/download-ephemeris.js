#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// URLs for the Swiss Ephemeris files
const fileUrls = [
  'https://www.astro.com/ftp/swisseph/ephe/seas_18.se1',
  'https://www.astro.com/ftp/swisseph/ephe/semo_18.se1',
  'https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1'
];

// Directory to save the ephemeris files
const epheDir = path.join(__dirname, '../ephe');

// Create the directory if it doesn't exist
if (!fs.existsSync(epheDir)) {
  fs.mkdirSync(epheDir, { recursive: true });
  console.log(`Created directory: ${epheDir}`);
}

// Download function
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${destination}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destination, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Main function to download all files
async function downloadEphemeris() {
  console.log('Downloading Swiss Ephemeris files...');
  
  for (const url of fileUrls) {
    const fileName = path.basename(url);
    const destination = path.join(epheDir, fileName);
    
    // Skip if file already exists
    if (fs.existsSync(destination)) {
      console.log(`File already exists: ${destination}`);
      continue;
    }
    
    try {
      await downloadFile(url, destination);
    } catch (err) {
      console.error(`Error downloading ${url}:`, err);
      process.exit(1);
    }
  }
  
  console.log('All Swiss Ephemeris files downloaded successfully!');
}

// Run the download
downloadEphemeris().catch(console.error);

// Note: For a real production app, you would want to add a proper 
// package.json script to run this, and handle more edge cases.
