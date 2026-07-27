const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /bg-gradient-to-br/g, replace: 'bg-linear-to-br' },
  { search: /bg-gradient-to-r/g, replace: 'bg-linear-to-r' },
  { search: /min-h-\[40px\]/g, replace: 'min-h-10' },
  { search: /lg:max-w-\[600px\]/g, replace: 'lg:max-w-150' },
  { search: /flex-grow/g, replace: 'grow' },
  { search: /flex-shrink-0/g, replace: 'shrink-0' },
  { search: /max-w-\[250px\]/g, replace: 'max-w-62.5' },
  { search: /max-w-\[1400px\]/g, replace: 'max-w-350' },
  { search: /max-w-\[200px\]/g, replace: 'max-w-50' },
  { search: /sm:max-w-\[600px\]/g, replace: 'sm:max-w-150' },
  { search: /text-muted-foreground/g, replace: 'text-slate-600' }, 
  { search: /h-\[350px\]/g, replace: 'h-87.5' },
  { search: /from-\[\#16a34a\]/g, replace: 'from-madrasah-600' },
  { search: /via-\[\#15803d\]/g, replace: 'via-madrasah-700' },
  { search: /to-\[\#14532d\]/g, replace: 'to-madrasah-900' },
  { search: /to-\[\#ca8a04\]/g, replace: 'to-gold-600' },
  { search: /min-h-\[600px\]/g, replace: 'min-h-150' }
];

const files = [
  'src/app/page.tsx',
  'src/app/dashboard/berita/page.tsx',
  'src/app/dashboard/layout.tsx',
  'src/app/dashboard/link-operator/page.tsx',
  'src/app/dashboard/madrasah/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/globals.css',
  'src/app/madrasah/guru/page.tsx',
  'src/app/madrasah/layout.tsx',
  'src/app/madrasah/page.tsx',
  'src/app/madrasah/surat/page.tsx',
  'src/components/ui/data-table.tsx'
];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replacements.forEach(r => {
      content = content.replace(r.search, r.replace);
    });
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});
