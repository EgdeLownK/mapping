const fs = require('fs');
const path = require('path');

const files = {
  data: path.join(__dirname, 'js', 'data.js'),
  editor: path.join(__dirname, 'js', 'editor.js'),
  drag: path.join(__dirname, 'js', 'drag.js'),
  renderer: path.join(__dirname, 'js', 'renderer.js')
};

let conflicts = false;

// 1. REFACTOR DATA.JS
let dataJs = fs.readFileSync(files.data, 'utf8');

// The migration logic function
const migrationCode = `
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
`;

// Insert migration logic before the init block
dataJs = dataJs.replace("var saved=localStorage.getItem('agora-map-data');", migrationCode + "\nvar saved=localStorage.getItem('agora-map-data');");

// Update init block
dataJs = dataJs.replace(
  /var saved=localStorage\.getItem\('agora-map-data'\);\s*try\{\s*A\.data=saved\?JSON\.parse\(saved\):JSON\.parse\(JSON\.stringify\(DEFAULT_DATA\)\);\s*if\(!A\.data\.legend\) A\.data\.legend=\[\];\s*if\(!A\.data\.pages\) A\.data\.pages=\[\];\s*\/\/ Migrate itemTypes to new grouped format\s*A\.data\.itemTypes=migrateItemTypes\(A\.data\.itemTypes\);\s*\/\/ Migrate edges: remove tIdx\s*if\(A\.data\.edges\) A\.data\.edges\.forEach\(function\(e\)\{delete e\.tIdx;\}\);\s*\}catch\(e\)\{A\.data=JSON\.parse\(JSON\.stringify\(DEFAULT_DATA\)\);\}/,
  `var saved=localStorage.getItem('agora-map-data');
try{
  var parsed = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_DATA));
  A.data = performMigration(parsed);
  A.data.core_architecture.itemTypes=migrateItemTypes(A.data.core_architecture.itemTypes);
}catch(e){
  A.data=performMigration(JSON.parse(JSON.stringify(DEFAULT_DATA)));
  A.data.core_architecture.itemTypes=migrateItemTypes(A.data.core_architecture.itemTypes);
}`
);

// Accessors replacements in data.js
dataJs = dataJs.replace(/A\.data\.nodes/g, 'A.data.core_architecture.nodes');
dataJs = dataJs.replace(/A\.data\.pages/g, 'A.data.core_architecture.pages');
dataJs = dataJs.replace(/A\.data\.edges/g, 'A.data.core_architecture.edges');
dataJs = dataJs.replace(/A\.data\.itemTypes/g, 'A.data.core_architecture.itemTypes');
dataJs = dataJs.replace(/A\.data\.relationTypes/g, 'A.data.core_architecture.relationTypes');
// A.data.legend appears manually
dataJs = dataJs.replace(/A\.data\.legend/g, 'A.data.canvas_state.legend');

// For A.data.canvas_state.nodeStates -> color
dataJs = dataJs.replace(
  "A.addNode=function(n){A.data.core_architecture.nodes.push(n);A.save();};",
  "A.addNode=function(n){A.data.core_architecture.nodes.push(n); A.data.canvas_state.nodeStates[n.id] = {x: n.x||0, y: n.y||0, color: n.color||'#3B82F6'}; delete n.x; delete n.y; delete n.color; A.save();};"
);

// We need to inject itemId generation in A.addItem
dataJs = dataJs.replace(
  "A.addItem=function(nid,item){var n=A.findNode(nid);if(n)n.items.push(item);A.save();};",
  "A.addItem=function(nid,item){var n=A.findNode(nid);if(n){ item.itemId = item.itemId || generateItemId(); n.items.push(item); } A.save();};"
);

// In moveItem, we no longer need edge index adjustments!
dataJs = dataJs.replace(
  /A\.moveItem=function\(nid,from,to\)\{[\s\S]*?A\.save\(\);\s*\};/,
  `A.moveItem=function(nid,from,to){
  var n=A.findNode(nid);if(!n||to<0||to>=n.items.length)return;
  var item=n.items.splice(from,1)[0];n.items.splice(to,0,item);
  A.save();
};`
);

// In deleteItem, we need to clean up edges that relate to that specific itemId!
dataJs = dataJs.replace(
  /A\.deleteItem=function\(nid,idx\)\{[\s\S]*?A\.save\(\);\s*\};/,
  `A.deleteItem=function(nid,idx){
  var n=A.findNode(nid);if(!n || !n.items[idx])return;
  var deletedItemId = n.items[idx].itemId;
  n.items.splice(idx,1);
  A.data.core_architecture.edges=A.data.core_architecture.edges.filter(function(e){return !(e.from===nid && e.sourceItemId===deletedItemId);});
  A.save();
};`
);

// In deleteNode
dataJs = dataJs.replace(
  "A.deleteNode=function(id){A.data.core_architecture.nodes=A.data.core_architecture.nodes.filter(function(x){return x.id!==id});A.data.core_architecture.edges=A.data.core_architecture.edges.filter(function(e){return e.from!==id&&e.to!==id});A.save();};",
  "A.deleteNode=function(id){A.data.core_architecture.nodes=A.data.core_architecture.nodes.filter(function(x){return x.id!==id});A.data.core_architecture.edges=A.data.core_architecture.edges.filter(function(e){return e.from!==id&&e.to!==id}); delete A.data.canvas_state.nodeStates[id]; A.save();};"
);

// In addEdge, replace duplicate check with sourceItemId
dataJs = dataJs.replace(
  "var exists=A.data.core_architecture.edges.some(function(x){return x.from===e.from&&x.fIdx===e.fIdx&&x.to===e.to;});",
  "var exists=A.data.core_architecture.edges.some(function(x){return x.from===e.from&&x.sourceItemId===e.sourceItemId&&x.to===e.to;});"
);

fs.writeFileSync(files.data, dataJs, 'utf8');

// 2. REFACTOR DRAG.JS
let dragJs = fs.readFileSync(files.drag, 'utf8');
dragJs = dragJs.replace(/snx=n\.x;sny=n\.y;/, "var state = A.data.canvas_state.nodeStates[nid] || {x:0, y:0}; snx=state.x;sny=state.y;");
dragJs = dragJs.replace(/n\.x=Math\.round\(\(snx\+dx\)\/10\)\*10;/g, "var state = A.data.canvas_state.nodeStates[A._draggingNode] || {x:0,y:0}; state.x=Math.round((snx+dx)/10)*10;");
dragJs = dragJs.replace(/n\.y=Math\.round\(\(sny\+dy\)\/10\)\*10;/g, "state.y=Math.round((sny+dy)/10)*10;");
fs.writeFileSync(files.drag, dragJs, 'utf8');

// 3. REFACTOR EDITOR.JS
let editorJs = fs.readFileSync(files.editor, 'utf8');
editorJs = editorJs.replace(/A\.data\.nodes/g, 'A.data.core_architecture.nodes');
editorJs = editorJs.replace(/A\.data\.pages/g, 'A.data.core_architecture.pages');
editorJs = editorJs.replace(/A\.data\.edges/g, 'A.data.core_architecture.edges');
editorJs = editorJs.replace(/A\.data\.itemTypes/g, 'A.data.core_architecture.itemTypes');
editorJs = editorJs.replace(/A\.data\.relationTypes/g, 'A.data.core_architecture.relationTypes');
editorJs = editorJs.replace(/A\.data\.legend/g, 'A.data.canvas_state.legend');

// Fix node creation coordinates + states
editorJs = editorJs.replace(/var last=A\.data\.core_architecture\.nodes\[A\.data\.core_architecture\.nodes\.length-1\];cx=last\.x\+A\.NODE_W\+40;cy=last\.y;/g, 
  "var last=A.data.core_architecture.nodes[A.data.core_architecture.nodes.length-1]; var lState = A.data.canvas_state.nodeStates[last.id] || {x:0,y:0}; cx=lState.x+A.NODE_W+40;cy=lState.y;"
);
editorJs = editorJs.replace(/x:n\.x\+A\.NODE_W\+40,y:n\.y\+40/g, 
  "x:(A.data.canvas_state.nodeStates[n.id]||{x:0}).x+A.NODE_W+40, y:(A.data.canvas_state.nodeStates[n.id]||{y:0}).y+40"
);

// Ensure new ids get itemIds when cloned
editorJs = editorJs.replace(/var itemsCopy=JSON\.parse\(JSON\.stringify\(n\.items\)\);/g, 
  "var itemsCopy=JSON.parse(JSON.stringify(n.items)); itemsCopy.forEach(function(it){ it.itemId = 'itm_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5); });"
);

editorJs = editorJs.replace(/var ok=A\.addEdge\(\{from:connSrc\.nid,fIdx:connSrc\.idx,to:nid\}\);/g, 
  "var _sNode=A.findNode(connSrc.nid); var ok=A.addEdge({from:connSrc.nid,sourceItemId:_sNode.items[connSrc.idx].itemId,to:nid});"
);

editorJs = editorJs.replace(/var newEdge=\{from:A\._editingPanelNode,fIdx:parseInt\(src\.value\),to:tgt\.value\};/g, 
  "var newEdge={from:A._editingPanelNode,sourceItemId:src.value,to:tgt.value};"
);

editorJs = editorJs.replace(/e\.fIdx=parseInt\(val\);/g, "e.sourceItemId=val;");

editorJs = editorJs.replace(/srcOpts\.push\(\{value:ii,label:it\.t\+' '\+it\.n\}\);/g, 
  "srcOpts.push({value:it.itemId,label:it.t+' '+it.n});"
);
editorJs = editorJs.replace(/A\.renderCombo\('edge_src_'\+ei,srcOpts,e\.fIdx,'Source','Agora\.panelEditEdgeSrc\('\+ei\+',this\.value'\)'\)/g, 
  "A.renderCombo('edge_src_'+ei,srcOpts,e.sourceItemId,'Source','Agora.panelEditEdgeSrc('+ei+',this.value)')"
);

editorJs = editorJs.replace(/if\(lg\)n\.color=lg\.color;/g, "if(lg && A.data.canvas_state.nodeStates[nid]) A.data.canvas_state.nodeStates[nid].color=lg.color;");
editorJs = editorJs.replace(/color:n\.color/g, "color:(A.data.canvas_state.nodeStates[n.id]||{}).color");

fs.writeFileSync(files.editor, editorJs, 'utf8');

// 4. REFACTOR RENDERER.JS
let rendererJs = fs.readFileSync(files.renderer, 'utf8');
rendererJs = rendererJs.replace(/A\.data\.nodes/g, 'A.data.core_architecture.nodes');
rendererJs = rendererJs.replace(/A\.data\.pages/g, 'A.data.core_architecture.pages');
rendererJs = rendererJs.replace(/A\.data\.edges/g, 'A.data.core_architecture.edges');
rendererJs = rendererJs.replace(/A\.data\.itemTypes/g, 'A.data.core_architecture.itemTypes');
rendererJs = rendererJs.replace(/A\.data\.relationTypes/g, 'A.data.core_architecture.relationTypes');
rendererJs = rendererJs.replace(/A\.data\.legend/g, 'A.data.canvas_state.legend');

// Re-map n.x / n.y / n.color using state in the renderer calculations
rendererJs = rendererJs.replace(/var fIdx=e\.fIdx;/g, "var fIdx = Math.max(0, n1.items.findIndex(function(it){ return it.itemId === e.sourceItemId; }));");

// We need to inject state logic in loop where n is iterated, specifically in computeEdgePath
rendererJs = rendererJs.replace(/var y1=n1\.y\+H\+yOffset\+\(currentItemHeight\/2\);/, 
  "var n1State = A.data.canvas_state.nodeStates[n1.id] || {x:0, y:0}; var y1=n1State.y+H+yOffset+(currentItemHeight/2);"
);
rendererJs = rendererJs.replace(/var srcRight=n1\.x\+W,srcLeft=n1\.x;/, 
  "var n1State = A.data.canvas_state.nodeStates[n1.id] || {x:0, y:0}; var srcRight=n1State.x+W,srcLeft=n1State.x;"
);
rendererJs = rendererJs.replace(/tx=n2\.x;ty=n2\.y;tw=W;th=H;/, 
  "var n2State = A.data.canvas_state.nodeStates[n2.id] || {x:0, y:0}; tx=n2State.x;ty=n2State.y;tw=W;th=H;"
);
rendererJs = rendererJs.replace(
  /var x=n1\.x\+W;\n\s*return'M'\+x\+','\+y1\+' C'\+\(x\+55\)\+','\+y1\+' '\+\(x\+55\)\+','\+y2\+' '\+x\+','\+y2;/,
  "var x=n1State.x+W;\n    return'M'+x+','+y1+' C'+(x+55)+','+y1+' '+(x+55)+','+y2+' '+x+','+y2;"
);

rendererJs = rendererJs.replace(
  /members\.forEach\(function\(n\)\{\s*var nh=A\.getNodeHeight\(n, H, IH\);\s*if\(n\.x<minX\)minX=n\.x;if\(n\.y<minY\)minY=n\.y;\s*if\(n\.x\+W>maxX\)maxX=n\.x\+W;if\(n\.y\+nh>maxY\)maxY=n\.y\+nh;\s*\}\);/g,
  `members.forEach(function(n){
      var nState = A.data.canvas_state.nodeStates[n.id] || {x:0, y:0};
      var nh=A.getNodeHeight(n, H, IH);
      if(nState.x<minX)minX=nState.x;if(nState.y<minY)minY=nState.y;
      if(nState.x+W>maxX)maxX=nState.x+W;if(nState.y+nh>maxY)maxY=nState.y+nh;
    });`
);

// Nodes rendering loop (note \n spacing must be careful)
rendererJs = rendererJs.replace(
  /d\.core_architecture\.nodes\.forEach\(function\(n\)\{([\s\S]*?)var h=A\.getNodeHeight\(n, H, IH\);/g,
  "d.core_architecture.nodes.forEach(function(n){ var nState = A.data.canvas_state.nodeStates[n.id] || {x:0, y:0, color:'#3B82F6'}; \n    var h=A.getNodeHeight(n, H, IH);"
);

// We made a naive replace for n.x -> nState.x earlier, let's fix it by reverting and replacing properly.
// Wait! rendererJs already got rewritten once, so let me read from original or just be careful?
// Ah! `readFileSync` reads the CURRENT file! So I need to be careful if I run it twice. The files HAVE NOT BEEN OVERWRITTEN YET, because the node script threw an error *before* writing the first time? No wait, Node writes sequentially! `fs.writeFileSync(files.data, dataJs)` might have fired BEFORE the syntax error!
