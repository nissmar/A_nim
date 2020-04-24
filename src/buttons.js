
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



function copyAttributes(item,source) {
  if (item.className == 'Group') {
    for (var k = 0; k < item.children.length; k++) {
      copyAttributes(item.children[k],source.children[k]);
    }
  }
  else {
    var pos = item.position;
    item.segments = source.segments;
    item.position = pos;
    item.fillColor = source.fillColor;
    item.strokeColor = source.strokeColor;
    item.strokeWidth = source.strokeWidth;
  }

}

document.getElementById("sync").onclick = function () {

  var curr = projectFrames.currentN;
  projectFrames.currentN = -1;

  var selectedID = [];
  var spaths = [];
  var seen = [];
  for (var i = 0; i < currentFrame.selectedItems.length; i++) {
    selectedID.push(currentFrame.selectedItems[i].data.customID);
    spaths.push(currentFrame.selectedItems[i]);
    seen.push(false);
  }
  for (var i = 0; i < projectFrames.frames.length; i++) {
    document.getElementById('nextFrame').click();
    var ind;
    if (i != curr) {
      for (var j = 0; j < currentFrame.paths.length; j++) {
        ind = selectedID.indexOf(currentFrame.paths[j].data.customID);
        if (ind != -1) {
          seen[ind] = true;
          copyAttributes(currentFrame.paths[j],spaths[ind]);
        }
      }
      for (var j = 0; j < seen.length; j++) {
        if (!seen[j]) {
          currentFrame.paths.push(spaths[j].clone());
        }
        seen[j] = false;
      }
    
    }
  }
  projectFrames.currentN = curr -1;
  document.getElementById('nextFrame').click();
  console.log('sync!');

}





