// php -S localhost:8080
//Colors definition
currentStyle = {
    strokeColor: document.getElementById("strokeColor").value,
    strokeWidth: 10,
    fillColor: document.getElementById("fillColor").value,
}

//ANIMATION:
var running = false;

//frames
function createFrame() {
    newFrame = {
        selectedItems: [],
        rectangle: null, //the bounding rectangle
        rectangleCenter: null,
        paths: [], //all paths 
        selectedpoint: null, //the selected point
    }
    return newFrame;

}

currentFrame = createFrame();

projectFrames = {
    ID: 0,
    currentN: 0, //current frame
    frames: [currentFrame], //all frames
    delay: 100,
    clipboard: [], //for copy and paste
}


//frames
function updateFrame() { //used when changing frame
    // console.log((projectFrames.currentN + 1));

    currentFrame.selectedItems = [];
    currentFrame.selectedpoint = null;
    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.remove();
        currentFrame.rectangle = null;
    }
    for (var i = 0; i < currentFrame.paths.length; i++) {
        currentFrame.paths[i].visible = false;
        currentFrame.paths[i].selected = false;
    }
    currentFrame = projectFrames.frames[projectFrames.currentN];
    for (var i = 0; i < currentFrame.paths.length; i++) {
        currentFrame.paths[i].visible = true;
    }
    document.getElementById("counter").textContent = (projectFrames.currentN + 1).toString() + "/" + (projectFrames.frames.length).toString();
}

document.getElementById("previousFrame").onclick = function () { //moving to previous frame
    if (projectFrames.currentN > 0) {
        projectFrames.currentN--;
        updateFrame();
    }
}

document.getElementById("nextFrame").onclick = function () { //moving to next frame
    if (projectFrames.currentN < projectFrames.frames.length - 1) {
        projectFrames.currentN++;
        updateFrame();
        console.log(currentFrame);
    }
}

document.getElementById("newFrame").onclick = function () { //moving to next frame
    // projectFrames.currentN++;
    var newF = createFrame();
    for (var j = 0; j < currentFrame.selectedItems.length; j++) currentFrame.selectedItems[j].selected = false;
    // console.log('new frame');
    for (var i = 0; i < currentFrame.paths.length; i++) newF.paths.push(currentFrame.paths[i].clone());
    projectFrames.frames.splice(projectFrames.currentN + 1, 0, newF);
    projectFrames.currentN++;
    updateFrame();

}

document.getElementById("deleteFrame").onclick = function () { //moving to next frame
    if (projectFrames.frames.length > 1) {

        projectFrames.frames.splice(projectFrames.currentN, 1);
        if (projectFrames.frames.length == projectFrames.currentN) {
            projectFrames.currentN--;
            console.log(projectFrames);
        }
        updateFrame();
    }



    else {
        projectFrames.frames.pop();
        projectFrames.frames.push(createFrame());
        updateFrame();
        console.log(projectFrames.frames);
    }

}

document.getElementById("play").onclick = function () {
    if (!running) {
        running = true;
        projectFrames.currentN = -1;
        for (var i = 0; i < projectFrames.frames.length; i++) {
            // console.log("i : ",i);
            setTimeout(function () { projectFrames.currentN++; updateFrame(); }, projectFrames.delay * i);
        }
        setTimeout(function () { running = false; }, projectFrames.delay * projectFrames.frames.length);
    }

}



document.getElementById("export").onclick = function () {
    var encoder = new GIFEncoder();
    encoder.setRepeat(0); //0  -> loop forever //1+ -> loop n times then stop
    encoder.setDelay(projectFrames.delay); //go to next frame every n milliseconds
    encoder.start();
    var context = document.getElementById('myCanvas').getContext('2d');
    context.setFill = "#e0e0e0";

    function update0() {
        projectFrames.currentN++;
        updateFrame();
        console.log(encoder);
        encoder.addFrame(context);
    }
    function finish() {
        encoder.finish();
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