#!/usr/bin/env node

const net = require('net');
const { spawn } = require('child_process');

const preferredPorts = [8082, 8083, 8084, 8085];

function resolveHostMode(argv) {
  if (argv.includes('--localhost')) return '--localhost';
  if (argv.includes('--lan')) return '--lan';
  return '--tunnel';
}

function resolvePlatformFlag(argv) {
  if (argv.includes('--ios')) return '--ios';
  if (argv.includes('--android')) return '--android';
  if (argv.includes('--web')) return '--web';
  return null;
}

const mode = resolveHostMode(process.argv);
const platformFlag = resolvePlatformFlag(process.argv);

function canUsePort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, '0.0.0.0');
  });
}

async function pickPort() {
  for (const port of preferredPorts) {
    // eslint-disable-next-line no-await-in-loop
    if (await canUsePort(port)) return port;
  }

  throw new Error(
    `No available Expo port in ${preferredPorts.join(', ')}. Stop existing Metro/Expo processes and retry.`
  );
}

async function main() {
  const port = await pickPort();
  const args = ['start', mode, '--port', String(port)];
  if (platformFlag) args.push(platformFlag);

  console.log(`[mobile] starting Expo with ${mode.replace('--', '')} on port ${port}`);

  const child = spawn('expo', args, {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.exit(1);
    }
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error('[mobile] failed to start Expo:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
