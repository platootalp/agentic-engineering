import inquirer from 'inquirer';
import { validateProjectName } from './utils.js';

const BACKEND_OPTIONS = {
  react: [
    { name: 'FastAPI (Python)', value: 'fastapi' },
    { name: 'Express (Node.js)', value: 'express' },
    { name: 'Next.js (Full Stack)', value: 'nextjs' },
  ],
  vue: [
    { name: 'FastAPI (Python)', value: 'fastapi' },
    { name: 'Nuxt 3 (Full Stack)', value: 'nuxt3' },
  ],
};

const UI_OPTIONS = {
  react: [
    { name: 'shadcn/ui + Tailwind CSS (default)', value: 'shadcn' },
    { name: 'Ant Design', value: 'antd' },
    { name: 'Tailwind CSS only', value: 'tailwind-only' },
    { name: 'Other (manual config)', value: 'other' },
  ],
  vue: [
    { name: 'Naive UI + Tailwind CSS (default)', value: 'naive' },
    { name: 'Element Plus', value: 'element-plus' },
    { name: 'Tailwind CSS only', value: 'tailwind-only' },
    { name: 'Other (manual config)', value: 'other' },
  ],
};

export async function runPrompts() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      validate: validateProjectName,
    },
    {
      type: 'list',
      name: 'frontend',
      message: 'Select frontend framework:',
      choices: [
        { name: 'React', value: 'react' },
        { name: 'Vue', value: 'vue' },
      ],
    },
    {
      type: 'list',
      name: 'backend',
      message: 'Select backend framework:',
      choices: (answers) => BACKEND_OPTIONS[answers.frontend],
    },
    {
      type: 'list',
      name: 'pythonPkgManager',
      message: 'Select Python package manager:',
      choices: [
        { name: 'uv (default)', value: 'uv' },
        { name: 'poetry', value: 'poetry' },
      ],
      when: (answers) => answers.backend === 'fastapi',
    },
    {
      type: 'list',
      name: 'uiLibrary',
      message: 'Select UI component library:',
      choices: (answers) => UI_OPTIONS[answers.frontend],
    },
    {
      type: 'list',
      name: 'database',
      message: 'Select database:',
      choices: [
        { name: 'SQLite (default)', value: 'sqlite' },
        { name: 'PostgreSQL', value: 'postgres' },
        { name: 'MySQL', value: 'mysql' },
      ],
    },
    {
      type: 'checkbox',
      name: 'capabilities',
      message: 'Select capabilities:',
      choices: [
        { name: 'Authentication (JWT)', value: 'auth-jwt', checked: true },
        { name: 'Docker', value: 'docker', checked: true },
        { name: 'Code Standards (Lint)', value: 'lint', checked: true },
      ],
    },
  ]);

  answers.pythonPkgManager = answers.pythonPkgManager || 'uv';
  answers.combo = `${answers.frontend}-${answers.backend}`;

  // Auto-include db capability based on database choice
  const dbCapability = `db-${answers.database}`;
  if (!answers.capabilities.includes(dbCapability)) {
    answers.capabilities.push(dbCapability);
  }

  return answers;
}
