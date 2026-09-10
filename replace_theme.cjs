const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = {
  // Backgrounds
  "bg-slate-950": "bg-slate-50 dark:bg-slate-950",
  "bg-slate-900": "bg-white dark:bg-slate-900",
  "bg-slate-800": "bg-slate-100 dark:bg-slate-800",
  "bg-slate-700": "bg-slate-200 dark:bg-slate-700",
  "bg-slate-900/60": "bg-white/60 dark:bg-slate-900/60",
  "bg-slate-900/80": "bg-white/80 dark:bg-slate-900/80",
  "bg-slate-950/80": "bg-slate-50/80 dark:bg-slate-950/80",
  "bg-slate-950/40": "bg-slate-50/40 dark:bg-slate-950/40",
  "bg-slate-800/80": "bg-slate-100/80 dark:bg-slate-800/80",
  "bg-slate-800/40": "bg-slate-100/40 dark:bg-slate-800/40",
  
  // Borders
  "border-slate-800": "border-slate-200 dark:border-slate-800",
  "border-slate-700": "border-slate-300 dark:border-slate-700",
  "border-slate-600": "border-slate-400 dark:border-slate-600",
  "border-slate-800/80": "border-slate-200/80 dark:border-slate-800/80",
  "border-slate-800/60": "border-slate-200/60 dark:border-slate-800/60",
  
  // Text
  "text-slate-200": "text-slate-800 dark:text-slate-200",
  "text-slate-300": "text-slate-700 dark:text-slate-300",
  "text-slate-400": "text-slate-500 dark:text-slate-400",
  "text-slate-500": "text-slate-400 dark:text-slate-500",
  "text-white": "text-slate-900 dark:text-white",
  
  // Hover Backgrounds
  "hover:bg-slate-800": "hover:bg-slate-100 dark:hover:bg-slate-800",
  "hover:bg-slate-700": "hover:bg-slate-200 dark:hover:bg-slate-700",
};

// Exceptional patterns where text-white shouldn't change
// If it's inside a button with bg-blue-600, or bg-emerald-600 etc.

walkDir('./src/components', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Quick hack: temporarily shield known patterns where text-white is needed
    // e.g. from-blue-600 to-indigo-600 text-white
    content = content.replace(/text-white(.*bg-blue-)/g, 'TEXT_WHITE_SHIELD$1');
    content = content.replace(/(bg-[a-z]+-500[^"']*?)text-white/g, '$1TEXT_WHITE_SHIELD');
    content = content.replace(/(bg-[a-z]+-600[^"']*?)text-white/g, '$1TEXT_WHITE_SHIELD');
    content = content.replace(/(to-[a-z]+-600[^"']*?)text-white/g, '$1TEXT_WHITE_SHIELD');
    content = content.replace(/(to-[a-z]+-700[^"']*?)text-white/g, '$1TEXT_WHITE_SHIELD');
    
    // Also protect existing dark: classes to prevent dark:dark:
    content = content.replace(/dark:([a-z0-9\-]+)/g, 'DARK_SHIELD_$1');

    for (const [key, value] of Object.entries(replacements)) {
      // Use regex to replace whole word, except if preceded by dark: or hover: unless it's the specific key
      const regex = new RegExp(`(?<!dark:)(?<!hover:)\\b${key.replace(/\//g, '\\/')}\\b`, 'g');
      content = content.replace(regex, value);
    }

    // Restore shields
    content = content.replace(/TEXT_WHITE_SHIELD/g, 'text-white');
    content = content.replace(/DARK_SHIELD_([a-z0-9\-]+)/g, 'dark:$1');

    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Done');
