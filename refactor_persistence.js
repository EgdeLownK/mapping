const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'js', 'data.js');
let content = fs.readFileSync(dataFile, 'utf8');

// 1. Refactor DEFAULT_DATA into the new schema
const defaultDataRegex = /var DEFAULT_DATA=\{([\s\S]+?)(?=\nvar saved=localStorage)/;

// We know what the migrated DEFAULT_DATA looks like via performMigration
const migratedDefaultDataStr = `
var DEFAULT_DATA={
  core_architecture: {
    itemTypes: JSON.parse(JSON.stringify(DEFAULT_ITEM_TYPES)),
    relationTypes: [
      { "type": "Change", "label": "Changement de page", "color": "#3B82F6" },
      { "type": "Switch", "label": "switch menu", "color": "#64748B" },
      { "type": "Open overlay", "label": "Ouvre overlay", "color": "#8B5CF6" },
      { "type": "Redirection", "label": "Redirection", "color": "#10B981" },
      { "type": "Redirection auto", "label": "Redirection automatique", "color": "#10B981" },
      { "type": "Submit", "label": "Envoie de données", "color": "#F59E0B" }
    ],
    pages: [
      {id:"page_vitrine",title:"Vitrine Publique"},
      {id:"page_auth",title:"Authentification"},
      {id:"page_workspace",title:"Mon Espace"}
    ],
    nodes: [
      {id:"nav_public",title:"Sidebar Publique",category:"",page:"page_vitrine",desc:"Barre latérale de navigation pour visiteurs non connectés.",items:[
        {itemId:"itm_def1", t:"h3",n:"MENU LATÉRAL",s:"public"},{itemId:"itm_def2", t:"+Action Overlay",n:"Toggle Collapse",s:"public"},{itemId:"itm_def3", t:"+Link",n:"Logo 'Agora' (Accueil)",s:"public"},
        {itemId:"itm_def4", t:"+Input",n:"Recherche publique",s:"public"},{itemId:"itm_def5", t:"+Action",n:"CTA 'Créer mon espace'",s:"public"},{itemId:"itm_def6", t:"+Action",n:"CTA 'Se connecter'",s:"public"},
        {itemId:"itm_def7", t:"h3",n:"FOOTER",s:"public"},{itemId:"itm_def8", t:"+Link",n:"Pages légales, CGU",s:"public"}
      ]},
      {id:"landing_public",title:"Landing Page (Vitrine Profil)",category:"",page:"page_vitrine",desc:"Aperçu public du profil du créateur pour les visiteurs.",items:[
        {itemId:"itm_def10", t:"h3",n:"HERO SECTION",s:"public"},{itemId:"itm_def11", t:"+Media",n:"Photo de profil Agora",s:"public"},{itemId:"itm_def12", t:"+Text",n:"Pitch plateforme MVP",s:"public"},
        {itemId:"itm_def13", t:"+CTA",n:"Bouton 'Rejoindre'",s:"public"},{itemId:"itm_def14", t:"h3",n:"NAVIGATION",s:"public"},{itemId:"itm_def15", t:"+Tab",n:"Agenda",s:"public"},{itemId:"itm_def16", t:"+Tab",n:"Shop",s:"public"},{itemId:"itm_def17", t:"+Tab",n:"Vidéos",s:"public"},{itemId:"itm_def18", t:"+Tab",n:"Histoire",s:"public"}
      ]},
      {id:"inscr",title:"Inscription",category:"",page:"page_auth",desc:"Formulaire de création de compte avec gestion SSO.",items:[
        {itemId:"itm_def20", t:"h3",n:"FORMULAIRE",s:"public"},{itemId:"itm_def21", t:"+Input",n:"Email & Mot de passe",s:"public"},{itemId:"itm_def22", t:"+Auth",n:"Google / Apple SSO",s:"public"},
        {itemId:"itm_def23", t:"h3",n:"VALIDATION",s:"public"},{itemId:"itm_def24", t:"+Consent",n:"RGPD + CGU",s:"public"},{itemId:"itm_def25", t:"+CTA",n:"Bouton 'Créer mon compte'",s:"public"},{itemId:"itm_def26", t:"+Link",n:"Déjà un compte ?",s:"public"}
      ]},
      {id:"conn",title:"Connexion",category:"",page:"page_auth",desc:"Interface d'authentification pour les utilisateurs existants.",items:[
        {itemId:"itm_def30", t:"h3",n:"FORMULAIRE",s:"public"},{itemId:"itm_def31", t:"+Input",n:"Email + Password",s:"public"},{itemId:"itm_def32", t:"+Auth",n:"Google / Apple SSO",s:"public"},
        {itemId:"itm_def33", t:"h3",n:"ACTIONS",s:"public"},{itemId:"itm_def34", t:"+Action Overlay",n:"Mot de passe oublié",s:"public"},{itemId:"itm_def35", t:"+CTA",n:"Bouton 'Se connecter'",s:"public"},{itemId:"itm_def36", t:"+Link",n:"Pas encore de compte ?",s:"public"}
      ]},
      {id:"nav_app",title:"Sidebar Plateforme",category:"",page:"page_workspace",desc:"Menu de navigation principale pour utilisateurs connectés.",items:[
        {itemId:"itm_def40", t:"h3",n:"MENU LATÉRAL CONNECTÉ",s:"auth_only"},{itemId:"itm_def41", t:"+Action Overlay",n:"Toggle Collapse",s:"auth_only"},{itemId:"itm_def42", t:"+Link",n:"Logo 'Agora'",s:"auth_only"},
        {itemId:"itm_def43", t:"+Input",n:"Recherche universelle",s:"auth_only"},{itemId:"itm_def44", t:"+Action",n:"Messages",s:"auth_only"},{itemId:"itm_def45", t:"+Action",n:"Notifications",s:"auth_only"},
        {itemId:"itm_def46", t:"h3",n:"MON ESPACE",s:"auth_only"},{itemId:"itm_def47", t:"+Action",n:"-> Mon Profil",s:"auth_only"},{itemId:"itm_def48", t:"+Action Overlay",n:"-> Paramètres",s:"owner_only"}
      ]},
      {id:"home_discover",title:"Accueil (Découverte)",category:"",page:"page_workspace",desc:"Moteur de recherche et recommandations intelligentes mondiales.",items:[
        {itemId:"itm_def50", t:"h3",n:"MOTEUR DE DÉCOUVERTE",s:"auth_only"},{itemId:"itm_def51", t:"+Input",n:"Barre de recherche géante",s:"auth_only"},
        {itemId:"itm_def52", t:"+List",n:"Créateurs recommandés",s:"auth_only"},{itemId:"itm_def53", t:"+List",n:"Produits mis en avant",s:"auth_only"},{itemId:"itm_def54", t:"+Action",n:"Ouvrir Profil Créateur",s:"auth_only"}
      ]},
      {id:"mon_profil",title:"Mon Profil (SaaS Hub)",category:"",page:"page_workspace",desc:"Tableau de bord et éditeur complet du profil.",items:[
        {itemId:"itm_def60", t:"h3",n:"VUE PROFIL",s:"auth_only"},{itemId:"itm_def61", t:"+Media",n:"Photo, Bio, Liens",s:"auth_only"},{itemId:"itm_def62", t:"+Tab",n:"Agenda, Shop, Vidéos",s:"auth_only"},
        {itemId:"itm_def63", t:"h3",n:"SURCOUCHE CRÉATEUR",s:"owner_only"},{itemId:"itm_def64", t:"+Action Overlay",n:"Modifier Hero / Infos",s:"owner_only"},
        {itemId:"itm_def65", t:"h3",n:"OUTILS FUTURS (MVP+)",s:"owner_only"},{itemId:"itm_def66", t:"+Action",n:"-> Éditeur",s:"owner_only"},{itemId:"itm_def67", t:"+Action",n:"-> Analytics",s:"owner_only"}
      ]}
    ],
    edges: [
      { from: "nav_public", sourceItemId: "itm_def2", to: "nav_public", label: "Ouverture menu", type: "open_overlay" },
      { from: "nav_public", sourceItemId: "itm_def3", to: "landing_public", label: "Clic Accueil", type: "nav_link" },
      { from: "nav_public", sourceItemId: "itm_def5", to: "inscr", label: "Clic Créer espace", type: "nav_cta" },
      { from: "nav_public", sourceItemId: "itm_def6", to: "conn", label: "Clic Se connecter", type: "nav_cta" },
      { from: "landing_public", sourceItemId: "itm_def13", to: "inscr", label: "Clic Rejoindre", type: "nav_cta" },
      { from: "inscr", sourceItemId: "itm_def25", to: "mon_profil", label: "Auth SSO réussie", type: "auth_success" },
      { from: "inscr", sourceItemId: "itm_def26", to: "conn", label: "Clic lien", type: "nav_link" },
      { from: "conn", sourceItemId: "itm_def34", to: "conn", label: "Ouverture modale", type: "open_overlay" },
      { from: "conn", sourceItemId: "itm_def35", to: "home_discover", label: "Soumission formulaire", type: "auth_submit" },
      { from: "conn", sourceItemId: "itm_def36", to: "inscr", label: "Clic lien", type: "nav_link" },
      { from: "nav_app", sourceItemId: "itm_def41", to: "nav_app", label: "Toggle collapse", type: "open_overlay" },
      { from: "nav_app", sourceItemId: "itm_def42", to: "home_discover", label: "Clic logo", type: "nav_link" },
      { from: "nav_app", sourceItemId: "itm_def44", to: "nav_app", label: "Clic Messages", type: "nav_menu" },
      { from: "nav_app", sourceItemId: "itm_def45", to: "nav_app", label: "Clic Notifications", type: "open_overlay" },
      { from: "nav_app", sourceItemId: "itm_def47", to: "mon_profil", label: "Clic Mon profil", type: "nav_menu" },
      { from: "nav_app", sourceItemId: "itm_def48", to: "nav_app", label: "Clic paramètres", type: "open_overlay" },
      { from: "home_discover", sourceItemId: "itm_def54", to: "mon_profil", label: "Clic Ouvrir Profil", type: "nav_redirect" },
      { from: "mon_profil", sourceItemId: "itm_def64", to: "mon_profil", label: "Ouverture modale", type: "open_overlay" }
    ]
  },
  canvas_state: {
    legend: [
      {label:"Vitrine Publique",color:"#3B82F6"},
      {label:"Authentification",color:"#8B5CF6"},
      {label:"Découverte & Consommation",color:"#10B981"},
      {label:"Mon Profil",color:"#F59E0B"}
    ],
    nodeStates: {
      "nav_public": {x: 70, y: 60, color: "#3B82F6"},
      "landing_public": {x: 70, y: 380, color: "#2563EB"},
      "inscr": {x: 470, y: 60, color: "#4F46E5"},
      "conn": {x: 470, y: 380, color: "#4F46E5"},
      "nav_app": {x: 870, y: 60, color: "#10B981"},
      "home_discover": {x: 870, y: 410, color: "#059669"},
      "mon_profil": {x: 1270, y: 60, color: "#F59E0B"}
    }
  }
};
`;

content = content.replace(/var DEFAULT_DATA=\{[\s\S]+?(?=\n\/\/ ── Migrate old flat itemTypes)/, "\n" + migratedDefaultDataStr.trim() + "\n\n");

// 2. Fix A.importJSON validation
const oldImportJSON = "try{var p=JSON.parse(j);if(!p.nodes||!p.edges)throw 0;A.data=p;A.data.core_architecture.itemTypes=migrateItemTypes(A.data.core_architecture.itemTypes);A.save();return true;}catch(e){return false;}";
const newImportJSON = "try{var p=JSON.parse(j);if(!p.core_architecture||!p.core_architecture.nodes||!p.core_architecture.edges)throw new Error('Invalid format');A.data=p;A.data.core_architecture.itemTypes=migrateItemTypes(A.data.core_architecture.itemTypes);A.save();return true;}catch(e){return false;}";
content = content.replace(oldImportJSON, newImportJSON);

// Now fs.writeFileSync
fs.writeFileSync(dataFile, content, 'utf8');

console.log("Persistence logic properly secured and refactored.");
