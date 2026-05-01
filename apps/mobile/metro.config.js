const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the full monorepo root so Metro can resolve all workspace packages.
config.watchFolders = [workspaceRoot];

// Let Metro find modules in both the app's own node_modules and the root
// workspace node_modules (required for pnpm workspaces).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// pnpm stores packages under node_modules/.pnpm/ and creates symlinks from
// node_modules/<pkg>. Without this, Metro resolves symlinks to their physical
// location inside .pnpm/ and sends those deep paths to the Simulator as the
// bundle URL — causing "Could not connect" errors.
config.resolver.unstable_enableSymlinks = true;

// Honour package.json "exports" / "imports" fields (modern ESM packages).
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
