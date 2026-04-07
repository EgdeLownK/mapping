(function(){
var A = window.Agora = window.Agora || {};

var vp, cv, sc=0.70, tx=40, ty=25, panDrag=false, sx, sy, stx, sty;

function applyT(){ cv.style.transform='translate('+tx+'px,'+ty+'px) scale('+sc+')'; }

A.initViewport = function(){
  vp=document.getElementById('vp');
  cv=document.getElementById('cv');

  // Pan (mousedown on empty area)
  vp.addEventListener('mousedown',function(e){
    if(e.button!==0) return;
    // Don't pan if clicking on an interactive element or a node
    if(e.target.closest('[data-action]')) return;
    if(e.target.closest('.node')) return;
    if(e.target.closest('.modal-overlay')) return;
    panDrag=true; vp.classList.add('dragging');
    sx=e.clientX; sy=e.clientY; stx=tx; sty=ty;
  });
  document.addEventListener('mousemove',function(e){
    if(!panDrag) return;
    if(A._draggingNode) return; // don't pan while dragging a node
    tx=stx+(e.clientX-sx); ty=sty+(e.clientY-sy); applyT();
  });
  document.addEventListener('mouseup',function(){
    if(panDrag){ panDrag=false; vp.classList.remove('dragging'); }
  });

  // Zoom (wheel)
  vp.addEventListener('wheel',function(e){
    e.preventDefault();
    var r=vp.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top;
    var d=e.deltaY>0?0.92:1.09;
    var ns=Math.max(0.1,Math.min(3,sc*d));
    tx=mx-(mx-tx)*(ns/sc); ty=my-(my-ty)*(ns/sc); sc=ns; applyT();
  },{passive:false});

  applyT();
};

A.resetView = function(){ sc=0.70; tx=40; ty=25; applyT(); };

A.applyGhostMode = function(hId){
    document.querySelectorAll('.node').forEach(function(n){
      if(n.getAttribute('data-id')!==hId) n.style.opacity='0.15';
      else n.style.opacity='1';
    });
    var hNode = window.Agora.findNode(hId);
    var zoneNodes = {};
    if(hNode && hNode.zone) {
      document.querySelectorAll('.node').forEach(function(n){
        if(n.getAttribute('data-zone') === hNode.zone || window.Agora.findNode(n.getAttribute('data-id')).zone === hNode.zone) {
          zoneNodes[n.getAttribute('data-id')] = true;
        }
      });
    } else {
      zoneNodes[hId] = true;
    }

    document.querySelectorAll('.edge').forEach(function(ed){
      var from=ed.getAttribute('data-from'), to=ed.getAttribute('data-to');
      var isOutgoing = (from === hId);
      var isIncoming = zoneNodes[to];

      if(isOutgoing || isIncoming){
        if(isOutgoing){
          // Outgoing: White solid
          ed.style.opacity='1'; ed.style.stroke='#FFF'; ed.style.strokeWidth='1.5';
          ed.style.strokeDasharray='none';
          ed.setAttribute('marker-end','url(#arrHl)');
        } else {
          // Incoming: White dashed
          ed.style.opacity='1'; ed.style.stroke='#FFF'; ed.style.strokeWidth='1.5';
          ed.style.strokeDasharray='4 4';
          ed.setAttribute('marker-end','url(#arrHl)');
        }
        var nF=document.querySelector('.node[data-id="'+from+'"]');
        var nT=document.querySelector('.node[data-id="'+to+'"]');
        if(nF) nF.style.opacity='1';
        if(nT) nT.style.opacity='1';
      } else {
          ed.style.opacity='0.08'; ed.style.stroke='#475569'; ed.style.strokeWidth='1.5';
          ed.style.strokeDasharray='none';
          ed.setAttribute('marker-end','url(#arr)');
      }
    });
};

A.clearGhostMode = function(){
    document.querySelectorAll('.node').forEach(function(n){ n.style.opacity='1'; });
    document.querySelectorAll('.edge').forEach(function(ed){
      ed.style.opacity='0.08'; ed.style.stroke='#475569'; ed.style.strokeWidth='1.5';
      ed.style.strokeDasharray='none';
      ed.setAttribute('marker-end','url(#arr)');
    });
};

A.applyEdgeGhostMode = function(ei){
    var TheEdge = window.Agora.data.core_architecture.edges[ei];
    if(!TheEdge) return;
    var from=TheEdge.from, to=TheEdge.to;

    document.querySelectorAll('.node').forEach(function(n){
      var nid = n.getAttribute('data-id');
      if(nid===from || nid===to) n.style.opacity='1';
      else n.style.opacity='0.15';
    });

    document.querySelectorAll('.edge').forEach(function(ed){
      if(ed.getAttribute('data-edge-idx') == ei) {
          ed.style.opacity='1'; ed.style.stroke='#3B82F6'; ed.style.strokeWidth='2';
          ed.style.strokeDasharray='none';
          ed.setAttribute('marker-end','url(#arrHl)');
      } else {
          ed.style.opacity='0.08'; ed.style.stroke='#475569'; ed.style.strokeWidth='1.5';
          ed.style.strokeDasharray='none';
          ed.setAttribute('marker-end','url(#arr)');
      }
    });
};

// Ghost mode — GUARD: bind only once
A.initGhostMode = function(){
  if(A._ghostBound) return;
  A._ghostBound = true;

  var container=document.getElementById('diagram-container');

  container.addEventListener('mouseover',function(e){
    if(A._draggingNode) return;
    var ng=e.target.closest('.node');
    if(!ng) return;
    A.applyGhostMode(ng.getAttribute('data-id'));
  });

  container.addEventListener('mouseout',function(e){
    var ng=e.target.closest('.node');
    if(!ng) return;
    A.clearGhostMode();
    // Restaure la vue si un panneau est ouvert
    if(window.Agora._editingPanelNode) A.applyGhostMode(window.Agora._editingPanelNode);
  });
};
})();
