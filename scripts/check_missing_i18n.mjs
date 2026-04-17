import fs from 'fs';
import path from 'path';

const fileContent = fs.readFileSync('src/i18n.ts', 'utf8');

// Find all t('key') in pages and components
const getAllFiles = (dirPath, arrayOfFiles) => {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
};

const allFiles = getAllFiles('src/pages', []).concat(getAllFiles('src/components', []));

let allKeys = new Set();
const tRegex = /t\(['"]([^'"]+)['"]/g;

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    allKeys.add(match[1]);
  }
});

// See what is not in i18n
const missingKeys = [];
Array.from(allKeys).forEach(key => {
  if (!fileContent.includes(`"${key}"`) && !fileContent.includes(`'${key}'`)) {
    missingKeys.push(key);
  }
});

console.log("Missing keys:");
console.log(missingKeys.join('\n'));
