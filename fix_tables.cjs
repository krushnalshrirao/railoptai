const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-slate-50 border-slate-200/g, 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800');
  content = content.replace(/bg-slate-100 text-slate-700/g, 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300');
  content = content.replace(/divide-slate-200/g, 'divide-slate-200 dark:divide-slate-800');
  content = content.replace(/hover:bg-slate-50/g, 'hover:bg-slate-50 dark:hover:bg-slate-800/50');
  content = content.replace(/border-slate-200/g, 'border-slate-200 dark:border-slate-800');
  fs.writeFileSync(file, content);
}

fix('src/components/OperatorDashboard.tsx');
fix('src/components/IntegratedDataFeeds.tsx');
fix('src/components/CorridorMap.tsx');

console.log('Fixed tables');
