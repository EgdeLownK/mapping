(function(){
var A=window.Agora;
A.toggleWidget = function(contentId) {
  var content = document.getElementById(contentId);
  var chevron = document.getElementById('chevron-' + contentId);
  if(content) {
    if(content.classList.contains('collapsed')) {
      content.classList.remove('collapsed');
      if(chevron) chevron.classList.remove('collapsed');
    } else {
      content.classList.add('collapsed');
      if(chevron) chevron.classList.add('collapsed');
    }
  }
};
A.initViewport();
A.fullRender();
console.log('Agora Mapping Editor v3 ✓');
console.log('Nodes:',A.data.core_architecture.nodes.length,'| Edges:',A.data.core_architecture.edges.length,'| Types:',A.data.core_architecture.itemTypes.length);
})();
