#!/usr/bin/env node
import { runPrompts } from '../src/prompts.js';
import { runGenerators } from '../src/generators.js';
import { kebabToPascal } from '../src/utils.js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function main() {
  console.log('\n  Project Template Generator\n');

  const answers = await runPrompts();
  answers.projectNamePascal = kebabToPascal(answers.projectName);

  const targetDir = path.resolve(answers.projectName);
  if (fs.existsSync(targetDir)) {
    console.error(`\n  Error: Directory "${answers.projectName}" already exists.`);
    process.exit(1);
  }
  fs.mkdirSync(targetDir, { recursive: true });

  console.log('\n  Generating project...\n');
  await runGenerators(answers);

  const scriptDir = path.join(targetDir, 'script');
  if (fs.existsSync(scriptDir)) {
    execSync('chmod +x script/*.sh', { cwd: targetDir });
  }

  console.log('\n  Installing dependencies...');
  const frontendDir = path.join(targetDir, 'frontend');
  const backendDir = path.join(targetDir, 'backend');

  if (fs.existsSync(frontendDir)) {
    console.log('  Installing frontend dependencies...');
    execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
  }

  if (fs.existsSync(backendDir) && answers.backend === 'fastapi') {
    console.log('  Installing backend dependencies...');
    const cmd = answers.pythonPkgManager === 'uv' ? 'uv sync' : 'poetry install';
    try {
      execSync(cmd, { cwd: backendDir, stdio: 'inherit' });
    } catch {
      console.log('  Note: Backend install skipped (uv/poetry not available). Install manually later.');
    }
  }

  if (fs.existsSync(backendDir) && answers.backend === 'express') {
    console.log('  Installing backend dependencies...');
    execSync('npm install', { cwd: backendDir, stdio: 'inherit' });
  }

  if (answers.combo === 'react-nextjs' || answers.combo === 'vue-nuxt3') {
    // Full-stack frameworks install at root level
    if (fs.existsSync(targetDir) && !fs.existsSync(backendDir)) {
      console.log('  Installing project dependencies...');
      execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
    }
  }

  console.log(`\n  Project "${answers.projectName}" is ready!`);
  console.log(`\n  cd ${answers.projectName}`);
  console.log(`  cat README.md  # for next steps\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
