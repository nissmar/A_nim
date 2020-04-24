//IMPORT

document.getElementById("import").onchange = function () {
  console.log('import');
  var fichierSelectionne = document.getElementById('import').files[0];
  console.log(fichierSelectionne.size);
  projectFrames.currentN = -1;
  document.getElementById("nextFrame").click();
  var options = {
    expandShapes: true,
    insert : false,
    onLoad: function (item) {
      
      for (var i=0;i<item.children.length;i++) {
        // console.log(item.children[i],i);

        if (item.children[i].className == "Group") {
          currentFrame.layer.removeChildren();
          currentFrame.layer.addChildren(item.children[i].children);
        }
        document.getElementById("newFrame").click();
      }
      item.scale(1, view.size.width / view.size.height);
      item.data.customID = projectFrames.ID;
      projectFrames.ID++;
      currentFrame.paths.push(item);
      console.log(currentFrame.paths);
    }
  }

  svg = project.importSVG(fichierSelectionne, options);
  console.log(svg);
}

// document.getElementById("import2").onchange = function () {
//     console.log('import');
//     var fichierSelectionne = document.getElementById('import').files[0];
//     console.log(fichierSelectionne.size);
  
//     var options = {
//       expandShapes: true,
//       onLoad: function (item) {
//         console.log(item.children);
//         item.scale(1, view.size.width / view.size.height);
//         item.data.customID = projectFrames.ID;
//         projectFrames.ID++;
//         currentFrame.paths.push(item);
//         console.log(currentFrame.paths);
//       }
//     }
  
//     project.importSVG(fichierSelectionne, options);
//   }
  
  

//EXPORT

var modal = document.getElementById("exportPopup");
var btn = document.getElementById("export");
var span = document.getElementById("closeExport");
btn.onclick = function() {
  modal.style.display = "block";
}
span.onclick = function() {
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


