(function(){
var A = window.Agora = window.Agora || {};
A.NODE_W=340; A.HEADER_H=40; A.ITEM_H=26;
A.COLORS=['#3B82F6','#2563EB','#4F46E5','#8B5CF6','#6366F1','#10B981','#059669','#F59E0B','#EF4444','#F472B6','#0EA5E9','#14B8A6'];

var DEFAULT_ITEM_TYPES=[
  {category:'Validation',color:'#10B981',description:'Action de validation forte (CTA, switch)',items:[
    {tag:'+CTA',label:'Bouton CTA'},
    {tag:'+Toggle',label:'Toggle / Switch'}
  ]},
  {category:'Redirection',color:'#F472B6',description:'Lien ou bouton qui change de page',items:[
    {tag:'+Action',label:'Action / Navigation'},
    {tag:'+Link',label:'Lien'},
    {tag:'+Tab',label:'Onglet'},
    {tag:'+Auth',label:'SSO / Auth'},
    {tag:'+Redirect',label:'Redirection'}
  ]},
  {category:'Overlay',color:'#60A5FA',description:'Ouvre une modale, tiroir ou menu',items:[
    {tag:'+Action Overlay',label:'Modale / Overlay'}
  ]},
  {category:'Saisie',color:'#A78BFA',description:'Input, select, formulaire, upload',items:[
    {tag:'+Input',label:'Champ texte'},
    {tag:'+Select',label:'Sélecteur'},
    {tag:'+Form',label:'Formulaire'},
    {tag:'+Upload',label:'Upload fichier'},
    {tag:'+Consent',label:'Consentement'}
  ]},
  {category:'Statique',color:'#94A3B8',description:'Texte, affichage, aucune interaction',items:[
    {tag:'+Text',label:'Texte statique'},
    {tag:'+Media',label:'Média'},
    {tag:'+List',label:'Liste'}
  ]}
];


var DEFAULT_DATA={
  core_architecture: {
    itemTypes: JSON.parse(JSON.stringify(DEFAULT_ITEM_TYPES)),
    relationTypes: [
      { "type": "nav_cta", "label": "CTA / Bouton principal", "color": "#3B82F6" },
      { "type": "nav_link", "label": "Clic lien texte", "color": "#64748B" },
      { "type": "nav_tab", "label": "Sélection onglet", "color": "#8B5CF6" },
      { "type": "nav_menu", "label": "Clic menu latéral", "color": "#10B981" },
      { "type": "nav_redirect", "label": "Redirection automatique", "color": "#F59E0B" },
      { "type": "auth_success", "label": "Auth réussie", "color": "#22C55E" },
      { "type": "auth_submit", "label": "Soumission formulaire", "color": "#F97316" },
      { "type": "open_overlay", "label": "Ouverture overlay", "color": "#EC4899" },
      { "type": "open_tab", "label": "Affichage sous-composant", "color": "#D946EF" }
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


// ── Migrate old flat itemTypes to grouped format ──
function migrateItemTypes(types){
  if(!types||!types.length)return JSON.parse(JSON.stringify(DEFAULT_ITEM_TYPES));
  // Already in new format?
  if(types[0].category&&types[0].items){
    // Clean: strip residual 'color' from individual items & ensure description exists
    types.forEach(function(cat){
      if(!cat.description&&cat.description!=='')cat.description='';
      (cat.items||[]).forEach(function(item){delete item.color;});
    });
    return types;
  }
  // Old flat format: [{tag,label,color}] → group by color
  var byColor={},order=[];
  types.forEach(function(t){
    var key=t.color||'#94A3B8';
    if(!byColor[key]){byColor[key]={category:'Groupe',color:key,description:'',items:[]};order.push(key);}
    byColor[key].items.push({tag:t.tag,label:t.label});
  });
  // Try to name groups based on known color mappings
  var nameMap={'#10B981':'Validation','#F472B6':'Redirection','#60A5FA':'Overlay','#A78BFA':'Saisie','#94A3B8':'Statique'};
  var usedNames={};
  var result=[];
  order.forEach(function(key){
    var g=byColor[key];
    var name=nameMap[key]||('Groupe '+key);
    if(usedNames[name]){name=name+' '+Object.keys(usedNames).length;}
    usedNames[name]=true;
    g.category=name;
    result.push(g);
  });
  return result;
}


// ── Migration Script (Core & Canvas Split) ──
function generateItemId() { return 'itm_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

function performMigration(data) {
  if (data.core_architecture) return data; // Already migrated
  
  var newData = {
    core_architecture: {
      itemTypes: data.itemTypes ? JSON.parse(JSON.stringify(data.itemTypes)) : [],
      relationTypes: data.relationTypes ? JSON.parse(JSON.stringify(data.relationTypes)) : [],
      pages: data.pages ? JSON.parse(JSON.stringify(data.pages)) : [],
      nodes: [],
      edges: []
    },
    canvas_state: {
      legend: data.legend ? JSON.parse(JSON.stringify(data.legend)) : [],
      nodeStates: {}
    }
  };

  // Process nodes
  (data.nodes || []).forEach(function(n) {
    var newNode = {
      id: n.id,
      title: n.title,
      category: n.category || '',
      page: n.page || n.island || n.zone || '',
      desc: n.desc || '',
      items: []
    };
    
    // Process items
    (n.items || []).forEach(function(it) {
      if (!it.itemId) it.itemId = generateItemId();
      newNode.items.push(it);
    });
    
    newData.core_architecture.nodes.push(newNode);
    
    // Extract canvas state
    newData.canvas_state.nodeStates[n.id] = {
      x: n.x || 0,
      y: n.y || 0,
      color: n.color || '#94A3B8'
    };
  });

  // Process edges
  (data.edges || []).forEach(function(e) {
    var fromNode = newData.core_architecture.nodes.find(function(x) { return x.id === e.from; });
    var sourceItemId = null;
    if (fromNode && e.fIdx !== undefined && fromNode.items[e.fIdx]) {
      sourceItemId = fromNode.items[e.fIdx].itemId;
    }
    
    // Fallback if missing
    if (!sourceItemId && fromNode && fromNode.items.length > 0) {
      sourceItemId = fromNode.items[0].itemId;
    }
    
    newData.core_architecture.edges.push({
      from: e.from,
      sourceItemId: sourceItemId,
      to: e.to,
      label: e.label,
      type: e.type
    });
  });

  return newData;
}

var saved=localStorage.getItem('agora-map-data');
try{
  var parsed = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_DATA));
  A.data = performMigration(parsed);
  A.data.core_architecture.itemTypes=migrateItemTypes(A.data.core_architecture.itemTypes);
}catch(e){
  A.data=performMigration(JSON.parse(JSON.stringify(DEFAULT_DATA)));
  A.data.core_architecture.itemTypes=migrateItemTypes(A.data.core_architecture.itemTypes);
}

A.save=function(){
  try{
    localStorage.setItem('agora-map-data',JSON.stringify(A.data));
    var ind=document.getElementById('save-indicator');
    if(ind){ind.textContent='✓ Sauvegardé';ind.style.color='#10B981';
      clearTimeout(A._saveTimer);A._saveTimer=setTimeout(function(){ind.textContent='Auto-save actif';ind.style.color='#64748B';},2000);
    }
  }catch(e){
    console.warn('localStorage indisponible, utilisez Export JSON pour sauvegarder.');
    var ind=document.getElementById('save-indicator');
    if(ind){ind.textContent='⚠ localStorage bloqué';ind.style.color='#F59E0B';}
  }
};
A.findNode=function(id){return A.data.core_architecture.nodes.find(function(x){return x.id===id;});};
A.findPage=function(id){return(A.data.core_architecture.pages||[]).find(function(x){return x.id===id;});};

// Page CRUD
A.addPage=function(isl){A.data.core_architecture.pages.push(isl);A.save();};
A.updatePage=function(id,u){var isl=A.findPage(id);if(isl)Object.assign(isl,u);A.save();};
A.deletePage=function(id){
  A.data.core_architecture.pages=A.data.core_architecture.pages.filter(function(x){return x.id!==id});
  // Unset page ref from nodes
  A.data.core_architecture.nodes.forEach(function(n){if(n.page===id)n.page='';});
  A.save();
};

// Node CRUD
A.addNode=function(n){A.data.core_architecture.nodes.push(n); A.data.canvas_state.nodeStates[n.id] = {x: n.x||0, y: n.y||0, color: n.color||'#3B82F6'}; delete n.x; delete n.y; delete n.color; A.save();};
A.updateNode=function(id,u){var n=A.findNode(id);if(n)Object.assign(n,u);A.save();};
A.deleteNode=function(id){A.data.core_architecture.nodes=A.data.core_architecture.nodes.filter(function(x){return x.id!==id});A.data.core_architecture.edges=A.data.core_architecture.edges.filter(function(e){return e.from!==id&&e.to!==id}); delete A.data.canvas_state.nodeStates[id]; A.save();};

// Item CRUD
A.addItem=function(nid,item){var n=A.findNode(nid);if(n){ item.itemId = item.itemId || generateItemId(); n.items.push(item); } A.save();};
A.updateItem=function(nid,idx,u){var n=A.findNode(nid);if(n&&n.items[idx])Object.assign(n.items[idx],u);A.save();};
A.deleteItem=function(nid,idx){
  var n=A.findNode(nid);if(!n || !n.items[idx])return;
  var deletedItemId = n.items[idx].itemId;
  n.items.splice(idx,1);
  A.data.core_architecture.edges=A.data.core_architecture.edges.filter(function(e){return !(e.from===nid && e.sourceItemId===deletedItemId);});
  A.save();
};
A.moveItem=function(nid,from,to){
  var n=A.findNode(nid);if(!n||to<0||to>=n.items.length)return;
  var item=n.items.splice(from,1)[0];n.items.splice(to,0,item);
  A.save();
};

// Edge CRUD
A.addEdge=function(e){
  // Prevent duplicate edges
  var exists=A.data.core_architecture.edges.some(function(x){return x.from===e.from&&x.sourceItemId===e.sourceItemId&&x.to===e.to;});
  if(exists)return false;
  A.data.core_architecture.edges.push(e);A.save();return true;
};
A.deleteEdgeAt=function(idx){A.data.core_architecture.edges.splice(idx,1);A.save();};

// Legend CRUD
A.addLegend=function(e){A.data.canvas_state.legend.push(e);A.save();};
A.updateLegend=function(i,u){if(A.data.canvas_state.legend[i])Object.assign(A.data.canvas_state.legend[i],u);A.save();};
A.deleteLegend=function(i){A.data.canvas_state.legend.splice(i,1);A.save();};

// ItemType Category CRUD
A.addItemTypeCategory=function(cat){A.data.core_architecture.itemTypes.push(cat);A.save();};
A.updateItemTypeCategory=function(i,u){if(A.data.core_architecture.itemTypes[i])Object.assign(A.data.core_architecture.itemTypes[i],u);A.save();};
A.deleteItemTypeCategory=function(i){A.data.core_architecture.itemTypes.splice(i,1);A.save();};

// ItemType Item CRUD (within a category)
A.addItemTypeItem=function(catIdx,item){if(A.data.core_architecture.itemTypes[catIdx])A.data.core_architecture.itemTypes[catIdx].items.push(item);A.save();};
A.updateItemTypeItem=function(catIdx,itemIdx,u){if(A.data.core_architecture.itemTypes[catIdx]&&A.data.core_architecture.itemTypes[catIdx].items[itemIdx])Object.assign(A.data.core_architecture.itemTypes[catIdx].items[itemIdx],u);A.save();};
A.deleteItemTypeItem=function(catIdx,itemIdx){if(A.data.core_architecture.itemTypes[catIdx])A.data.core_architecture.itemTypes[catIdx].items.splice(itemIdx,1);A.save();};

// ── Download helper (shared) ──
A._downloadJSON=function(json,filename){
  if(window.showSaveFilePicker){
    window.showSaveFilePicker({
      suggestedName:filename,
      types:[{description:'JSON',accept:{'application/json':['.json']}}]
    }).then(function(handle){return handle.createWritable();})
    .then(function(writable){writable.write(json);return writable.close();})
    .then(function(){A.toast('✅ Fichier sauvegardé !','success');})
    .catch(function(e){
      if(e.name!=='AbortError') A._downloadJSONFallback(json,filename);
    });
    return;
  }
  A._downloadJSONFallback(json,filename);
};
A._downloadJSONFallback=function(json,filename){
  try{
    var blob=new Blob([json],{type:'application/json'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;a.download=filename;a.style.display='none';
    document.body.appendChild(a);a.click();
    setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},500);
    A.toast('✅ Téléchargement lancé !','success');
  }catch(e){
    var w=window.open('','_blank');
    if(w){w.document.write('<html><body><pre style="font-family:monospace;font-size:12px;white-space:pre-wrap;">'+A.escHtml(json)+'</pre></body></html>');w.document.close();}
    else{A.copyToClipboard(json);A.toast('📋 JSON copié dans le presse-papier','info');}
  }
};

// ── Export Sauvegarde (schéma complet — réimport parfait) ──
A.exportSave=function(){
  var json=JSON.stringify(A.data,null,2);
  var filename='agora-sauvegarde-'+new Date().toISOString().slice(0,10)+'.json';
  A._downloadJSON(json,filename);
};

// ── Export IA (optimisé pour la compréhension par une IA) ──
A.exportAI=function(){
  var ca=A.data.core_architecture;

  // Pages index
  var pagesById={};
  (ca.pages||[]).forEach(function(p){pagesById[p.id]=p.title;});

  // Infer parent from Tab edges: if node B is target of a Tab item from node A, B's parent = A
  var parentMap={};
  (ca.edges||[]).forEach(function(e){
    if(e.from===e.to)return;
    var fromNode=ca.nodes.find(function(n){return n.id===e.from;});
    if(!fromNode)return;
    var srcItem=fromNode.items.find(function(it){return it.itemId===e.sourceItemId;});
    if(srcItem&&srcItem.t&&srcItem.t.replace(/^\+/,'').toLowerCase()==='tab'){
      if(!parentMap[e.to])parentMap[e.to]=e.from;
    }
  });

  // Element types (no colors)
  var elementTypes=(ca.itemTypes||[]).map(function(cat){
    return{
      category:cat.category,
      description:cat.description||'',
      types:(cat.items||[]).map(function(item){
        return{type:item.tag.replace(/^\+/,''),label:item.label};
      })
    };
  });

  // Interaction types (no colors)
  var interactionTypes=(ca.relationTypes||[]).map(function(rt){
    return{type:rt.type,label:rt.label};
  });

  // Components (nodes without h3 separators, clean field names)
  var components=(ca.nodes||[]).map(function(n){
    var obj={
      id:n.id,
      name:n.title,
      description:n.desc||''
    };
    if(n.page&&pagesById[n.page])obj.page=pagesById[n.page];
    if(parentMap[n.id])obj.parent=parentMap[n.id];
    if(n.modes&&n.modes.length)obj.modes=n.modes;
    if(n.default_mode)obj.default_mode=n.default_mode;
    if(n.section_role)obj.section_role=n.section_role;
    obj.elements=(n.items||[])
      .filter(function(it){return it.t!=='h3';})
      .map(function(it){
        var el={
          type:it.t.replace(/^\+/,''),
          name:it.n
        };
        if(it.visible_in_modes&&it.visible_in_modes.length)el.visible_in_modes=it.visible_in_modes;
        return el;
      });
    return obj;
  });

  // Flows (edges — resolved names instead of internal IDs)
  var flows=(ca.edges||[]).map(function(e){
    var fromNode=ca.nodes.find(function(n){return n.id===e.from;});
    var srcItem=fromNode?fromNode.items.find(function(it){return it.itemId===e.sourceItemId;}):null;
    var flow={
      from:e.from,
      to:e.to,
      trigger:srcItem?srcItem.n:''
    };
    if(e.type)flow.interaction_type=e.type;
    if(e.label)flow.label=e.label;
    return flow;
  });

  var aiExport={
    _description:'Architecture export — optimized for AI. No visual/positional data. Components describe UI screens and their elements. Flows describe navigation triggers between components.',
    _glossary:{
      modes:"Un composant peut avoir plusieurs modes d'affichage (par exemple 'view' pour la consultation et 'edit' pour l'édition). Le mode actif détermine quels éléments du composant sont visibles. Voir le champ visible_in_modes sur les éléments.",
      default_mode:"Le mode dans lequel le composant est rendu par défaut lors de son premier affichage.",
      section_role:"Désigne le rôle fonctionnel d'une section du profil Agora. 'conversion' = sections orientées action commerciale (Shop, Agenda, Événement), affichées en priorité sur Accueil. 'content' = sections de contenu récurrent (News, Vidéos), affichées après les sections de conversion. 'identity' = sections de présentation (Histoire, Portfolio), affichées en dernier.",
      visible_in_modes:"Liste des modes du composant parent dans lesquels cet élément est visible. Si absent, l'élément est visible dans tous les modes."
    },
    _conventions:[
      "Sur le profil public d'Agora, l'ordre d'affichage des sections est : sections de rôle 'conversion' d'abord, puis 'content', puis 'identity'. Cet ordre n'est pas modifiable par l'utilisateur.",
      "Une section peut être publiée ou dépubliée sans perdre son contenu. La dépublication la rend invisible aux visiteurs mais ne supprime aucune donnée.",
      "Le profil et son interface d'édition partagent le même rendu visuel de fond. Les éléments d'édition (boutons modifier, bordures de survol) sont visibles uniquement quand le mode actif est 'edit'.",
      "Les éléments sans visible_in_modes sont visibles dans tous les modes du composant parent."
    ],
    element_types:elementTypes,
    interaction_types:interactionTypes,
    pages:(ca.pages||[]).map(function(p){return{id:p.id,name:p.title};}),
    components:components,
    flows:flows
  };

  var json=JSON.stringify(aiExport,null,2);
  var filename='architecture-ia-'+new Date().toISOString().slice(0,10)+'.json';
  A._downloadJSON(json,filename);
  A.toast('🤖 Export IA téléchargé !','success');
};

A.copyToClipboard=function(text){
  var ta=document.createElement('textarea');
  ta.value=text;ta.style.position='fixed';ta.style.left='-9999px';
  document.body.appendChild(ta);ta.select();
  try{document.execCommand('copy');}catch(e){}
  document.body.removeChild(ta);
};

// ── Import ──
A.importJSON=function(j){
  try{
    var p=JSON.parse(j);
    var migrated=performMigration(p);
    if(!migrated.core_architecture||!migrated.core_architecture.nodes)throw new Error("Invalid format");
    A.data=migrated;
    A.data.core_architecture.itemTypes=migrateItemTypes(A.data.core_architecture.itemTypes);
    if(!A.data.canvas_state)A.data.canvas_state={legend:[],nodeStates:{}};
    if(!A.data.canvas_state.nodeStates)A.data.canvas_state.nodeStates={};
    if(!A.data.canvas_state.legend)A.data.canvas_state.legend=[];
    var ns=A.data.canvas_state.nodeStates;
    var cx=80,cy=80;
    A.data.core_architecture.nodes.forEach(function(n){
      if(!ns[n.id]){ns[n.id]={x:cx,y:cy,color:"#3B82F6"};cx+=380;if(cx>2000){cx=80;cy+=300;}}
    });
    (A.data.core_architecture.edges||[]).forEach(function(e){
      if(!e.sourceItemId&&e.fIdx!==undefined){
        var fn=A.findNode(e.from);
        if(fn&&fn.items[e.fIdx])e.sourceItemId=fn.items[e.fIdx].itemId;
        delete e.fIdx;
      }
    });
    A.data.core_architecture.nodes.forEach(function(n){
      n.items.forEach(function(it){if(!it.itemId)it.itemId=generateItemId();});
    });
    A.save();return true;
  }catch(e){console.error("Import failed:",e);return false;}
};
A.resetData=function(){A.data=JSON.parse(JSON.stringify(DEFAULT_DATA));A.save();};

// ── Toast ──
A.toast=function(m,t){var c=document.getElementById('toast-container');var d=document.createElement('div');d.className='toast toast-'+(t||'info');d.textContent=m;c.appendChild(d);setTimeout(function(){d.remove()},3000);};

// ── Helpers ──
A.getItemColor=function(t){
  var types=A.data.core_architecture.itemTypes||[];
  // Normalize: strip leading '+' for comparison
  var clean=t.replace(/^\+/,'');
  for(var ci=0;ci<types.length;ci++){
    var cat=types[ci];
    for(var ii=0;ii<cat.items.length;ii++){
      var tagClean=cat.items[ii].tag.replace(/^\+/,'');
      if(clean===tagClean)return cat.color;
    }
  }
  return'#94A3B8';
};

// Get all item types as flat list (for dropdowns)
A.getAllItemTags=function(){
  var result=[];
  (A.data.core_architecture.itemTypes||[]).forEach(function(cat){
    cat.items.forEach(function(item){
      result.push({tag:item.tag,label:item.label,color:cat.color,category:cat.category});
    });
  });
  return result;
};

A.escHtml=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');};

// ── Auto-save on page unload ──
window.addEventListener('beforeunload',function(){A.save();});
})();

A.getRelationColor=function(type){
  var res='#94A3B8';
  if(A.data.core_architecture.relationTypes){
    var rt = A.data.core_architecture.relationTypes.find(function(x){return x.type===type;});
    if(rt && rt.color) res = rt.color;
  }
  return res;
};
