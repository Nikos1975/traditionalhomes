#!/usr/bin/env node

import process from 'node:process';
import { processImage } from './core.mjs';

function parseArgs(argv) {
  const args = {};
  const tokens = argv[0] === '--' ? argv.slice(1) : argv;
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === '--dry-run' || token === '--overwrite' || token === '--crop-reviewed') {
      args[token.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase())] = true;
      continue;
    }
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    if (!token.startsWith('--')) throw new Error(`Unsupported argument: ${token}`);
    const key = token.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    const value = tokens[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for --${token.slice(2)}`);
    args[key] = value;
    index += 1;
  }
  return args;
}

function printHelp() {
  console.log('Usage: npm run image:process -- --source <file> --profile <name> --name <base-name> --output-dir <directory> [--quality <1-100>] [--widths <comma-separated-widths>] [--height <positive-integer>] [--position <sharp-position>] [--dry-run] [--overwrite] [--crop-reviewed]');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return printHelp();
  for (const key of ['source', 'profile', 'name', 'outputDir']) {
    if (!args[key]) throw new Error(`Missing required --${key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)} option.`);
  }
  const report = await processImage(args);
  console.log(JSON.stringify(report, null, 2));
}

main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
