require('dotenv').config();
const { spawn } = require('node:child_process');

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', env: process.env, shell: false });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`Process exited with code ${code}`)));
  });
}

async function start() {
  await run(process.execPath, ['scripts/seed-demo.js']);
  const serverArgs = process.argv.includes('--watch') ? ['--watch', 'server.js'] : ['server.js'];
  await run(process.execPath, serverArgs);
}

start().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
