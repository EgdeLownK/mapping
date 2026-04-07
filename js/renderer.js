(function(){
var A=window.Agora=window.Agora||{};

A.wrapText=function(text, maxChars){
  if(!text) return [""];
  var words = text.split(" ");
  var lines = [];
  var currentLine = words[0] || "";
  for(var i=1; i<words.length; i++){
    var word = words[i];
    if(currentLine.length + word.length + 1 <= maxChars) currentLine += " " + word;
    else { lines.push(currentLine); currentLine = word; }
  }
  if(currentLine) lines.push(currentLine);
  if(lines.length === 0) lines.push("");
  return lines;
};

A.getItemHeight=function(item, IH){
  if(item.t === 'h3') return IH;
  var lines = A.wrapText(item.n, 34);
  return IH + (Math.max(0, lines.length - 1) * 14);
};

A.getNodeHeight=function(n, H, IH){
  var h = H + 12;
  (n.items || []).forEach(function(item) { h += A.getItemHeight(item, IH); });
  return h;
};

A.computeEdgePath=function(e){
  var n1=A.findNode(e.from), n2=A.findNode(e.to); 
  if(!n1||!n2)return null;
  
  var W=A.NODE_W, H=A.HEADER_H, IH=A.ITEM_H;
  var st1 = A.getState(n1.id);
  var st2 = A.getState(n2.id);

  // Source computation
  var fIdx = Math.max(0, n1.items.findIndex(function(it){ return it.itemId === e.sourceItemId; }));
  
  var yOffset = 0;
  for(var i=0; i<fIdx; i++){ yOffset += A.getItemHeight(n1.items[i], IH); }
  var currentItemHeight = A.getItemHeight(n1.items[fIdx], IH);
  var y1 = st1.y + H + yOffset + (currentItemHeight/2);

  // Target computation
  var tx, ty, tw, th;
  var samePage = n1.page === n2.page && !!n1.page;
  var n2Page = (n2.page && !samePage) ? A.findPage(n2.page) : null;
  
  if(n2Page){
    var members=A.data.core_architecture.nodes.filter(function(n){return n.page===n2Page.id;});
    var PAD=24,TOP=36;
    var minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
    members.forEach(function(n){
      var nSt = A.getState(n.id);
      var nh=A.getNodeHeight(n, H, IH);
      if(nSt.x<minX) minX=nSt.x;
      if(nSt.y<minY) minY=nSt.y;
      if(nSt.x+W>maxX) maxX=nSt.x+W;
      if(nSt.y+nh>maxY) maxY=nSt.y+nh;
    });
    tx=minX-PAD; ty=minY-TOP; tw=maxX-minX+2*PAD; th=maxY-minY+TOP+PAD;
  } else {
    tx=st2.x; ty=st2.y; tw=W; th=H;
  }

  var y2 = n2Page ? ty + 16 : ty + th/2; 

  // Self-loop
  if(n1.id===n2.id && !n2Page){
    var x = st1.x + W;
    return 'M' + x + ',' + y1 + ' C' + (x+55) + ',' + y1 + ' ' + (x+55) + ',' + y2 + ' ' + x + ',' + y2;
  }

  var srcRight = st1.x + W, srcLeft = st1.x;
  var tgtCx = tx + tw/2;
  var x1 = (tgtCx >= st1.x + W/2) ? srcRight : srcLeft;
  var x2 = (Math.abs(x1 - tx) < Math.abs(x1 - (tx + tw))) ? tx : (tx + tw);
  var cx = Math.max(Math.abs(x2 - x1) * 0.4, 40);
  var cp1x = (x1 === srcRight) ? x1 + cx : x1 - cx;
  var cp2x = (x2 === tx) ? x2 - cx : x2 + cx;

  return 'M' + x1 + ',' + y1 + ' C' + cp1x + ',' + y1 + ' ' + cp2x + ',' + y2 + ' ' + x2 + ',' + y2;
};

A.render=function(){
  var d=A.data, W=A.NODE_W, H=A.HEADER_H, IH=A.ITEM_H;
  if(!d.core_architecture) return; // Sécurité si données corrompues

  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10000 -10000 30000 30000" style="display:block; overflow:visible; position:absolute; left:-10000px; top:-10000px; width:30000px; height:30000px;">';
  s+='<defs><marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#64748B"/></marker>';
  s+='<marker id="arrHl" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#F8FAFC"/></marker></defs>';

  var ISL_PAD=24, ISL_TOP=36;
  (d.core_architecture.pages||[]).forEach(function(isl){
    var members=d.core_architecture.nodes.filter(function(n){return n.page===isl.id;});
    if(!members.length)return;
    var minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
    members.forEach(function(n){
      var st = A.getState(n.id);
      var nh = A.getNodeHeight(n, H, IH);
      if(st.x<minX) minX=st.x;
      if(st.y<minY) minY=st.y;
      if(st.x+W>maxX) maxX=st.x+W;
      if(st.y+nh>maxY) maxY=st.y+nh;
    });
    var ix=minX-ISL_PAD, iy=minY-ISL_TOP;
    var iw=maxX-minX+2*ISL_PAD, ih=maxY-minY+ISL_TOP+ISL_PAD;
    var col=isl.color||'#475569';
    s+='<g class="page" data-page="'+isl.id+'" pointer-events="none">';
    s+='<rect x="'+ix+'" y="'+iy+'" width="'+iw+'" height="'+ih+'" rx="14" fill="'+col+'" opacity="0.06" stroke="'+col+'" stroke-width="1.5" stroke-opacity="0.25" stroke-dasharray="6 3" pointer-events="none"/>';
    s+='<text x="'+(ix+12)+'" y="'+(iy+22)+'" font-size="12" font-weight="800" fill="'+col+'" font-family="Inter,sans-serif" opacity="0.6" letter-spacing="0.8" text-transform="uppercase" pointer-events="none">'+A.escHtml(isl.title).toUpperCase()+'</text>';
    s+='</g>';
  });

  (d.core_architecture.edges||[]).forEach(function(e,ei){
    var p=A.computeEdgePath(e);if(!p)return;
    var col = e.type ? A.getRelationColor(e.type) : "#475569";
    s+='<path class="edge" data-edge-idx="'+ei+'" data-from="'+e.from+'" data-to="'+e.to+'" d="'+p+'" stroke="'+col+'" stroke-width="1.5" fill="none" opacity="0.3" marker-end="url(#arr)"/>';
    var labelOrType = e.label || e.type;
    if(labelOrType){
      var match = p.match(/M([\.\-\d]+),([\.\-\d]+) C([\.\-\d]+),([\.\-\d]+) ([\.\-\d]+),([\.\-\d]+) ([\.\-\d]+),([\.\-\d]+)/);
      if(match){
         var t=0.5;
         var x0=parseFloat(match[1]), y0=parseFloat(match[2]), x1=parseFloat(match[3]), y1=parseFloat(match[4]), x2=parseFloat(match[5]), y2=parseFloat(match[6]), x3=parseFloat(match[7]), y3=parseFloat(match[8]);
         var midX = Math.pow(1-t,3)*x0 + 3*Math.pow(1-t,2)*t*x1 + 3*(1-t)*Math.pow(t,2)*x2 + Math.pow(t,3)*x3;
         var midY = Math.pow(1-t,3)*y0 + 3*Math.pow(1-t,2)*t*y1 + 3*(1-t)*Math.pow(t,2)*y2 + Math.pow(t,3)*y3;
         s+='<rect x="'+(midX-35)+'" y="'+(midY-8)+'" width="70" height="16" rx="4" fill="#1E293B" stroke="'+col+'" stroke-width="1"/>';
         s+='<text x="'+midX+'" y="'+(midY+3)+'" text-anchor="middle" font-size="9" font-weight="600" fill="'+col+'" font-family="Inter,sans-serif">'+A.escHtml(labelOrType)+'</text>';
      }
    }
  });

  (d.core_architecture.nodes||[]).forEach(function(n){
    var st = A.getState(n.id);
    var h=A.getNodeHeight(n, H, IH);
    s+='<g class="node" data-id="'+n.id+'">';
    s+='<rect x="'+(st.x-1)+'" y="'+(st.y+2)+'" width="'+(W+2)+'" height="'+h+'" rx="9" fill="rgba(0,0,0,0.2)"/>';
    s+='<rect x="'+st.x+'" y="'+st.y+'" width="'+W+'" height="'+h+'" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>';
    s+='<path d="M'+st.x+','+(st.y+8)+' a8,8 0 0 1 8,-8 h'+(W-16)+' a8,8 0 0 1 8,8 v'+(H-8)+' h-'+W+' Z" fill="'+st.color+'" opacity="0.9"/>';

    s+='<rect class="node-header-bg" data-action="drag" data-node="'+n.id+'" x="'+st.x+'" y="'+st.y+'" width="'+W+'" height="'+H+'" fill="transparent" rx="8"/>';
    s+='<text x="'+(st.x+14)+'" y="'+(st.y+22)+'" font-size="13" font-weight="700" fill="white" font-family="Inter,sans-serif" pointer-events="none">'+A.escHtml(n.title)+'</text>';
    
    var yOffset = 0;
    n.items.forEach(function(item,i){
      var currentItemHeight = A.getItemHeight(item, IH);
      var iy = st.y + H + yOffset;
      var lines = (item.t==='h3') ? [item.n] : A.wrapText(item.n, 34);

      s+='<g class="item-row" data-node="'+n.id+'" data-idx="'+i+'">';
      if(item.t==='h3'){
        s+='<rect x="'+(st.x+2)+'" y="'+iy+'" width="'+(W-4)+'" height="'+currentItemHeight+'" fill="#334155" opacity="0.6"/>';
        s+='<text x="'+(st.x+12)+'" y="'+(iy+17)+'" font-size="10" font-weight="800" fill="#F8FAFC" font-family="Inter,sans-serif" letter-spacing="0.5" pointer-events="none">'+A.escHtml(item.n)+'</text>';
      }else{
        if(i%2===0) s+='<rect x="'+(st.x+2)+'" y="'+iy+'" width="'+(W-4)+'" height="'+currentItemHeight+'" fill="#334155" opacity="0.2"/>';
        var col=A.getItemColor(item.t);
        s+='<text x="'+(st.x+12)+'" y="'+(iy+17)+'" font-size="10" font-weight="700" fill="'+col+'" font-family="Inter,sans-serif" pointer-events="none">'+A.escHtml(item.t)+'</text>';
        lines.forEach(function(line, lIdx){
          s+='<text x="'+(st.x+125)+'" y="'+(iy+17+(lIdx*14))+'" font-size="11" fill="#E2E8F0" font-family="Inter,sans-serif" pointer-events="none">'+A.escHtml(line)+'</text>';
        });
      }
      s+='<rect class="item-hit" data-node="'+n.id+'" data-idx="'+i+'" x="'+st.x+'" y="'+iy+'" width="'+W+'" height="'+currentItemHeight+'" fill="transparent" cursor="pointer"/>';
      s+='</g>';
      yOffset += currentItemHeight;
    });
    s+='</g>';
  });
  s+='</svg>';
  document.getElementById('diagram-container').innerHTML=s;
};

A.renderLegend=function(){
  var c=document.getElementById('legend-container');if(!c)return;
  var h='';(A.data.canvas_state.legend||[]).forEach(function(l){
    h+='<div class="ld"><div class="ldd" style="background:'+l.color+';box-shadow:0 0 5px '+l.color+';"></div>'+A.escHtml(l.label)+'</div>';
  });c.innerHTML=h;
};

A.renderPagesLegend=function(){
  var c=document.getElementById('pages-container');if(!c)return;
  var pages=A.data.core_architecture.pages||[];
  if(!pages.length){c.innerHTML='<span class="pages-empty">Aucune page</span>';return;}
  var h='';
  pages.forEach(function(isl){
    var count=A.data.core_architecture.nodes.filter(function(n){return n.page===isl.id;}).length;
    h+='<div class="ild"><div class="ildd" style="border-color:'+(isl.color||'#475569')+';"></div>'+A.escHtml(isl.title)+'<span class="ild-count" style="margin-left:auto;">'+count+' nœuds</span></div>';
  });
  c.innerHTML=h;
};

A.renderCanvasLegend=function(){
  var c=document.getElementById('canvas-legend');if(!c)return;
  var h='';
  (A.data.core_architecture.itemTypes||[]).forEach(function(cat,ci){
    h+='<div class="cl-category"><div class="cl-cat-header" style="color:'+cat.color+';"><span class="cl-cat-dot" style="background:'+cat.color+';"></span>'+A.escHtml(cat.category)+'</div>';
    if(cat.description)h+='<div class="cl-cat-desc">'+A.escHtml(cat.description)+'</div>';
    (cat.items||[]).forEach(function(item){
      h+='<div class="cl-row cl-row-child"><span class="cl-dot" style="background:'+cat.color+';"></span><span class="cl-tag">'+A.escHtml(item.tag)+'</span><span class="cl-label">'+A.escHtml(item.label)+'</span></div>';
    });
    h+='</div>';
  });
  c.innerHTML=h;
};
})();