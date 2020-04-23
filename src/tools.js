console.log("initTool");

//Usefull variables
var mindistance = 10; //selection distance

//Tools definition
var vectorCreator = new Tool(); //to draw paths
var newpath = null;

var vectorEditor = new Tool(); //to transform paths
var pointEditor = new Tool(); //to transform path points

var animator = new Tool(); //to animate curve
var animpath = null;


// Background
var rect = new Path.Rectangle({
    point: [-1, -1],
    size: [view.size.width + 2, view.size.height + 2],
    strokeColor: 'white',
    selected: false,
    locked: true,
});
rect.sendToBack();
rect.fillColor = '#e0e0e0';

//KEY SHORTCUTS
function shortcut(event) {
    // console.log("frame : ",currentFrame.selectedItems);
    console.log(currentFrame.selectedItems );

    //MODIFIERS
    if (event.key == "c" && (event.modifiers.control || event.modifiers.meta)) { //backgroundcolor
        projectFrames.clipboard = [];
        for (var j = 0; j < currentFrame.selectedItems.length; j++) {
            console.log(currentFrame.selectedItems[j]);
            var p = currentFrame.selectedItems[j].clone(insert = false);
            // p.visible = false;
            // p.selected = false;
            projectFrames.clipboard.push(p);
        }
    }

    else if (event.key == "v" && (event.modifiers.control || event.modifiers.meta)) { //paste
        console.log(projectFrames.clipboard);
        for (var j = 0; j < projectFrames.clipboard.length; j++) {
            var p = projectFrames.clipboard[j].clone();
            paper.project.activeLayer.addChild(p);
            // p.visible = true;
            currentFrame.paths.push(p);

        }
    }

    else if (event.key == "g" && (event.modifiers.control || event.modifiers.meta)) { //group
        var g;
        
        var n = currentFrame.selectedItems.length;
        if (n==1 && currentFrame.selectedItems[0].className == 'Group') { //ungroup
            g = currentFrame.selectedItems[0];
            emptySelectedItems();
            var l = g.removeChildren();
            g.parent.insertChildren(g.index,  l);
            for (var j = 0; j < l.length; j++) {
                currentFrame.paths.push(l[j]);
                // paper.project.activeLayer.addChild(p);
            }
            g.remove();
            return;
        }

        g = new Group(insert = false);
        function t(a,b) {
            return a.index>=b.index;
        }
        currentFrame.selectedItems.sort(t);
        for (var j = 0; j < n; j++) {

            g.addChild(currentFrame.selectedItems[j].clone());
            console.log(currentFrame.selectedItems[j].index);
            g.data.customID = projectFrames.ID;
            projectFrames.ID++;
            
        }
        console.log(currentFrame.selectedItems[n-1].index);
        paper.project.activeLayer.insertChild(currentFrame.selectedItems[n-1].index,g);
        emptySelectedItems(true);

        currentFrame.paths.push(g);
        currentFrame.selectedItems = [g];
        createRect();
    }

    //REGULAR
    else if (event.key == "a") {
        document.getElementById('PE').click();

    }
    else if (event.key == "v") {
        document.getElementById('VE').click();

    }
    else if (event.key == "p") {
        document.getElementById('VC').click();
    }
    else if (event.key == "space") {
        if (projectFrames.currentN == projectFrames.frames.length - 1) {
            document.getElementById('newFrame').click();

        }
        else {
            document.getElementById('nextFrame').click();

        }
    }
    else if (event.key == "enter") {
        document.getElementById('play').click();
    }

    else if (event.key == "backspace" && currentFrame.selectedItems.length == 0) {
        projectFrames.currentN = -1;
        document.getElementById('nextFrame').click();
    }
    else if (event.key == "b") { //backgroundcolor
        rect.fillColor = currentStyle.fillColor;

    }
}

//Path management
function createPath() {
    var path = new Path();
    path.strokeColor = currentStyle.strokeColor;
    path.fullySelected = true;
    path.data.customID = projectFrames.ID;
    projectFrames.ID++;
    return path;
}

function closePath(path) {
    path.closed = true;
    path.fullySelected = false;
    path.fillColor = currentStyle.fillColor;
    path.strokeWidth = currentStyle.strokeWidth;
}

//selection management

function emptySelectedItems(remove) {
    for (var j = 0; j < currentFrame.selectedItems.length; j++) {
        console.log(currentFrame.selectedItems)
        currentFrame.selectedItems[j].selected = false;
        if (remove) {
            var k = currentFrame.paths.indexOf(currentFrame.selectedItems[j]);
            if (k !=-1) {
                currentFrame.paths.splice(k,1);
            }
            currentFrame.selectedItems[j].remove();

        }
    }
    currentFrame.selectedItems = [];
    currentFrame.selectedpoint = null;

    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.remove();
        currentFrame.rectangle = null;
    }
}

function selectedItemsContain(point) {
    for (var j = 0; j < currentFrame.selectedItems.length; j++) {
        if (currentFrame.selectedItems[j].contains(point)) return true;
    }
    return false;
}

function setSelectedItemsStroke() {
    for (var j = 0; j < currentFrame.selectedItems.length; j++) {
        currentFrame.selectedItems[j].strokeWidth = currentStyle.strokeWidth;
    }
}


function moveSelectedItems(delta) {
    for (var j = 0; j < currentFrame.selectedItems.length; j++) {
        currentFrame.selectedItems[j].position += delta;
    }
}
//vector creator
vectorCreator.onMouseDown = function (event) {
    if (newpath == null) {
        newpath = createPath();
        newpath.add(event.point);
    }
    else {
        if (newpath.segments.length > 0) {
            if ((event.point - newpath.segments[0].point).length < mindistance) {
                closePath(newpath);
                currentFrame.paths.push(newpath);
                newpath = null;
            }
            else newpath.add(event.point);
        }
        else newpath.add(event.point);
    }
}


vectorCreator.onMouseDrag = function (event) {
    if (newpath != null) {
        var n = newpath.segments.length - 1;
        var point = event.point.clone();
        var delta = point - newpath.segments[n].point;
        var curve = newpath.segments[n];
        curve.selected = true;
        curve.handleIn = -delta;
        curve.handleOut = delta;
    }

}
vectorCreator.onKeyDown = function (event) {
    shortcut(event);
}

//Rect


function createRect() {
    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.remove();
    }
    if (currentFrame.selectedItems.length != 0) {
        var bounds = currentFrame.selectedItems[0].bounds;
        for (var j = 1; j < currentFrame.selectedItems.length; j++) {
            bounds = bounds.unite(currentFrame.selectedItems[j].bounds);
        }
        b = bounds.clone().expand(10, 10);
        currentFrame.rectangle = new Path.Rectangle(b);
        currentFrame.rectangle.pivot = currentFrame.rectangle.position;
        currentFrame.rectangle.insert(2, new Point(b.center.x, b.top));
        currentFrame.rectangle.insert(2, new Point(b.center.x, b.top - 25));
        currentFrame.rectangle.insert(2, new Point(b.center.x, b.top));
        currentFrame.rectangle.position = b.center;

        currentFrame.rectangle.strokeWidth = 1;
        currentFrame.rectangle.strokeColor = 'blue';
        currentFrame.rectangle.name = "selection rectangle";
        currentFrame.rectangle.selected = true;
    }
}

function moveRect(delta) { //delta is a point
    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.position += delta;
        moveSelectedItems(delta);
    }
}

function rotateRect(alpha) { //alpha is an angle
    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.rotate(alpha);
        for (var j = 0; j < currentFrame.selectedItems.length; j++) {
            currentFrame.selectedItems[j].rotate(alpha, currentFrame.rectangle.position);
        }
    }
}

function scaleRect(event, origin) {
    if (currentFrame.rectangle != null) {
        var c = event.point;
        var d = event.delta;

        var ratiox = (c - origin).x / (c - d - origin).x;
        var ratioy = (c - origin).y / (c - d - origin).y;

        if (event.modifiers.shift) {
            ratiox = ratioy;
            ratioy = ratiox;
        }
        currentFrame.rectangle.scale(new Point(ratiox, ratioy), origin);

        for (var j = 0; j < currentFrame.selectedItems.length; j++) {
            currentFrame.selectedItems[j].scale(new Point(ratiox, ratioy), origin);
        }
    }
}



// Vector editor
vectorEditor.onMouseDown = function (event) {

    var hitOptions = {
        segments: true,
        stroke: true,
        // class: Group,
        visible: true,
        handles: false,
        fill: true,
        tolerance: 5,
    };
    var hit = project.hitTest(event.point, hitOptions);
    var it = null;
    if (hit != null) {
        it = hit.item;
        while (it != null && it.parent.className != "Layer") it = it.parent;
    }


    if (currentFrame.selectedItems.length != 0) {
        if (hit != null && it == currentFrame.rectangle) {
            if (hit.type == "segment") currentFrame.selectedpoint = [hit.segment, null];
        }
        else if (event.modifiers.shift) {
            if (hit != null && !currentFrame.selectedItems.includes(it)) {
                it.selected = true;
                currentFrame.selectedItems.push(it);
                createRect();

            }

        }

        else if (!selectedItemsContain(event.point)) {
            emptySelectedItems(false);
            if (hit != null) {
                it.selected = true;
                currentFrame.selectedItems = [it];
                createRect();
            }
        }
    }
    else {
        if (hit != null) {

            it.selected = true;
            currentFrame.selectedItems = [it];
            createRect();
        }
    }
}


vectorEditor.onMouseDrag = function (event) {

    if (Key.isDown('s')) {
        currentStyle.strokeWidth += event.delta.x / 3;
        setSelectedItemsStroke();

    }
    else if (currentFrame.selectedpoint == null && currentFrame.rectangle != null) {
        moveRect(event.delta);
    }
    else if (currentFrame.selectedpoint != null) {
        var i = currentFrame.rectangle.segments.indexOf(currentFrame.selectedpoint[0]);
        var correspondance = [5, 6, null, null, null, 0, 1];
        if (i == 0 || i == 1 || i == 5 || i == 6) {
            if (event.modifiers.command) {
                scaleRect(event, currentFrame.rectangle.position);
            }
            else {
                scaleRect(event, currentFrame.rectangle.segments[correspondance[i]].point);
            }

        }
        else if (i == 3) {
            var teta2 = event.point - currentFrame.rectangle.bounds.center;
            var alpha1 = (teta2 - event.delta).angle;
            var alpha2 = (teta2).angle;
            rotateRect(alpha2 - alpha1);
        }
    }
}

vectorEditor.onMouseUp = function (event) {
    currentFrame.selectedpoint = null;
}

vectorEditor.onKeyDown = function (event) {

    shortcut(event);
    if (event.key == "backspace") {
        emptySelectedItems(true);
        newpath = null;

    }
    else if (event.key == "=") {
        for (var j = 0; j < currentFrame.selectedItems.length; j++) {
            currentFrame.selectedItems[j].bringToFront();
        }
    }
    else if (event.key == "-") {
        for (var j = 0; j < currentFrame.selectedItems.length; j++) {
            currentFrame.selectedItems[j].sendToBack();
        }
        rect.sendToBack();
    }

}



//point Editor
pointEditor.onMouseDown = function (event) {
    var hitOptions = {
        segments: true,
        stroke: true,
        handles: true,
        fill: true,
        tolerance: 5,
    };
    var hit = project.hitTest(event.point, hitOptions);
    console.log(hit);
    if (hit != null) {
        if (!currentFrame.selectedItems.includes(hit.item)) {
            emptySelectedItems(false);
            hit.item.selected = true;
            currentFrame.selectedItems.push(hit.item);
        }
        else if (hit.type == "fill") {
            if (currentFrame.selectedpoint != null) {
                currentFrame.selectedpoint[0].selected = false;
                currentFrame.selectedpoint = null;
            }
        }
        else if (hit.type == "segment" || hit.type == "handle-in" || hit.type == "handle-out") {
            if (currentFrame.selectedpoint != null) {
                currentFrame.selectedpoint[0].selected = false;
            }
            currentFrame.selectedpoint = [hit.segment, hit.type];
            hit.segment.selected = true;

        }
        else if (hit.type == "stroke") {
            if (currentFrame.selectedpoint != null) {
                currentFrame.selectedpoint[0].selected = false;
                currentFrame.selectedpoint = null;
            }
            var curve = hit.location._curve;
            curve.divideAt(curve.getLocationOf(hit.point));
        }
    }

    else {
        emptySelectedItems(false);
    }



}


pointEditor.onMouseDrag = function (event) {
    if (currentFrame.selectedpoint == null && currentFrame.selectedItems.length != 0) {
        moveSelectedItems(event.delta);
    }
    if (currentFrame.selectedpoint != null) {
        var ratio;
        if (currentFrame.selectedpoint[1] == "segment") {
            currentFrame.selectedpoint[0].point = event.point;
        }
        else if (currentFrame.selectedpoint[1] == "handle-in") {
            ratio = currentFrame.selectedpoint[0].handleOut.length / currentFrame.selectedpoint[0].handleIn.length
            currentFrame.selectedpoint[0].handleIn += event.delta;
            if (!event.modifiers.alt) {

                currentFrame.selectedpoint[0].handleOut.x = -ratio * currentFrame.selectedpoint[0].handleIn.x;
                currentFrame.selectedpoint[0].handleOut.y = -ratio * currentFrame.selectedpoint[0].handleIn.y;
            }

        }
        else {
            ratio = currentFrame.selectedpoint[0].handleIn.length / currentFrame.selectedpoint[0].handleOut.length
            currentFrame.selectedpoint[0].handleOut += event.delta;
            if (!event.modifiers.alt) {

                currentFrame.selectedpoint[0].handleIn.x = -ratio * currentFrame.selectedpoint[0].handleOut.x;
                currentFrame.selectedpoint[0].handleIn.y = -ratio * currentFrame.selectedpoint[0].handleOut.y;
            }

        }

    }
}

pointEditor.onMouseUp = function (event) {
    // currentFrame.selectedpoint = null;
}

pointEditor.onKeyDown = function (event) {
    shortcut(event);
    if (event.key == "backspace") {
        console.log(currentFrame.selectedpoint);
        if (currentFrame.selectedpoint != null) {
            console.log('remove p ');
            currentFrame.selectedpoint[0].path.removeSegment(currentFrame.selectedpoint[0].index);
            currentFrame.selectedpoint = null;
        }
        else emptySelectedItems(true);
    }
}



//animator
animator.onMouseDown = function (event) {

    if (animpath != null) {
        animpath.remove();
        animpath = null;
    }
    if (currentFrame.selectedItems.length != 0) {
        animpath = new Path();
        animpath.fullySelected = true;
        animpath.strokeColor = 'black';

    }



}


animator.onMouseDrag = function (event) {
    if (animpath != null) {
        animpath.add(event.point);
    }

}


animator.onMouseUp = function (event) {
    if (animpath != null) {
        var selectedID = [];
        var seen = [];
        var animpaths = [];

        console.log('animating : ');

        for (var i = 0; i < currentFrame.selectedItems.length; i++) {
            selectedID.push(currentFrame.selectedItems[i].data.customID);
            animpaths.push(currentFrame.selectedItems[i]);
            seen.push(-1);


        }
        console.log("IDs ", selectedID);
        animpath.simplify(100);

        var delta;
        for (var i = 1; i < 10; i++) {
            delta = animpath.getLocationAt(i * animpath.length / 10).point - animpath.getLocationAt(0).point;
            if (projectFrames.currentN < projectFrames.frames.length - 1) {
                document.getElementById('nextFrame').click();
            }
            else {
                document.getElementById('newFrame').click();
            }
            console.log("frame : ", currentFrame);

            var ind;
            for (var j = 0; j < currentFrame.paths.length; j++) {
                // console.log("fp",currentFrame.paths[j]);
                ind = selectedID.indexOf(currentFrame.paths[j].data.customID);
                if (ind != -1) seen[ind] = j;

            }
            console.log(seen);



            for (var j = 0; j < selectedID.length; j++) {
                if (seen[j] != -1) {
                    currentFrame.paths[seen[j]].position = animpaths[j].position + delta;
                    seen[j] = -1;
                }
                else {
                    currentFrame.paths.push(animpaths[j].clone());
                    currentFrame.paths[currentFrame.paths.length - 1].position += delta;

                }
            }
        }
        animpath.remove();
        animpath = null;
    }
    emptySelectedItems(false);
}

animator.onKeyDown = function (event) {
    shortcut(event);
}

activateVC = activateVectorCreator;
function activateVectorCreator() {
    vectorCreator.activate();
    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.remove();
        currentFrame.rectangle = null;
        emptySelectedItems(false);
        currentFrame.selectedpoint = null;
    }
}

activateVE = activateVectorEditor;
function activateVectorEditor() {
    vectorEditor.activate();
    if (currentFrame.selectedItems.length != 0) {
        createRect();
    }
}

activatePE = activatePointEditor;

function activatePointEditor() {
    pointEditor.activate();
    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.remove();
        currentFrame.rectangle = null;
    }
}


activateA = activateAnimator;

function activateAnimator() {
    animator.activate();
    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.remove();
        currentFrame.rectangle = null;
    }
    currentFrame.selectedpoint = null;



}
