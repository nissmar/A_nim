
//interactions
document.getElementById("fillColor").onchange = function () { //modifying fillcolor
  currentStyle.fillColor = document.getElementById("fillColor").value;
  for (var j = 0; j < currentFrame.selectedItems.length; j++) {
    currentFrame.selectedItems[j].fillColor = currentStyle.fillColor;
  }
}

document.getElementById("strokeColor").onchange = function () { //modifying strokecolor
  currentStyle.strokeColor = document.getElementById("strokeColor").value;
  for (var j = 0; j < currentFrame.selectedItems.length; j++) {
    currentFrame.selectedItems[j].strokeColor = currentStyle.strokeColor;
  }
}

var toolContainer = document.getElementById("tools");
var tools = toolContainer.getElementsByClassName("tool");
for (var i = 0; i < 4; i++) { //CHANGE HERE FOR THE CORRECT NUMBER OF ACTIVE BUTTON
  tools[i].addEventListener("click", function () {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  });
}


document.getElementById("sync").onclick = function () {

  var curr = projectFrames.currentN;
  projectFrames.currentN = -1;

  var selectedID = [];
  var spaths = [];
  for (var i = 0; i < currentFrame.selectedItems.length; i++) {
      selectedID.push(currentFrame.selectedItems[i].data.customID);
      spaths.push(currentFrame.selectedItems[i]);
  }
  globalFunc.emptySelectedItems(false);
  for (var i = 0; i < projectFrames.frames.length; i++) {
      document.getElementById('nextFrame').click();
      var ind;
      if (i != curr) {
          for (var j = 0; j < currentFrame.layer.children.length; j++) {
              ind = selectedID.indexOf(currentFrame.layer.children[j].data.customID);
              if (ind != -1) {
                  currentFrame.layer.children[j].remove();
              }
          }
          for (var j = 0; j < spaths.length; j++) {
              var p = spaths[j].clone(insert = false);
              currentFrame.layer.insertChild(p.index,p);
          }

      }
  }
  projectFrames.currentN = curr - 1;
  document.getElementById('nextFrame').click();

}




