const fs = require('fs');

function refactorDataJS() {
  let content = fs.readFileSync('js/data.js', 'utf8');

  // Remove the `pages: [...]` array block completely
  content = content.replace(/\s*pages:\[[\s\S]*?\],/g, '');

  // Remove `page:"..."` from nodes
  content = content.replace(/page:"[^"]+",/g, '');
  content = content.replace(/page: "[^"]+",/g, '');

  // Rename zones to pages in DEFAULT_DATA
  content = content.replace(/zones:\[/g, 'pages:[');
  
  // Replace `zone:"..."` with `page:"..."`
  content = content.replace(/zone:"/g, 'page:"');

  // Inject relationTypes before pages
  content = content.replace(/pages:\[/, 'relationTypes:[\n    { type: "nav_cta", label: "Clic \'Se connecter\'" }\n  ],\n  pages:[');

  fs.writeFileSync('js/data.js', content);
}

function replaceAcrossFiles() {
  const files = [
    'index.html',
    'js/data.js',
    'js/editor.js',
    'js/renderer.js'
  ];

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace all occurrences of zone/zones to page/pages EXCEPT if it breaks specific words
    content = content.replace(/zones/g, 'pages');
    content = content.replace(/zone/g, 'page');
    content = content.replace(/Zones/g, 'Pages');
    content = content.replace(/Zone/g, 'Page');

    fs.writeFileSync(file, content);
  });
}

function removeOldPageLogic() {
  let renderer = fs.readFileSync('js/renderer.js', 'utf8');
  renderer = renderer.replace(/if\s*\(n\.page\)\s*\{[\s\S]*?\}\n/g, '');
  fs.writeFileSync('js/renderer.js', renderer);
}

// First cleanup old page logic
removeOldPageLogic();
// Refactor defaults
refactorDataJS();
// Replace words
replaceAcrossFiles();

// Update desc in data.js for the 7 nodes
let data = fs.readFileSync('js/data.js', 'utf8');
const descs = {
  nav_public: "Barre latérale de navigation pour visiteurs non connectés.",
  landing_public: "Aperçu public du profil du créateur pour les visiteurs.",
  inscr: "Formulaire de création de compte avec gestion SSO.",
  conn: "Interface d'authentification pour les utilisateurs existants.",
  nav_app: "Menu de navigation principale pour utilisateurs connectés.",
  home_discover: "Moteur de recherche et recommandations intelligentes mondiales.",
  mon_profil: "Tableau de bord et éditeur complet du profil."
};

for (const [id, desc] of Object.entries(descs)) {
  const regex = new RegExp(`(id:"${id}"[^\\}]*?desc:")([^"]*)(")`, 'g');
  data = data.replace(regex, `$1${desc}$3`);
}

fs.writeFileSync('js/data.js', data);

console.log("Refactoring complete.");
