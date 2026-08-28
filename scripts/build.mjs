import { cp, mkdir, rm } from 'node:fs/promises';

const output = new URL('../dist/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of ['index.html', 'styles.css', 'game-core.js', 'game.js']) {
  await cp(new URL(`../${file}`, import.meta.url), new URL(file, output));
}
console.log('Static build ready in dist/');
