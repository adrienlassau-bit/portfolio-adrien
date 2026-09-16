/* Point d'entrée pour le lanceur d'aperçu de Claude Code.
   Force le bon dossier de travail et le bon PATH (Node local), puis lance
   `astro dev`. Pour un usage manuel, préférez simplement `npm run dev`. */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { join } from 'node:path';

const projectDir = fileURLToPath(new URL('..', import.meta.url));
const astroBin = join(projectDir, 'node_modules', 'astro', 'astro.js');

const port = process.env.PORT || '4321';
const localNodeBin = join(homedir(), '.local', 'node', 'bin');
const env = {
  ...process.env,
  PATH: `${localNodeBin}:${process.env.PATH ?? ''}`,
};

const child = spawn(process.execPath, [astroBin, 'dev', '--port', port], {
  cwd: projectDir,
  stdio: 'inherit',
  env,
});

child.on('exit', (code) => process.exit(code ?? 0));
process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
