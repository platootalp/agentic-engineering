import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '..', '_templates');

export async function runGenerators(answers) {
  const targetDir = path.resolve(answers.projectName);

  const baseArgs = buildArgs(answers);

  console.log('  Generating shared files...');
  runHygen('shared', 'new', targetDir, baseArgs);

  console.log(`  Generating ${answers.combo} template...`);
  runHygen(answers.combo, 'new', targetDir, baseArgs);

  for (const cap of answers.capabilities) {
    console.log(`  Generating capability: ${cap}...`);
    runHygen(cap, 'new', targetDir, baseArgs);
  }

  return targetDir;
}

function buildArgs(answers) {
  return [
    `--projectName=${answers.projectName}`,
    `--projectNamePascal=${answers.projectNamePascal}`,
    `--frontend=${answers.frontend}`,
    `--backend=${answers.backend}`,
    `--uiLibrary=${answers.uiLibrary}`,
    `--database=${answers.database}`,
    `--pythonPkgManager=${answers.pythonPkgManager || 'uv'}`,
    `--combo=${answers.combo}`,
  ];
}

function runHygen(generator, action, targetDir, args) {
  const cmd = [
    'npx',
    'hygen',
    generator,
    action,
    ...args,
    '--force',
  ].join(' ');

  try {
    execSync(cmd, {
      stdio: 'pipe',
      cwd: targetDir,
      env: {
        ...process.env,
        HYGEN_TMPLS: TEMPLATES_DIR,
        HYGEN_TARGET: targetDir,
      },
    });
  } catch (error) {
    console.error(`  Error generating ${generator}: ${error.message}`);
    throw error;
  }
}
