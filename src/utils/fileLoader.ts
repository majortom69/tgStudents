// Динамическая загрузка файлов с коммандами
// из папки ".src/commands"

import fs from 'fs'
import path from 'path'



export function loadFiles(dir: string): string[] {
    const files: string[] = [];
    const readCommands = (directory: string) => {
        const dirPath = path.join(__dirname, '..', directory);
        fs.readdirSync(dirPath, { withFileTypes: true }).forEach((file) => {
            if (file.isDirectory()) {
                readCommands(path.join(directory, file.name));
            } else {
                files.push(path.join(dirPath, file.name));
            }
        });
    };
    readCommands(dir);
    return files;
}