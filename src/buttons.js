
//interactions
document.getElementById("fillColor").onchange = function() { //modifying fillcolor
    currentStyle.fillColor = document.getElementById("fillColor").value;
    if (currentFrame.currentPath != null) {
        currentFrame.currentPath.fillColor = currentStyle.fillColor;
    }
}

document.getElementById("strokeColor").onchange = function() { //modifying strokecolor
    currentStyle.strokeColor = document.getElementById("strokeColor").value;
    if (currentFrame.currentPath != null) {
        currentFrame.currentPath.strokeColor = currentStyle.strokeColor;
    }
}

var toolContainer = document.getElementById("tools");
var tools = toolContainer.getElementsByClassName("tool");
for (var i = 0; i < 4; i++) { //CHANGE HERE FOR THE CORRECT NUMBER OF ACTIVE BUTTON
  tools[i].addEventListener("click", function() {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  });
}

document.getElementById("import").onchange = function() {
  console.log('import');
  var fichierSelectionne = document.getElementById('import').files[0];
  console.log(fichierSelectionne.size);

  var options = {
    expandShapes: true, 
    onLoad : function(item) {
        console.log(item);
        item.scale(1,view.size.width/view.size.height);
        currentFrame.paths.push(item);
        console.log(currentFrame.paths);
      }
  }

  project.importSVG(fichierSelectionne,options);
 
  

}
