const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const plistPath = path.join(root, 'ios/AmpecoPins/Info.plist');

function readMapsKey() {
  if (!fs.existsSync(envPath)) {
    return '';
  }

  const match = fs
    .readFileSync(envPath, 'utf8')
    .match(/^GOOGLE_MAPS_API_KEY=(.*)$/m);
  if (!match) {
    return '';
  }

  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

const key = readMapsKey() || 'YOUR_GOOGLE_MAPS_API_KEY';

execFileSync('/usr/libexec/PlistBuddy', [
  '-c',
  `Set :GMSApiKey ${key}`,
  plistPath,
]);

if (key === 'YOUR_GOOGLE_MAPS_API_KEY') {
  console.warn(
    'GOOGLE_MAPS_API_KEY missing in mobile/.env - maps may not render tiles.',
  );
} else {
  console.log('Synced Google Maps API key into iOS Info.plist (local only).');
}
