const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /bg-gradient-to-br/g, replace: 'bg-linear-to-br' },
  { search: /bg-gradient-to-r/g, replace: 'bg-linear-to-r' },
  { search: /min-h-\[40px\]/g, replace: 'min-h-10' },
  { search: /min-h-\[600px\]/g, replace: 'min-h-150' },
  { search: /max-w-\[250px\]/g, replace: 'max-w-62.5' },
  { search: /max-w-\[200px\]/g, replace: 'max-w-50' },
  { search: /max-w-\[120px\]/g, replace: 'max-w-30' },
  { search: /sm:max-w-\[600px\]/g, replace: 'sm:max-w-150' },
  { search: /lg:max-w-\[600px\]/g, replace: 'lg:max-w-150' },
  { search: /h-\[350px\]/g, replace: 'h-87.5' },
  { search: /from-\[\#16a34a\]/g, replace: 'from-madrasah-600' },
  { search: /via-\[\#15803d\]/g, replace: 'via-madrasah-700' },
  { search: /to-\[\#14532d\]/g, replace: 'to-madrasah-900' },
  { search: /to-\[\#ca8a04\]/g, replace: 'to-gold-600' },
  { search: /flex-grow/g, replace: 'grow' },
  { search: /flex-shrink-0/g, replace: 'shrink-0' }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const { search, replace } of replacements) {
    if (search.test(content)) {
      content = content.replace(search, replace);
      changed = true;
    }
  }

  // Handle the conflicting classes issue (text-muted-foreground vs text-emerald-600)
  // Just removing text-muted-foreground if text-emerald-600 or text-slate-600 exists in same class string
  const classRegex = /className=(?:\{`|["'])(.*?)(?:`\}|["'])/g;
  content = content.replace(classRegex, (match, classString) => {
    if (classString.includes('text-emerald-600') && classString.includes('text-muted-foreground')) {
      changed = true;
      return match.replace('text-muted-foreground', '').replace(/\s+/, ' ');
    }
    if (classString.includes('text-slate-600') && classString.includes('text-muted-foreground')) {
      changed = true;
      return match.replace('text-muted-foreground', '').replace(/\s+/, ' ');
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      processFile(fullPath);
    }
  }
}

processDir(path.join(__dirname, '..', 'src', 'app'));
processDir(path.join(__dirname, '..', 'src', 'components'));
console.log("Done");
