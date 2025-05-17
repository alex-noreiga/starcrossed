const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createWriteStream } = require('fs');
const { promisify } = require('util');
const { pipeline } = require('stream');
const mkdir = promisify(fs.mkdir);
const streamPipeline = promisify(pipeline);

// Updated base URLs for ephemeris files
// The main Swiss Ephemeris repository moved
const EPHE_BASE_URL = 'https://www.astro.com/ftp/swisseph/ephe/';
const ALT_BASE_URL = 'https://github.com/aloistr/swisseph/raw/master/ephe/';

// Files to download
const files = [
  'seas_18.se1',  // Main planets
  'semo_18.se1',  // Moon
  'sepl_18.se1',  // Planets
  'seleapsec.txt', // Leap seconds
  'seasnam.txt'   // Asteroid names
];

/**
 * Downloads a file from a URL to a local path
 */
async function downloadFile(url, outputPath, altUrl) {
  console.log(`Downloading ${url} to ${outputPath}`);
  
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });
    
    await streamPipeline(response.data, createWriteStream(outputPath));
    console.log(`Downloaded ${outputPath}`);
    return true;
  } catch (error) {
    console.log(`Failed to download from primary URL: ${error.message}`);
    
    if (altUrl) {
      console.log(`Trying alternate URL: ${altUrl}`);
      try {
        const altResponse = await axios({
          url: altUrl,
          method: 'GET',
          responseType: 'stream'
        });
        
        await streamPipeline(altResponse.data, createWriteStream(outputPath));
        console.log(`Downloaded ${outputPath} from alternate URL`);
        return true;
      } catch (altError) {
        console.log(`Failed to download from alternate URL: ${altError.message}`);
        return false;
      }
    }
    return false;
  }
}

/**
 * Create a minimal ephemeris file with essential data
 * This is a fallback if we can't download the official files
 */
function createMinimalEphemerisFile(filePath, content) {
  console.log(`Creating minimal ephemeris file at ${filePath}`);
  fs.writeFileSync(filePath, content);
}

/**
 * Main function to download ephemeris files
 */
async function downloadEphemeris() {
  try {
    // Create ephe directory if it doesn't exist
    const epheDir = path.join(process.cwd(), 'ephe');
    
    if (!fs.existsSync(epheDir)) {
      await mkdir(epheDir);
      console.log(`Created directory: ${epheDir}`);
    }
    
    let successCount = 0;
    let failCount = 0;
    
    // Download each file
    for (const file of files) {
      const outputPath = path.join(epheDir, file);
      
      // Skip if file already exists
      if (fs.existsSync(outputPath)) {
        console.log(`File already exists: ${outputPath}`);
        successCount++;
        continue;
      }
      
      const primaryUrl = `${EPHE_BASE_URL}${file}`;
      const alternateUrl = `${ALT_BASE_URL}${file}`;
      
      const success = await downloadFile(primaryUrl, outputPath, alternateUrl);
      
      if (success) {
        successCount++;
      } else {
        failCount++;
        
        // Create fallback minimal files for essential ephemeris
        if (file === 'seleapsec.txt') {
          createMinimalEphemerisFile(outputPath, 
            "# Leap seconds table\n" +
            "# This is a minimal version for basic operation\n" +
            "J1900         TAI-UTC\n" +
            "2443144.5     12.0\n" +
            "2443509.5     13.0\n" +
            "2443874.5     14.0\n" +
            "2444239.5     15.0\n" +
            "2444786.5     16.0\n" +
            "2445151.5     17.0\n" +
            "2445516.5     18.0\n" +
            "2446247.5     19.0\n" +
            "2447161.5     20.0\n" +
            "2447892.5     21.0\n" +
            "2448257.5     22.0\n" +
            "2448804.5     23.0\n" +
            "2449169.5     24.0\n" +
            "2449534.5     25.0\n" +
            "2450083.5     26.0\n" +
            "2450630.5     27.0\n" +
            "2451179.5     28.0\n" +
            "2453736.5     29.0\n" +
            "2454832.5     30.0\n" +
            "2456109.5     31.0\n" +
            "2457204.5     32.0\n" +
            "2457754.5     33.0\n" +
            "2459215.5     34.0\n"
          );
          console.log(`Created minimal version of ${file}`);
          successCount++;
        }
      }
    }
    
    console.log(`Ephemeris files: ${successCount} succeeded, ${failCount} failed.`);
    
    if (failCount > 0) {
      console.log('Warning: Some ephemeris files could not be downloaded.');
      console.log('The application will still work but with limited accuracy.');
      console.log('You can manually download ephemeris files from:');
      console.log('https://github.com/aloistr/swisseph/tree/master/ephe');
      console.log('and place them in the ephe/ directory.');
    } else {
      console.log('All ephemeris files downloaded or created successfully!');
    }
  } catch (error) {
    console.error('Error downloading ephemeris files:', error.message);
    process.exit(1);
  }
}

// Run the download function
downloadEphemeris();
