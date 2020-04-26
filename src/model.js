// php -S localhost:8080


//Colors definition
currentStyle = {
    strokeColor: document.getElementById("strokeColor").value,
    strokeWidth: 10,
    fillColor: document.getElementById("fillColor").value,
}

//global func 
globalFunc = {
    emptySelectedItems: null,
    updateFrame: null,
}


//ANIMATION:
var running = false;

//frames
function createFrame() {
    newFrame = {
        layer: null,
        selectedItems: [],
        rectangle: null, //the bounding rectangle
        rectangleCenter: null,
        selectedpoint: null, //the selected point
    }
    return newFrame;

}

currentFrame = createFrame();
currentFrame.layer = new Layer();

projectFrames = {
    ID: 0,
    currentN: 0, //current frame
    frames: [currentFrame], //all frames
    delay: 100,
    frameCount: 10,
    clipboard: [], //for copy and paste
}


//frames
globalFunc.updateFrame = function() { //used when changing frame
    // console.log((projectFrames.currentN + 1));
    globalFunc.emptySelectedItems(false);

    currentFrame.layer.visible = false;

    currentFrame = projectFrames.frames[projectFrames.currentN];
    currentFrame.layer.visible = true;
    currentFrame.layer.activate();
    document.getElementById("counter").textContent = (projectFrames.currentN + 1).toString() + "/" + (projectFrames.frames.length).toString();
}

document.getElementById("previousFrame").onclick = function () { //moving to previous frame
    if (projectFrames.currentN > 0) {
        projectFrames.currentN--;
        globalFunc.updateFrame();
    }
}

document.getElementById("nextFrame").onclick = function () { //moving to next frame
    if (projectFrames.currentN < projectFrames.frames.length - 1) {
        projectFrames.currentN++;
        globalFunc.updateFrame();
        console.log(currentFrame);
    }
}

document.getElementById("newFrame").onclick = function () { //moving to next frame
    

    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.remove();
        currentFrame.rectangle = null;
    }

    var newF = createFrame();
    globalFunc.emptySelectedItems(false);
    // console.log('new frame');
    
    newF.layer = currentFrame.layer.clone();
    // newF.layer.activate();

    // for (var i = 0; i < currentFrame.paths.length; i++) newF.paths.push(currentFrame.paths[i].clone());
    projectFrames.frames.splice(projectFrames.currentN + 1, 0, newF);
    projectFrames.currentN++;

    globalFunc.updateFrame();

}

document.getElementById("deleteFrame").onclick = function () { //moving to next frame
    if (projectFrames.frames.length > 1) {

        projectFrames.frames.splice(projectFrames.currentN, 1);
        currentFrame.layer.remove();
        if (projectFrames.frames.length == projectFrames.currentN) {
            projectFrames.currentN--;
            console.log(projectFrames);
        }
        globalFunc.updateFrame();
    }



    else {
        // projectFrames.frames.pop();
        // projectFrames.frames.push(createFrame());
        // globalFunc.updateFrame();
        // console.log(projectFrames.frames);
    }

}

document.getElementById("play").onclick = function () {
    if (!running) {
        running = true;
        projectFrames.currentN = -1;
        for (var i = 0; i < projectFrames.frames.length; i++) {
            // console.log("i : ",i);
            setTimeout(function () { projectFrames.currentN++; globalFunc.updateFrame(); }, projectFrames.delay * i);
        }
        setTimeout(function () { running = false; }, projectFrames.delay * projectFrames.frames.length);
    }

}

