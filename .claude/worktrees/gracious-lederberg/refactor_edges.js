const fs = require('fs');

const REL_TYPES = [
  { type: "nav_cta", label: "CTA / Bouton principal", color: "#3B82F6" },
  { type: "nav_link", label: "Clic lien texte", color: "#64748B" },
  { type: "nav_tab", label: "Sélection onglet", color: "#8B5CF6" },
  { type: "nav_menu", label: "Clic menu latéral", color: "#10B981" },
  { type: "nav_redirect", label: "Redirection automatique", color: "#F59E0B" },
  { type: "auth_success", label: "Auth réussie", color: "#22C55E" },
  { type: "auth_submit", label: "Soumission formulaire", color: "#F97316" },
  { type: "open_overlay", label: "Ouverture overlay", color: "#EC4899" },
  { type: "open_tab", label: "Affichage sous-composant", color: "#D946EF" }
];

const NEW_EDGES = [
  {from:"nav_public",fIdx:1,to:"nav_public",label:"Ouverture menu",type:"open_overlay"},
  {from:"nav_public",fIdx:2,to:"landing_public",label:"Clic Accueil",type:"nav_link"},
  {from:"nav_public",fIdx:4,to:"inscr",label:"Clic Créer espace",type:"nav_cta"},
  {from:"nav_public",fIdx:5,to:"conn",label:"Clic Se connecter",type:"nav_cta"},
  {from:"landing_public",fIdx:3,to:"inscr",label:"Clic Rejoindre",type:"nav_cta"},
  {from:"inscr",fIdx:5,to:"mon_profil",label:"Auth SSO réussie",type:"auth_success"},
  {from:"inscr",fIdx:6,to:"conn",label:"Clic lien",type:"nav_link"},
  {from:"conn",fIdx:4,to:"conn",label:"Ouverture modale",type:"open_overlay"},
  {from:"conn",fIdx:5,to:"home_discover",label:"Soumission formulaire",type:"auth_submit"},
  {from:"conn",fIdx:6,to:"inscr",label:"Clic lien",type:"nav_link"},
  {from:"nav_app",fIdx:1,to:"nav_app",label:"Toggle collapse",type:"open_overlay"},
  {from:"nav_app",fIdx:2,to:"home_discover",label:"Clic logo",type:"nav_link"},
  {from:"nav_app",fIdx:4,to:"nav_app",label:"Clic Messages",type:"nav_menu"},
  {from:"nav_app",fIdx:5,to:"nav_app",label:"Clic Notifications",type:"open_overlay"},
  {from:"nav_app",fIdx:7,to:"mon_profil",label:"Clic Mon profil",type:"nav_menu"},
  {from:"nav_app",fIdx:8,to:"nav_app",label:"Clic paramètres",type:"open_overlay"},
  {from:"home_discover",fIdx:4,to:"mon_profil",label:"Clic Ouvrir Profil",type:"nav_redirect"},
  {from:"mon_profil",fIdx:4,to:"mon_profil",label:"Ouverture modale",type:"open_overlay"}
];

function updateDataJS() {
  let content = fs.readFileSync('js/data.js', 'utf8');

  // Replace relationTypes array
  content = content.replace(/relationTypes:\[[\s\S]*?\],/, `relationTypes:${JSON.stringify(REL_TYPES, null, 4)},`);

  // Replace edges array inside DEFAULT_DATA
  content = content.replace(/edges:\[[\s\S]*?\]\n\};/g, `edges:${JSON.stringify(NEW_EDGES, null, 4)}\n};`);

  // Inject a getRelationColor function logically near itemType utils
  if(content.indexOf('A.getRelationColor') === -1) {
    let func = `
A.getRelationColor=function(type){
  var res='#94A3B8';
  if(A.data.relationTypes){
    var rt = A.data.relationTypes.find(function(x){return x.type===type;});
    if(rt && rt.color) res = rt.color;
  }
  return res;
};
`;
    content += func;
  }

  // Ensure exportJSON exports relationTypes if it wasn't strictly automatic? A.data is exported automatically, so we're good.
  fs.writeFileSync('js/data.js', content);
}

function updateEditorJS() {
  let content = fs.readFileSync('js/editor.js', 'utf8');
  
  // Replace references of e.t to e.type
  content = content.replace(/e\.t\b/g, 'e.type');
  
  // Replace typeOpts generation from itemTypes to relationTypes
  const oldTypeOpts = `var typeOpts=[{value:'',label:'— Aucun type —'}];
    (A.data.itemTypes||[]).forEach(function(cat){
      typeOpts.push({isGroup:true,label:cat.category});
      (cat.items||[]).forEach(function(item){typeOpts.push({value:item.tag,label:item.tag+' — '+item.label});});
    });`;

  const newTypeOpts = `var typeOpts=[{value:'',label:'— Aucun type —'}];
    (A.data.relationTypes||[]).forEach(function(rt){
      typeOpts.push({value:rt.type, label: rt.type + ' — ' + rt.label});
    });`;

  content = content.replace(oldTypeOpts, newTypeOpts);

  fs.writeFileSync('js/editor.js', content);
}

function updateRendererJS() {
  let content = fs.readFileSync('js/renderer.js', 'utf8');
  
  // e.t -> e.type
  content = content.replace(/e\.t\b/g, 'e.type');
  
  // A.getItemColor(e.type) -> A.getRelationColor(e.type)
  content = content.replace(/A\.getItemColor\(e\.type\)/g, 'A.getRelationColor(e.type)');

  // Fix the labelOrType logic: the user wants label to be standard.
  // We can show both type and label if we want, but let's just make it visually e.type is for color, label is what appears in badge!
  // "Champ label : déclencheur précis de la navigation ... Champ type : tag"
  content = content.replace(/var labelOrType = e\.type \|\| e\.label;/, 'var labelOrType = e.label || e.type;');

  fs.writeFileSync('js/renderer.js', content);
}

updateDataJS();
updateEditorJS();
updateRendererJS();

console.log("Edges Refactoring Complete.");
