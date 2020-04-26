//IMPORT

document.getElementById("import").onchange = function () {
  globalFunc.emptySelectedItems(false);
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
      // item.scale(1, view.size.width / view.size.height);
      // item.data.customID = projectFrames.ID;
      // projectFrames.ID++;
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



document.getElementById("exportGif").onclick = function () {
  globalFunc.emptySelectedItems(false);
    
  var myBar = document.getElementById("myBar");

  var encoder = new GIFEncoder();
  encoder.setRepeat(0); //0  -> loop forever //1+ -> loop n times then stop
  encoder.setDelay(projectFrames.delay); //go to next frame every n milliseconds
  encoder.start();
  var context = document.getElementById('myCanvas').getContext('2d');
  context.setFill = "#e0e0e0";
  document.getElementById("myProgress").style.display = "block";


  var N = projectFrames.frames.length;
  function update0() {

      projectFrames.currentN++;
      myBar.style.width = 100*(projectFrames.currentN+1)/N +"%";
      globalFunc.updateFrame();
      console.log(encoder);
      encoder.addFrame(context);
  }
  function finish() {
      encoder.finish();
      document.getElementById("myProgress").style.display = "none";
      // var data_url = 'data:image/gif;base64,'+encode64(encoder.stream().getData());
      // document.getElementById('image').src = data_url;
      encoder.download("download.gif");
  }


  projectFrames.currentN = -1;
  for (var i = 0; i < projectFrames.frames.length; i++) {
      console.log("i : ", i);
      setTimeout(update0, 10 * i);
  }
  setTimeout(finish, 10 * projectFrames.frames.length);
}





document.getElementById("exportSvg").onclick = function () {
  globalFunc.emptySelectedItems(false);
  var fileName = "A_nim.svg"
  var url = "data:image/svg+xml;utf8," + encodeURIComponent(paper.project.exportSVG({asString:true}));
  var link = document.createElement("a");
  link.download = fileName;
  link.href = url;
  link.click();
}
