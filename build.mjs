import { mkdir, copyFile, cp } from 'node:fs/promises';
await mkdir('dist', { recursive:true });
for (const file of ['index.html','work.html','services.html','about.html','contact.html','resume.html','toolkit.html','toolkit.js','styles.css','app.js']) await copyFile(file, `dist/${file}`);
await cp('assets', 'dist/assets', { recursive:true });
console.log('Static website built in dist/');
