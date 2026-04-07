(function(){
var A=window.Agora=window.Agora||{};
var connMode=false,connSrc=null,pendingDel=null;
A._editingPanelNode=null;

A.openModal=function(id){document.getElementById(id).classList.add('open');};
A.closeModal=function(id){document.getElementById(id).classList.remove('open');};

// ══ CANVAS ACTIONS (guarded) ══
A.initCanvasActions=function(){
  if(A._actionsBound)return;A._actionsBound=true;
  var c=document.getElementById('diagram-container');

  c.addEventListener('click',function(e){
    // Connection mode
    if(connMode){
      var ng=e.target.closest('.node');if(!ng)return;
      var nid=ng.getAttribute('data-id');
      if(!connSrc){
        var ir=e.target.closest('.item-row');
        if(ir){var idx=parseInt(ir.getAttribute('data-idx'));setConnSrc(nid,idx);}
      }else{
        // Target = node (not item)
        var _sNode=A.findNode(connSrc.nid); var ok=A.addEdge({from:connSrc.nid,sourceItemId:_sNode.items[connSrc.idx].itemId,to:nid});
        if(ok){
          A.toast('Relation créée !','success');
        }else{
          A.toast('Cette relation existe déjà','error');
        }
        A.render();
        // Reset source for next relation
        connSrc=null;
        document.getElementById('connection-text').textContent='🔗 Cliquez un élément source pour une nouvelle relation. Échap pour quitter.';
      }
      return;
    }
    // Normal actions via explicit buttons (left over for safety or other UI elements)
    var btnEl=e.target.closest('[data-action="delete-node"]');
    if(btnEl){
      var nid=btnEl.getAttribute('data-node');
      A.confirmDeleteNode(nid);
      return;
    }
    
    // Clicking anywhere else on the node (header, items, background) opens the edit panel
    if(A._dragged) return;
    var nodeEl=e.target.closest('.node');
    if(nodeEl){
      A.openPanel(nodeEl.getAttribute('data-id'));
    }
  });

  // dblclick removed since single click now opens the panel
};

// ══ EDIT PANEL (right side overlay) ══
// Combo Box helpers
A.renderCombo=function(id,opts,defVal,plh,onc){
  var dL=plh; opts.forEach(function(o){if(o.value==defVal)dL=o.label;});
  var h='<div class="agora-combo" id="combo_'+A.escHtml(id)+'" data-base="'+A.escHtml(id)+'" data-onchange="'+A.escHtml(onc||'')+'">';
  h+='<input type="hidden" id="'+A.escHtml(id)+'" value="'+A.escHtml(defVal||'')+'">';
  h+='<input class="form-input combo-input" type="text" placeholder="'+A.escHtml(plh)+'" value="'+A.escHtml(dL)+'" onfocus="Agora.openCombo(this)" onkeyup="Agora.filterCombo(this)" onclick="this.select()">';
  h+='<div class="combo-dropdown">';
  opts.forEach(function(o){
    if(o.isGroup) h+='<div class="combo-group">'+A.escHtml(o.label)+'</div>';
    else h+='<div class="combo-option'+(o.value==defVal?' selected':'')+'" data-val="'+A.escHtml(o.value)+'" onclick="Agora.selectCombo(this)">'+A.escHtml(o.label)+'</div>';
  });
  h+='</div></div>'; return h;
};
A.openCombo=function(inp){
  document.querySelectorAll('.agora-combo.open').forEach(function(c){if(c!==inp.parentNode)c.classList.remove('open');});
  inp.parentNode.classList.add('open'); inp.select(); 
  inp.parentNode.querySelectorAll('.combo-option').forEach(function(o){o.style.display='block';});
};
A.filterCombo=function(inp){
  var q=inp.value.toLowerCase(),opts=inp.parentNode.querySelectorAll('.combo-option');
  opts.forEach(function(o){o.style.display=o.textContent.toLowerCase().indexOf(q)!==-1?'block':'none';});
};
A.selectCombo=function(opt){
  var c=opt.parentNode.parentNode, v=opt.getAttribute('data-val'), l=opt.textContent;
  c.querySelector('input[type="hidden"]').value=v; c.querySelector('.combo-input').value=l;
  c.classList.remove('open');
  var onc=c.getAttribute('data-onchange');
  if(onc){
    // Simulate passing 'this' (the hidden input) to the handler
    var fn = new Function('el', 'var window=undefined; var elVal=el.value; '+onc.replace(/this\.value/g, 'elVal').replace(/this/g, 'el'));
    fn(c.querySelector('input[type="hidden"]'));
  }
};
document.addEventListener('click',function(e){
  if(!e.target.closest('.agora-combo')){
    document.querySelectorAll('.agora-combo.open').forEach(function(c){
      c.classList.remove('open');
      var h=c.querySelector('input[type="hidden"]').value, m=c.querySelector('.combo-option[data-val="'+A.escHtml(h)+'"]');
      if(m) c.querySelector('.combo-input').value=m.textContent;
    });
  }
});

// Panel Tab helper
A.switchTab=function(id){
  document.querySelectorAll('.panel-tab-btn').forEach(function(b){b.classList.remove('active');});
  document.querySelector('.panel-tab-btn[data-target="'+id+'"]').classList.add('active');
  document.getElementById('tab-items').style.display = id==='tab-items'?'block':'none';
  document.getElementById('tab-conns').style.display = id==='tab-conns'?'block':'none';
};

A.openPanel=function(nid){
  var n=A.findNode(nid);if(!n)return;
  A._editingPanelNode=nid;
  var p=document.getElementById('edit-panel');
  document.getElementById('panel-title-text').textContent=n.title;
  // Update header action buttons dynamically to target this node
  var btnDup = document.getElementById('panel-btn-duplicate');
  var btnDel = document.getElementById('panel-btn-delete');
  if(btnDup) btnDup.onclick = function(){ A.duplicateNode(nid); A.closePanel(); };
  if(btnDel) btnDel.onclick = function(){ A.confirmDeleteNode(nid); A.closePanel(); };
  
  var b=document.getElementById('panel-body');
  var h='';

  // Name
  h+='<div class="form-group"><label class="form-label">Nom de la table</label>';
  h+='<input class="form-input" id="pn-title" value="'+A.escHtml(n.title)+'" onblur="Agora.panelSaveProp()"></div>';

  // Description
  h+='<div class="form-group"><label class="form-label">Description</label>';
  h+='<input class="form-input" id="pn-desc" value="'+A.escHtml(n.desc||'')+'" placeholder="Notes privées (éditeurs)" onblur="Agora.panelSaveProp()"></div>';

  // Category (Searchable Combo)
  h+='<div class="form-group"><label class="form-label">Catégorie</label>';
  var catOpts=[{value:'',label:'— Aucune —'}];
  (A.data.canvas_state.legend||[]).forEach(function(l){catOpts.push({value:l.label,label:l.label});});
  h+=A.renderCombo('pn-cat',catOpts,n.category,'Rechercher une catégorie...','Agora.panelSaveProp()');
  h+='</div>';

  // Page (Searchable Combo)
  h+='<div class="form-group"><label class="form-label">Page (Vue)</label>';
  var islOpts=[{value:'',label:'— Aucune —'}];
  (A.data.core_architecture.pages||[]).forEach(function(isl){islOpts.push({value:isl.id,label:isl.title});});
  h+=A.renderCombo('pn-page',islOpts,n.page,'Rechercher une page...','Agora.panelSaveProp()');
  h+='</div>';

  // Tabs Header
  var connCt=A.data.core_architecture.edges.filter(function(e){return e.from===nid;}).length;
  h+='<div style="display:flex;gap:6px;margin:20px 0 14px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:10px;">';
  h+='<button class="btn btn-ghost panel-tab-btn active" data-target="tab-items" onclick="Agora.switchTab(\'tab-items\')">Éléments ('+n.items.length+')</button>';
  h+='<button class="btn btn-ghost panel-tab-btn" data-target="tab-conns" onclick="Agora.switchTab(\'tab-conns\')">Connexions ('+connCt+')</button>';
  h+='</div>';

  // --- TAB: ITEMS ---
  h+='<div id="tab-items" style="display:block;">';
    // Add item form (at top)
    h+='<div class="pi-add" style="margin-bottom:16px;">';
    var typeOpts=[{value:'h3',label:'[h3] En-tête de section'}];
    (A.data.core_architecture.itemTypes||[]).forEach(function(cat){
      typeOpts.push({isGroup:true,label:cat.category});
      (cat.items||[]).forEach(function(item){typeOpts.push({value:item.tag,label:item.tag+' — '+item.label});});
    });
    h+=A.renderCombo('pn-add-type',typeOpts,'h3','Type d\'élément...');
    h+='<div style="display:flex;gap:6px;margin-top:6px;"><input class="form-input" id="pn-add-name" placeholder="Nom de la donnée..." onkeydown="if(event.key===\'Enter\')Agora.panelAddItem()">';
    h+='<button class="btn btn-primary" onclick="Agora.panelAddItem()">＋</button></div></div>';
    
    // Items list (Draggable)
    h+='<div class="panel-items" id="sortable-items">';
    n.items.forEach(function(item,i){
      h+='<div class="pi-row" draggable="true" ondragstart="Agora.itemDragStart(event,'+i+')" ondragover="event.preventDefault()" ondrop="Agora.itemDrop(event,'+i+')">';
      h+='<div style="cursor:grab;color:#64748B;padding:0 4px;font-size:16px;">≡</div>';
      h+='<span class="pi-tag" style="background:'+(item.t==='h3'?'#475569':A.getItemColor(item.t))+';">'+A.escHtml(item.t)+'</span>';
      h+='<input class="pi-name" value="'+A.escHtml(item.n)+'" data-idx="'+i+'" onblur="Agora.panelSaveItem('+i+')">';
      h+='<div class="pi-btns">';
      if(item.t!=='h3'){
        h+='<button class="pi-btn" onclick="Agora.openVisibilityPopup(event,'+i+')" title="Visibilité par mode" style="font-size:11px;opacity:0.6;">👁</button>';
      }
      h+='<button class="pi-btn pi-btn-del" onclick="Agora.panelDelItem('+i+')" title="Supprimer">✕</button>';
      h+='</div></div>';
    });
    h+='</div>';
  h+='</div>';

  // --- TAB: CONNECTIONS ---
  h+='<div id="tab-conns" style="display:none;">';
    // Add connection form (at top)
    h+='<div class="pi-add" style="margin-bottom:16px;">';
    var srcOpts=[];
    n.items.forEach(function(it,ii){if(it.t!=='h3')srcOpts.push({value:it.itemId,label:it.t+' '+it.n});});
    if(srcOpts.length===0) srcOpts=[{value:'',label:'Aucun élément source'}];
    h+=A.renderCombo('pn-conn-src',srcOpts,srcOpts[0].value,'Élément source...');
    h+='<div style="text-align:center;color:#64748B;font-size:12px;margin:4px 0;">↓</div>';
    var tgtOpts=[];
    A.data.core_architecture.nodes.forEach(function(nd){tgtOpts.push({value:nd.id,label:nd.title});});
    h+=A.renderCombo('pn-conn-tgt',tgtOpts,'','Table cible...');
    
    var typeOpts=[{value:'',label:'— Aucun type —'}];
    (A.data.core_architecture.relationTypes||[]).forEach(function(rt){
      typeOpts.push({value:rt.type, label: rt.type + ' — ' + rt.label});
    });
    
    h+=A.renderCombo('pn-conn-type',typeOpts,'','Type (optionnel)...');
    h+='<button class="btn btn-primary" style="width:100%;margin-top:8px;" onclick="Agora.panelAddEdge()">＋ Lier</button>';
    h+='</div>';

    // Connections list
    var hasConn=false;
    A.data.core_architecture.edges.forEach(function(e,ei){
      if(e.from!==nid)return;hasConn=true;
      h+='<div class="conn-row" onmouseenter="Agora.hoverEdge('+ei+')" onmouseleave="Agora.unhoverEdge()" style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">';
      h+=A.renderCombo('edge_src_'+ei,srcOpts,e.fIdx,'Source','Agora.panelEditEdgeSrc('+ei+',this.value)');
      h+='<div style="color:#64748B;font-size:12px;font-weight:bold;">→</div>';
      h+=A.renderCombo('edge_tgt_'+ei,tgtOpts,e.to,'Cible','Agora.panelEditEdgeTgt('+ei+',this.value)');
      h+=A.renderCombo('edge_type_'+ei,typeOpts,e.type||'','Type','Agora.panelEditEdgeType('+ei+',this.value)');
      h+='<button class="btn btn-danger btn-sm" style="padding:4px 8px;" onclick="Agora.panelDelEdge('+ei+')" title="Supprimer le lien">✕</button>';
      h+='</div>';
    });
    if(!hasConn)h+='<div style="color:#64748B;font-size:11px;padding:6px 0;text-align:center;">Aucune connexion sortante</div>';
  h+='</div>';

  // --- ADVANCED METADATA (collapsible) ---
  h+='<div style="margin-top:20px;border-top:1px solid rgba(255,255,255,0.06);padding-top:14px;">';
  h+='<button class="btn btn-ghost" style="width:100%;text-align:left;font-size:12px;color:#94A3B8;" onclick="Agora.toggleAdvMeta()" id="adv-meta-toggle">▶ Métadonnées avancées</button>';
  h+='<div id="adv-meta-body" style="display:none;margin-top:10px;">';

  // Modes supportés (multi-select checkboxes)
  var curModes=n.modes||[];
  h+='<div class="form-group"><label class="form-label">Modes supportés</label>';
  h+='<div style="display:flex;gap:12px;">';
  h+='<label style="display:flex;align-items:center;gap:4px;color:#CBD5E1;font-size:12px;cursor:pointer;">';
  h+='<input type="checkbox" id="pn-mode-view" '+(curModes.indexOf('view')!==-1?'checked':'')+' onchange="Agora.panelSaveModes()"> view</label>';
  h+='<label style="display:flex;align-items:center;gap:4px;color:#CBD5E1;font-size:12px;cursor:pointer;">';
  h+='<input type="checkbox" id="pn-mode-edit" '+(curModes.indexOf('edit')!==-1?'checked':'')+' onchange="Agora.panelSaveModes()"> edit</label>';
  h+='</div></div>';

  // Default mode
  var defMode=n.default_mode||'';
  h+='<div class="form-group"><label class="form-label">Mode par défaut</label>';
  h+='<select class="form-input" id="pn-default-mode" onchange="Agora.panelSaveDefaultMode()" '+(curModes.length===0?'disabled':'')+' style="font-size:12px;">';
  h+='<option value="">— Aucun —</option>';
  if(curModes.indexOf('view')!==-1) h+='<option value="view"'+(defMode==='view'?' selected':'')+'>view</option>';
  if(curModes.indexOf('edit')!==-1) h+='<option value="edit"'+(defMode==='edit'?' selected':'')+'>edit</option>';
  h+='</select></div>';

  // Section role
  var secRole=n.section_role||'';
  h+='<div class="form-group"><label class="form-label">Rôle de section</label>';
  h+='<select class="form-input" id="pn-section-role" onchange="Agora.panelSaveSectionRole()" style="font-size:12px;">';
  h+='<option value="">— Aucun —</option>';
  h+='<option value="conversion"'+(secRole==='conversion'?' selected':'')+'>Conversion</option>';
  h+='<option value="content"'+(secRole==='content'?' selected':'')+'>Contenu</option>';
  h+='<option value="identity"'+(secRole==='identity'?' selected':'')+'>Identité</option>';
  h+='</select></div>';

  h+='</div></div>';

  b.innerHTML=h;
  p.classList.add('open');
  if(A.applyGhostMode) A.applyGhostMode(nid);
};

A.closePanel=function(){
  document.getElementById('edit-panel').classList.remove('open');
  A._editingPanelNode=null;
  if(A.clearGhostMode) A.clearGhostMode();
};

// ══ ADVANCED METADATA HANDLERS ══
A.toggleAdvMeta=function(){
  var body=document.getElementById('adv-meta-body');
  var btn=document.getElementById('adv-meta-toggle');
  if(body.style.display==='none'){body.style.display='block';btn.textContent='▼ Métadonnées avancées';}
  else{body.style.display='none';btn.textContent='▶ Métadonnées avancées';}
};

A.panelSaveModes=function(){
  var n=A.findNode(A._editingPanelNode);if(!n)return;
  var modes=[];
  if(document.getElementById('pn-mode-view').checked)modes.push('view');
  if(document.getElementById('pn-mode-edit').checked)modes.push('edit');
  if(modes.length>0){n.modes=modes;}else{delete n.modes;delete n.default_mode;}
  // Update default_mode select
  var sel=document.getElementById('pn-default-mode');
  sel.disabled=modes.length===0;
  sel.innerHTML='<option value="">— Aucun —</option>';
  modes.forEach(function(m){sel.innerHTML+='<option value="'+m+'">'+m+'</option>';});
  if(n.default_mode&&modes.indexOf(n.default_mode)!==-1){sel.value=n.default_mode;}
  else{delete n.default_mode;sel.value='';}
  A.save();
};

A.panelSaveDefaultMode=function(){
  var n=A.findNode(A._editingPanelNode);if(!n)return;
  var v=document.getElementById('pn-default-mode').value;
  if(v){n.default_mode=v;}else{delete n.default_mode;}
  A.save();
};

A.panelSaveSectionRole=function(){
  var n=A.findNode(A._editingPanelNode);if(!n)return;
  var v=document.getElementById('pn-section-role').value;
  if(v){n.section_role=v;}else{delete n.section_role;}
  A.save();
};

// ══ ITEM VISIBILITY POPUP ══
A.openVisibilityPopup=function(evt,idx){
  evt.stopPropagation();
  // Close any existing popup
  var old=document.getElementById('vis-popup');if(old)old.remove();

  var n=A.findNode(A._editingPanelNode);if(!n||!n.items[idx])return;
  var item=n.items[idx];
  var vim=item.visible_in_modes;
  var viewChecked=!vim||vim.indexOf('view')!==-1;
  var editChecked=!vim||vim.indexOf('edit')!==-1;

  var pop=document.createElement('div');
  pop.id='vis-popup';
  pop.style.cssText='position:absolute;z-index:9999;background:#1E293B;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 14px;box-shadow:0 4px 12px rgba(0,0,0,0.4);font-size:12px;color:#CBD5E1;';
  pop.innerHTML='<div style="font-weight:600;margin-bottom:8px;color:#F1F5F9;">Visible en mode</div>'
    +'<label style="display:flex;align-items:center;gap:6px;margin-bottom:4px;cursor:pointer;">'
    +'<input type="checkbox" data-mode="view" '+(viewChecked?'checked':'')+' onchange="Agora.saveVisibility('+idx+')"> view</label>'
    +'<label style="display:flex;align-items:center;gap:6px;cursor:pointer;">'
    +'<input type="checkbox" data-mode="edit" '+(editChecked?'checked':'')+' onchange="Agora.saveVisibility('+idx+')"> edit</label>';

  // Position near the button
  var btn=evt.currentTarget;
  var rect=btn.getBoundingClientRect();
  var panel=document.getElementById('edit-panel');
  var panelRect=panel.getBoundingClientRect();
  pop.style.top=(rect.bottom-panelRect.top+panel.scrollTop+4)+'px';
  pop.style.right='20px';

  // Append inside panel body for positioning
  var body=document.getElementById('panel-body');
  body.style.position='relative';
  body.appendChild(pop);

  // Close on outside click
  setTimeout(function(){
    document.addEventListener('click',function closer(e2){
      if(!pop.contains(e2.target)){pop.remove();document.removeEventListener('click',closer);}
    });
  },0);
};

A.saveVisibility=function(idx){
  var n=A.findNode(A._editingPanelNode);if(!n||!n.items[idx])return;
  var pop=document.getElementById('vis-popup');if(!pop)return;
  var checks=pop.querySelectorAll('input[type="checkbox"]');
  var modes=[];
  checks.forEach(function(c){if(c.checked)modes.push(c.getAttribute('data-mode'));});
  // If both checked (or none — treat as "all"), remove the field
  if(modes.length===2||modes.length===0){delete n.items[idx].visible_in_modes;}
  else{n.items[idx].visible_in_modes=modes;}
  A.save();
};

A.hoverEdge = function(ei){
  if(A.applyEdgeGhostMode) A.applyEdgeGhostMode(ei);
};
A.unhoverEdge = function(){
  if(A.clearGhostMode) A.clearGhostMode();
  if(A._editingPanelNode && A.applyGhostMode) A.applyGhostMode(A._editingPanelNode);
};

// Panel actions
A.panelSaveProp=function(){
  var nid=A._editingPanelNode,n=A.findNode(nid);if(!n)return;
  var title=document.getElementById('pn-title').value.trim();
  var desc=document.getElementById('pn-desc').value.trim();
  var cat=document.getElementById('pn-cat').value;
  var page=document.getElementById('pn-page').value;
  if(title)n.title=title;
  n.desc=desc;
  n.category=cat||'';
  n.page=page||'';
  // Auto-set color from category
  if(cat){var lg=A.data.canvas_state.legend.find(function(l){return l.label===cat;});if(lg && A.data.canvas_state.nodeStates[nid]) A.data.canvas_state.nodeStates[nid].color=lg.color;}
  A.save();A.render();
  document.getElementById('panel-title-text').textContent=n.title;
};

// Drag & Drop for Items
A._dragItemIndex=null;
A.itemDragStart=function(e,idx){
  A._dragItemIndex=idx;
  e.dataTransfer.effectAllowed='move';
  // Optional visually adjust element being dragged
  setTimeout(function(){ e.target.style.opacity='0.4'; }, 0);
};
A.itemDrop=function(e,dropIdx){
  e.preventDefault();
  if(A._dragItemIndex===null || A._dragItemIndex===dropIdx) return;
  var nid=A._editingPanelNode, n=A.findNode(nid);if(!n)return;
  var item=n.items.splice(A._dragItemIndex,1)[0];
  n.items.splice(dropIdx,0,item);
  A._dragItemIndex=null;
  A.save();A.render();A.openPanel(nid);
};

A.panelSaveItem=function(idx){
  var n=A.findNode(A._editingPanelNode);if(!n)return;
  var input=document.querySelector('.pi-name[data-idx="'+idx+'"]');
  if(input&&input.value.trim()){n.items[idx].n=input.value.trim();A.save();A.render();}
};

A.panelDelItem=function(idx){
  A.deleteItem(A._editingPanelNode,idx);
  A.render();A.openPanel(A._editingPanelNode);
  A.toast('Item supprimé','success');
};

A.panelAddItem=function(){
  var t=document.getElementById('pn-add-type').value;
  var n=document.getElementById('pn-add-name').value.trim();
  if(!n){A.toast('Nom requis','error');return;}
  A.addItem(A._editingPanelNode,{t:t,n:n});
  A.render();A.openPanel(A._editingPanelNode);
  A.toast('Item ajouté !','success');
};

A.panelDelEdge=function(idx){
  A.deleteEdgeAt(idx);A.render();A.openPanel(A._editingPanelNode);
  A.toast('Connexion supprimée','success');
};

A.panelEditEdgeSrc=function(ei,val){
  var e=A.data.core_architecture.edges[ei];if(!e)return;
  e.sourceItemId=val;A.save();A.render();
};

A.panelEditEdgeTgt=function(ei,val){
  var e=A.data.core_architecture.edges[ei];if(!e)return;
  e.to=val;A.save();A.render();
};

A.panelEditEdgeType=function(ei,val){
  var e=A.data.core_architecture.edges[ei];if(!e)return;
  e.type=val;A.save();A.render();
};

A.panelAddEdge=function(){
  var src=document.getElementById('pn-conn-src');
  var tgt=document.getElementById('pn-conn-tgt');
  var typ=document.getElementById('pn-conn-type');
  if(!src||!tgt){A.toast('Sélectionnez source et cible','error');return;}
  var newEdge = {from:A._editingPanelNode,fIdx:parseInt(src.value),to:tgt.value};
  if(typ && typ.value) newEdge.type = typ.value;
  A.addEdge(newEdge);
  A.render();A.openPanel(A._editingPanelNode);
  A.toast('Connexion ajoutée !','success');
};

// ══ ADD TABLE (modal) ══
A.openAddTable=function(){
  document.getElementById('add-table-id').value='';
  document.getElementById('add-table-title').value='';
  var sel=document.getElementById('add-table-cat');
  sel.innerHTML='<option value="">— Aucune —</option>';
  (A.data.canvas_state.legend||[]).forEach(function(l){sel.innerHTML+='<option value="'+A.escHtml(l.label)+'">'+A.escHtml(l.label)+'</option>';});
  var isl=document.getElementById('add-table-page');
  isl.innerHTML='<option value="">— Aucun —</option>';
  (A.data.core_architecture.pages||[]).forEach(function(i){isl.innerHTML+='<option value="'+A.escHtml(i.id)+'">'+A.escHtml(i.title)+'</option>';});
  A.openModal('modal-add-table');
  setTimeout(function(){document.getElementById('add-table-id').focus();},100);
};
A.saveAddTable=function(){
  var id=document.getElementById('add-table-id').value.trim();
  var title=document.getElementById('add-table-title').value.trim();
  var cat=document.getElementById('add-table-cat').value;
  var page=document.getElementById('add-table-page').value;
  if(!id||!title){A.toast('ID et Titre requis','error');return;}
  if(A.findNode(id)){A.toast('ID déjà utilisé !','error');return;}
  var color='#3B82F6';
  if(cat){var lg=A.data.canvas_state.legend.find(function(l){return l.label===cat;});if(lg)color=lg.color;}
  var cx=100,cy=100;
  if(A.data.core_architecture.nodes.length>0){var last=A.data.core_architecture.nodes[A.data.core_architecture.nodes.length-1]; var lState = A.data.canvas_state.nodeStates[last.id] || {x:0,y:0}; cx=lState.x+A.NODE_W+40;cy=lState.y;}
  A.addNode({id:id,title:title,color:color,category:cat||'',page:page||'',x:cx,y:cy,items:[]});
  A.closeModal('modal-add-table');A.render();A.renderLegend();
  A.toast('Table ajoutée !','success');
  A.openPanel(id);
};

// ══ DUPLICATE TABLE ══
A.duplicateNode=function(nid){
  var n=A.findNode(nid);if(!n)return;
  var newId=n.id+'_copy_'+Math.floor(Math.random()*1000);
  var newTitle=n.title+' (Copie)';
  var itemsCopy=JSON.parse(JSON.stringify(n.items)); itemsCopy.forEach(function(it){ it.itemId = 'itm_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5); });
  A.addNode({id:newId,title:newTitle,color:(A.data.canvas_state.nodeStates[n.id]||{}).color,category:n.category||'',page:n.page||'',x:(A.data.canvas_state.nodeStates[n.id]||{x:0}).x+A.NODE_W+40, y:(A.data.canvas_state.nodeStates[n.id]||{y:0}).y+40,items:itemsCopy});
  A.render();A.renderPagesLegend();
  A.toast('Table dupliquée !','success');
  A.openPanel(newId);
};

// ══ DELETE TABLE ══
A.confirmDeleteNode=function(nid){
  var n=A.findNode(nid);if(!n)return;
  document.getElementById('confirm-text').textContent='Supprimer "'+n.title+'" et toutes ses connexions ?';
  pendingDel=function(){A.deleteNode(nid);A.toast('Table supprimée','success');A.closePanel();A.render();};
  A.openModal('modal-confirm');
};
A.confirmAction=function(){if(pendingDel)pendingDel();pendingDel=null;A.closeModal('modal-confirm');};

// ══ CONNECTION MODE ══
A.toggleConnectionMode=function(){if(connMode)A.cancelConnectionMode();else startConn();};

function startConn(){
  connMode=true;connSrc=null;
  document.getElementById('btn-connection').classList.add('btn-active');
  document.getElementById('connection-banner').classList.add('active');
  document.getElementById('connection-text').textContent='🔗 Cliquez sur un ITEM source dans une table';
  document.getElementById('vp').classList.add('connecting');
  document.getElementById('vp').style.top='90px';
}
function setConnSrc(nid,idx){
  connSrc={nid:nid,idx:idx};
  var n=A.findNode(nid),item=n?n.items[idx]:null;
  document.getElementById('connection-text').textContent='🔗 Source: "'+(item?item.n:'?')+'" — Cliquez sur la TABLE cible';
}
A.cancelConnectionMode=function(){
  connMode=false;connSrc=null;
  document.getElementById('btn-connection').classList.remove('btn-active');
  document.getElementById('connection-banner').classList.remove('active');
  document.getElementById('vp').classList.remove('connecting');
  document.getElementById('vp').style.top='';
};

document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    if(connMode)A.cancelConnectionMode();
    A.closePanel();
    document.querySelectorAll('.modal-overlay.open').forEach(function(m){m.classList.remove('open');});
  }
});

// ══ LEGEND EDITOR ══
A.openLegendEditor=function(){
  var b=document.getElementById('legend-editor-body');var h='';
  (A.data.canvas_state.legend||[]).forEach(function(l,i){
    h+='<div class="legend-row" data-idx="'+i+'"><input type="color" class="legend-color-pick" value="'+l.color+'" data-idx="'+i+'">';
    h+='<input class="form-input legend-label-input" value="'+A.escHtml(l.label)+'" data-idx="'+i+'">';
    h+='<button class="btn btn-danger btn-sm" onclick="Agora.removeLegendRow('+i+')">✕</button></div>';
  });b.innerHTML=h;A.openModal('modal-legend');
};
A.addLegendRow=function(){A.data.canvas_state.legend.push({label:'Nouvelle catégorie',color:'#6366F1'});A.openLegendEditor();};
A.removeLegendRow=function(i){A.data.canvas_state.legend.splice(i,1);A.openLegendEditor();};
A.saveLegend=function(){
  var rows=document.querySelectorAll('#legend-editor-body .legend-row'),legend=[];
  rows.forEach(function(r){var c=r.querySelector('.legend-color-pick').value,l=r.querySelector('.legend-label-input').value.trim();if(l)legend.push({label:l,color:c});});
  A.data.canvas_state.legend=legend;A.save();A.renderLegend();A.closeModal('modal-legend');A.toast('Légende sauvegardée !','success');
};

// ══ ITEM TYPE EDITOR (hierarchical with categories) ══
A.openItemTypeEditor=function(){
  var b=document.getElementById('itemtype-editor-body');var h='';
  (A.data.core_architecture.itemTypes||[]).forEach(function(cat,ci){
    h+='<div class="itc-group" data-cat-idx="'+ci+'">';
    // Category header
    h+='<div class="itc-header">';
    h+='<input type="color" class="itc-color" value="'+cat.color+'" data-cat-idx="'+ci+'">';
    h+='<div class="itc-header-texts">';
    h+='<input class="form-input itc-name" value="'+A.escHtml(cat.category)+'" placeholder="Nom de la catégorie" data-cat-idx="'+ci+'">';
    h+='<input class="form-input itc-desc" value="'+A.escHtml(cat.description||'')+'" placeholder="Description de la catégorie…" data-cat-idx="'+ci+'">';
    h+='</div>';
    h+='<button class="btn btn-danger btn-sm" onclick="Agora.removeItemTypeCategory('+ci+')" title="Supprimer la catégorie">✕</button>';
    h+='</div>';
    // Items in this category
    h+='<div class="itc-items">';
    (cat.items||[]).forEach(function(item,ii){
      h+='<div class="itc-item" data-cat-idx="'+ci+'" data-item-idx="'+ii+'">';
      h+='<span class="itc-item-dot" style="background:'+cat.color+';"></span>';
      h+='<input class="form-input itc-item-tag" value="'+A.escHtml(item.tag)+'" placeholder="+Tag" data-cat-idx="'+ci+'" data-item-idx="'+ii+'">';
      h+='<input class="form-input itc-item-label" value="'+A.escHtml(item.label)+'" placeholder="Label" data-cat-idx="'+ci+'" data-item-idx="'+ii+'">';
      h+='<button class="btn btn-danger btn-sm" onclick="Agora.removeItemTypeItem('+ci+','+ii+')" title="Supprimer">✕</button>';
      h+='</div>';
    });
    h+='<button class="btn btn-ghost btn-sm itc-add-item-btn" onclick="Agora.addItemToCategory('+ci+')">＋ Élément</button>';
    h+='</div>';
    h+='</div>';
  });
  b.innerHTML=h;A.openModal('modal-itemtype');
};

A.addItemTypeEditorCategory=function(){
  A.data.core_architecture.itemTypes.push({category:'Nouvelle catégorie',color:'#6366F1',description:'',items:[]});
  A.openItemTypeEditor();
};

A.removeItemTypeCategory=function(ci){
  A.data.core_architecture.itemTypes.splice(ci,1);
  A.openItemTypeEditor();
};

A.addItemToCategory=function(ci){
  if(A.data.core_architecture.itemTypes[ci]){
    A.data.core_architecture.itemTypes[ci].items.push({tag:'+New',label:'Nouveau type'});
  }
  A.openItemTypeEditor();
};

A.removeItemTypeItem=function(ci,ii){
  if(A.data.core_architecture.itemTypes[ci]){
    A.data.core_architecture.itemTypes[ci].items.splice(ii,1);
  }
  A.openItemTypeEditor();
};

A.saveItemTypes=function(){
  var groups=document.querySelectorAll('.itc-group');
  var types=[];
  groups.forEach(function(g){
    var color=g.querySelector('.itc-color').value;
    var name=g.querySelector('.itc-name').value.trim();
    var desc=g.querySelector('.itc-desc').value.trim();
    if(!name)return;
    var items=[];
    g.querySelectorAll('.itc-item').forEach(function(el){
      var tag=el.querySelector('.itc-item-tag').value.trim();
      var label=el.querySelector('.itc-item-label').value.trim();
      if(tag)items.push({tag:tag,label:label||tag});
    });
    types.push({category:name,color:color,description:desc,items:items});
  });
  A.data.core_architecture.itemTypes=types;A.save();A.renderCanvasLegend();A.render();A.closeModal('modal-itemtype');A.toast('Types sauvegardés !','success');
};

// ══ JSON EDITOR ══
A.openJSONEditor=function(){document.getElementById('json-input').value=JSON.stringify(A.data,null,2);A.openModal('modal-json');};
A.saveJSONEditor=function(){
  var ok=A.importJSON(document.getElementById('json-input').value);
  if(ok){A.closeModal('modal-json');A.toast('JSON sauvegardé !','success');A.fullRender();}
  else A.toast('Erreur JSON !','error');
};

// ══ FILE IMPORT ══
A.importFile=function(input){
  var file=input.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    var ok=A.importJSON(e.target.result);
    if(ok){A.toast('Données importées !','success');A.fullRender();}
    else A.toast('Fichier JSON invalide !','error');
  };
  reader.readAsText(file);
  input.value=''; // reset so same file can be re-imported
};

// ══ ISLAND EDITOR ══
A.openPageEditor=function(){
  var b=document.getElementById('page-editor-body');var h='';
  (A.data.core_architecture.pages||[]).forEach(function(isl,i){
    h+='<div class="legend-row" data-idx="'+i+'">';
    h+='<input type="color" class="legend-color-pick" value="'+(isl.color||'#475569')+'" data-idx="'+i+'">';
    h+='<input class="form-input legend-label-input" value="'+A.escHtml(isl.title)+'" placeholder="Nom de la page" data-idx="'+i+'">';
    h+='<button class="btn btn-danger btn-sm" onclick="Agora.removePageRow('+i+')">✕</button>';
    h+='</div>';
  });b.innerHTML=h;A.openModal('modal-pages');
};
A.addPageRow=function(){
  var id='page_'+Date.now();
  A.data.core_architecture.pages.push({id:id,title:'Nouvelle page',color:'#475569'});
  A.openPageEditor();
};
A.removePageRow=function(i){
  var isl=A.data.core_architecture.pages[i];
  if(isl){
    // Unset page ref from nodes
    A.data.core_architecture.nodes.forEach(function(n){if(n.page===isl.id)n.page='';});
  }
  A.data.core_architecture.pages.splice(i,1);
  A.openPageEditor();
};
A.savePages=function(){
  var rows=document.querySelectorAll('#page-editor-body .legend-row');
  var pages=[];
  rows.forEach(function(r,i){
    var c=r.querySelector('.legend-color-pick').value;
    var l=r.querySelector('.legend-label-input').value.trim();
    if(!l)return;
    // Preserve existing id or generate new one
    var existingId=(A.data.core_architecture.pages[i]&&A.data.core_architecture.pages[i].id)||('page_'+Date.now()+'_'+i);
    pages.push({id:existingId,title:l,color:c});
  });
  A.data.core_architecture.pages=pages;A.save();A.render();A.renderPagesLegend();A.closeModal('modal-pages');A.toast('Pages sauvegardées !','success');
};

// ══ HELP ══
A.openHelp=function(){A.openModal('modal-help');};

// ══ FULL RENDER ══
A.fullRender=function(){A.render();A.renderLegend();A.renderPagesLegend();A.renderCanvasLegend();A.initGhostMode();A.initDrag();A.initCanvasActions();};

document.addEventListener('click',function(e){if(e.target.classList.contains('modal-overlay'))e.target.classList.remove('open');});
})();
