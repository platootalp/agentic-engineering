export function validateProjectName(input) {
  if (!input.trim()) return 'Project name is required';
  if (!/^[a-z][a-z0-9-]*$/.test(input.trim())) {
    return 'Project name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens';
  }
  return true;
}

export function kebabToPascal(str) {
  return str
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function kebabToCamel(str) {
  const pascal = kebabToPascal(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
