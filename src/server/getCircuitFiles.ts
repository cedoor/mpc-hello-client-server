import fs from 'fs';
import path from 'path';

export async function getCircuitFiles(dir: string) {
  const result = {};

  await (async function walk(currentPath: string) {
    const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        const content = await fs.promises.readFile(fullPath, 'utf-8');

        result[fullPath] = content;
      }
    }
  })(dir);

  return result;
}
