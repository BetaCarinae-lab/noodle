import * as fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';

export function newProject(name, folderpath) {
    // __dirname replacement in ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const srcPath = __dirname;                     // current directory (src)
    const destPath = path.resolve(__dirname, '../test/example');  // destination

    fs.cp(srcPath, destPath, { recursive: true }, (err) => {
    if (err) {
        console.error('Error copying folder:', err);
    } else {
        console.log('Folder copied successfully!');
    }
    });
}