const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const plistPath = path.join(root, 'ios/AmpecoPins/Info.plist');
const PLACEHOLDER = 'YOUR_GOOGLE_MAPS_API_KEY';

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

const clear = process.argv.includes('--clear');
const key = clear ? PLACEHOLDER : readMapsKey() || PLACEHOLDER;

execFileSync('/usr/libexec/PlistBuddy', [
  '-c',
  `Set :GMSApiKey ${key}`,
  plistPath,
]);

if (clear) {
  console.log('Restored GMSApiKey placeholder in Info.plist (safe for git).');
} else if (key === PLACEHOLDER) {
  console.warn(
    'GOOGLE_MAPS_API_KEY missing in mobile/.env - maps may not render tiles.',
  );
} else {
  console.log('Synced Google Maps API key into iOS Info.plist (local only).');
}
