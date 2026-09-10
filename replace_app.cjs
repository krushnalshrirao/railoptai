const fs = require('fs');
const path = require('path');

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

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/text-white(.*bg-blue-)/g, 'TEXT_WHITE_SHIELD$1');
content = content.replace(/(bg-[a-z]+-500[^"']*?)text-white/g, '$1TEXT_WHITE_SHIELD');
content = content.replace(/(bg-[a-z]+-600[^"']*?)text-white/g, '$1TEXT_WHITE_SHIELD');
content = content.replace(/(to-[a-z]+-600[^"']*?)text-white/g, '$1TEXT_WHITE_SHIELD');
content = content.replace(/(to-[a-z]+-700[^"']*?)text-white/g, '$1TEXT_WHITE_SHIELD');

content = content.replace(/dark:([a-z0-9\-]+)/g, 'DARK_SHIELD_$1');

for (const [key, value] of Object.entries(replacements)) {
  const regex = new RegExp(`(?<!dark:)(?<!hover:)\\b${key.replace(/\//g, '\\/')}\\b`, 'g');
  content = content.replace(regex, value);
}

content = content.replace(/TEXT_WHITE_SHIELD/g, 'text-white');
content = content.replace(/DARK_SHIELD_([a-z0-9\-]+)/g, 'dark:$1');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App done');
