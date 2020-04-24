
var modal2 = document.getElementById("settingsPopup");
var btn = document.getElementById("settings");
var span = document.getElementById("closeSettings");
btn.onclick = function() {
  modal2.style.display = "block";
}
span.onclick = function() {
  modal2.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal2) {
    modal2.style.display = "none";
  }
}

document.getElementById("delay").onchange = function() {
    projectFrames.delay = document.getElementById("delay").value;
}



document.getElementById("frameCount").onchange = function() {
    projectFrames.frameCount = document.getElementById("frameCount").value;
}