const fs = require('fs');
const path = require('path');

const srcAppDir = path.join(__dirname, 'src', 'app');
const localeDir = path.join(srcAppDir, '[locale]');

// 1. Load EN/VI translations
const viPath = path.join(__dirname, 'messages', 'vi.json');
const enPath = path.join(__dirname, 'messages', 'en.json');
let translations = {};
if (fs.existsSync(enPath)) {
  translations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
} else if (fs.existsSync(viPath)) {
  translations = JSON.parse(fs.readFileSync(viPath, 'utf8'));
}

function getTranslation(key) {
  const parts = key.split('.');
  let current = translations;
  for (const part of parts) {
    if (current && current[part] !== undefined) {
      current = current[part];
    } else {
      return key;
    }
  }
  return typeof current === 'string' ? current : key;
}

// 2. Move files from [locale] to app
function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isFile()) {
      fs.copyFileSync(fromPath, toPath);
    } else {
      copyFolderSync(fromPath, toPath);
    }
  });
}

if (fs.existsSync(localeDir)) {
  console.log("Moving files from [locale] to app...");
  copyFolderSync(localeDir, srcAppDir);
  fs.rmSync(localeDir, { recursive: true, force: true });
}

// 3. Process files to remove useTranslation
function processFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      processFiles(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;

      // Remove import
      content = content.replace(/import\s*\{\s*useTranslation\s*\}\s*from\s*['"]@\/shared\/context\/LanguageContext['"];?\r?\n?/g, '');
      content = content.replace(/import\s*\{\s*useTranslation\s*\}\s*from\s*['"]@\/i18n\/routing['"];?\r?\n?/g, '');

      // Remove const { t } = useTranslation();
      content = content.replace(/[ \t]*const\s*\{\s*t\s*\}\s*=\s*useTranslation\(\);\r?\n?/g, '');

      // Replace t("key") or t('key')
      // Note: in JSX, {t("...")} should become just the string or {"string"}
      // We will match t("...") and replace with the string.
      // E.g. {t("page.tanaplano")} -> TanaPlano or {"TanaPlano"}
      // We will replace t("key") with "Actual Value" (with quotes) if it's inside JS, 
      // but in JSX {t("key")} -> {"Actual Value"} is fine.
      content = content.replace(/t\(['"]([^'"]+)['"]\)/g, (match, key) => {
        const val = getTranslation(key);
        // escape quotes
        return `"${val.replace(/"/g, '\\"')}"`;
      });
      // also replace t("key", {...}) ? 
      // A simple regex might break on replacements, let's catch t('key', {..})
      content = content.replace(/t\(['"]([^'"]+)['"]\s*,[^\)]+\)/g, (match, key) => {
        const val = getTranslation(key);
        return `"${val.replace(/"/g, '\\"')}"`;
      });

      // Fix layout.tsx specifically
      if (filePath.endsWith('layout.tsx') && dir === srcAppDir) {
        content = content.replace(/params:\s*Promise<\{\s*locale:\s*string\s*\}>/g, '');
        content = content.replace(/const params = await props\.params;\s*const locale = params\.locale;/g, '');
        content = content.replace(/lang=\{locale\}/g, 'lang="en"');
      }

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Processed:", filePath);
      }
    }
  }
}

console.log("Processing src directory...");
processFiles(path.join(__dirname, 'src'));

// 4. Remove i18n folders
const i18nDir = path.join(__dirname, 'src', 'i18n');
const messagesDir = path.join(__dirname, 'messages');
const langContext = path.join(__dirname, 'src', 'shared', 'context', 'LanguageContext.tsx');
if (fs.existsSync(i18nDir)) fs.rmSync(i18nDir, { recursive: true, force: true });
if (fs.existsSync(messagesDir)) fs.rmSync(messagesDir, { recursive: true, force: true });
if (fs.existsSync(langContext)) fs.rmSync(langContext, { force: true });

console.log("Done.");
