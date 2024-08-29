const { exec } = require('child_process');

async function main() {
  const srcDirectory = process.argv[2];

  if (!srcDirectory) {
    console.error('Please provide a --src directory.');
    process.exit(1);
  }

  try {
    await runCommand(`node scripts/deleteDirectory.js ${srcDirectory}`);
    await runCommand('npx prisma generate');
    await runCommand('tsc -p tsconfig.netlify.json');
    await runCommand(`npx netlify functions:build --src ${srcDirectory}/functions`);
    console.log('All tasks completed successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing ${command}:`, stderr);
        return reject(error);
      }
      console.log(`Output of ${command}:`, stdout);
      resolve();
    });
  });
}