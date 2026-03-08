const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const androidGoogleServicesPath = path.join(rootDir, 'android', 'app', 'google-services.json');

function writeGoogleServices(envValue, destinationPath) {
  if (!envValue) {
    console.warn('GOOGLE_SERVICES_JSON env var not set — skipping (will use committed file if present).');
    return;
  }

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });

  if (fs.existsSync(envValue)) {
    fs.copyFileSync(envValue, destinationPath);
    console.log(`Copied GOOGLE_SERVICES_JSON from ${envValue} to ${destinationPath}`);
    return;
  }

  try {
    JSON.parse(envValue);
    fs.writeFileSync(destinationPath, envValue, 'utf8');
    console.log(`Wrote GOOGLE_SERVICES_JSON content to ${destinationPath}`);
    return;
  } catch (_) {
    // not valid JSON either
  }

  throw new Error(
    `GOOGLE_SERVICES_JSON does not point to an existing file and is not valid JSON.\nValue starts with: ${envValue.slice(0, 80)}`
  );
}

try {
  writeGoogleServices(process.env.GOOGLE_SERVICES_JSON, androidGoogleServicesPath);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}