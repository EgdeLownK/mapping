const fs = require('fs');
const files = [
  'index.html',
  'js/data.js',
  'js/editor.js',
  'js/interactions.js',
  'js/renderer.js'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace 'island' variables and properties
    // Case sensitive replacements to preserve camelCase if any (e.g. addIsland -> addZone)
    content = content.replace(/islands/g, 'zones');
    content = content.replace(/island/g, 'zone');
    content = content.replace(/Islands/g, 'Zones');
    content = content.replace(/Island/g, 'Zone');
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
