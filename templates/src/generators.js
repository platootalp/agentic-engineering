import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '..', '_templates');

export async function runGenerators(answers) {
  const targetDir = path.resolve(answers.projectName);

  const baseArgs = buildArgs(answers);
  const { frontend, backend, capabilities } = answers;
  const isFullStack = backend === 'nextjs' || backend === 'nuxt3';

  // 1. Shared files (always)
  console.log('  Generating shared files...');
  runHygen('shared', 'new', targetDir, baseArgs);

  // 2. Frontend (for full-stack frameworks, the backend value IS the frontend generator)
  const frontendGenerator = isFullStack ? backend : frontend;
  console.log(`  Generating frontend/${frontendGenerator} template...`);
  runHygen(`frontend/${frontendGenerator}`, 'new', targetDir, baseArgs);

  // 3. Backend (skip for full-stack frameworks — frontend generator IS the full app)
  if (!isFullStack) {
    console.log(`  Generating backend/${backend} template...`);
    runHygen(`backend/${backend}`, 'new', targetDir, baseArgs);
  }

  // 4. Capabilities (each capability module uses skip_if to filter by framework)
  for (const cap of capabilities) {
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
      shell: true,
      cwd: targetDir,
      env: {
        ...process.env,
        HYGEN_TMPLS: TEMPLATES_DIR,
        HYGEN_TARGET: targetDir,
        HYGEN_OVERWRITE: '1',
      },
    });
  } catch (error) {
    console.error(`  Error generating ${generator}: ${error.message}`);
    throw error;
  }
}
