import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const css = await readFile('src/design/tokens.css', 'utf8');
const variables = Object.fromEntries(
  [...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
);
if (Object.keys(variables).length < 26)
  throw new Error('Token source is incomplete; export stopped.');
const previous = JSON.parse(await readFile('src/design/tokens.json', 'utf8'));
await writeFile(
  'src/design/tokens.json',
  JSON.stringify(
    {
      ...previous,
      cssVariables: variables,
      sourceSha256: createHash('sha256').update(css).digest('hex'),
    },
    null,
    2,
  ) + '\n',
);
console.log('Synchronized ' + Object.keys(variables).length + ' semantic tokens.');
