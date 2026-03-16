const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-slate-900': 'bg-white',
  'bg-slate-950': 'bg-slate-50',
  'bg-slate-800': 'bg-slate-100',
  'bg-slate-700': 'bg-slate-200',
  'border-slate-800': 'border-slate-200',
  'border-slate-700': 'border-slate-300',
  'text-slate-400': 'text-slate-600',
  'text-slate-500': 'text-slate-500', // Keep some contrast
  'text-slate-600': 'text-slate-700',
  'text-white': 'text-slate-900', // Need black text on white backgrounds
  'bg-black': 'bg-white',
  'text-black': 'text-white' // Assuming if it was black text on something light, it now needs to be white on dark (or keep as is depending, but tailwind dark is usually white text)
};

// Refining the replacement to be more intelligent
const safeReplacements = {
    'bg-slate-900': 'bg-white',
    'bg-slate-950': 'bg-slate-50',
    'bg-slate-800': 'bg-slate-100',
    'bg-slate-700': 'bg-slate-200',
    'border-slate-800': 'border-slate-200',
    'border-slate-700': 'border-slate-300',
    'text-slate-400': 'text-slate-600',
    'text-slate-500': 'text-slate-700',
    'text-white': 'text-slate-900',
    'bg-black/50': 'bg-white/50',
    'bg-black': 'bg-white',
    'from-slate-900': 'from-white',
    'to-slate-950': 'to-slate-50',
    'via-slate-900': 'via-slate-50'
};

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.next')) {
        processDirectory(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const [oldClass, newClass] of Object.entries(safeReplacements)) {
          // Replace using regex with word boundaries to avoid partial matches
          const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
          content = content.replace(regex, newClass);
      }
      
      if (originalContent !== content) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

// Process frontend
processDirectory(path.join(__dirname, 'frontend', 'src'));
// Process frontend-admin
processDirectory(path.join(__dirname, 'frontend-admin', 'src'));
console.log('Done!');
