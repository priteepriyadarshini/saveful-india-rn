const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const androidGoogleServicesPath = path.join(rootDir, 'android', 'app', 'google-services.json');
const iosGoogleServicesPlistPath = path.join(rootDir, 'GoogleService-Info.plist');

function copySecretFile(envVarName, envValue, destinationPath) {
  if (!envValue) {
    console.warn(`${envVarName} env var not set — skipping (will use committed file if present).`);
    return;
  }

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });

  if (fs.existsSync(envValue)) {
    fs.copyFileSync(envValue, destinationPath);
    console.log(`Copied ${envVarName} from ${envValue} to ${destinationPath}`);
    return;
  }

  fs.writeFileSync(destinationPath, envValue, 'utf8');
  console.log(`Wrote ${envVarName} content to ${destinationPath}`);
}

try {
  copySecretFile('GOOGLE_SERVICES_JSON', process.env.GOOGLE_SERVICES_JSON, androidGoogleServicesPath);
  copySecretFile('GOOGLE_SERVICES_PLIST', process.env.GOOGLE_SERVICES_PLIST, iosGoogleServicesPlistPath);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}