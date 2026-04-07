(function(){
var A=window.Agora=window.Agora||{};
A._draggingNode=null;
var smx,smy,snx,sny,raf=null;

// Sécurité : Accès garanti au state
A.getState=function(id){
    if(!A.data.canvas_state.nodeStates[id]) A.data.canvas_state.nodeStates[id] = {x:0, y:0, color:'#3B82F6'};
    return A.data.canvas_state.nodeStates[id];
};

A.initDrag=function(){
  if(A._dragBound)return;A._dragBound=true;
  var c=document.getElementById('diagram-container');
  
  c.addEventListener('mousedown',function(e){
    if(e.button!==0)return;
    var h=e.target.closest('[data-action="drag"]');if(!h)return;
    e.preventDefault();e.stopPropagation();
    
    var nid=h.getAttribute('data-node');
    var n=A.findNode(nid);if(!n)return;
    
    A._draggingNode=nid;
    smx=e.clientX;
    smy=e.clientY;
    
    var state = A.getState(nid);
    snx=state.x;
    sny=state.y;
    
    document.getElementById('vp').classList.add('dragging');
  });
  
  document.addEventListener('mousemove',function(e){
    if(!A._draggingNode)return;e.preventDefault();
    var n=A.findNode(A._draggingNode);if(!n){A._draggingNode=null;return;}
    
    var cv=document.getElementById('cv');
    var m=cv.style.transform.match(/scale\(([^)]+)\)/);
    var sc=m?parseFloat(m[1]):1;
    var dx=(e.clientX-smx)/sc,dy=(e.clientY-smy)/sc;
    
    if(Math.abs(e.clientX-smx)>5 || Math.abs(e.clientY-smy)>5) A._dragged=true;
    
    var state = A.getState(A._draggingNode);
    state.x=Math.round((snx+dx)/10)*10;
    state.y=Math.round((sny+dy)/10)*10;
    
    if(!raf){raf=requestAnimationFrame(function(){A.render();raf=null;});}
  });
  
  document.addEventListener('mouseup',function(){
    if(!A._draggingNode)return;A._draggingNode=null;
    setTimeout(function(){A._dragged=false;}, 50); 
    document.getElementById('vp').classList.remove('dragging');
    if(raf){cancelAnimationFrame(raf);raf=null;}
    A.save();
    A.render();
  });
};
})();