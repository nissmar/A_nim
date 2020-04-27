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
var animpoint = null;
var animpointlist = null;



// Background
var rect = new Path.Rectangle({
    point: [-1, -1],
    size: [view.size.width + 2, view.size.height + 2],
    strokeColor: 'white',
    strokeWidth: 0,
    selected: false,
    locked: true,
    // insert: false,
    index: -1,
});
rect.sendToBack();
rect.fillColor = '#e0e0e0';

var lay = project.activeLayer;
project.insertLayer(0, new Layer(rect));
lay.activate();

//KEY SHORTCUTS
function shortcut(event) {
    //MODIFIERS
    if (event.key == "c" && (event.modifiers.control || event.modifiers.meta)) { //backgroundcolor
        projectFrames.clipboard = [];
        for (var j = 0; j < currentFrame.selectedItems.length; j++) {
            var p = currentFrame.selectedItems[j].clone(insert = false);
            p.selected = false;
            // p.visible = false;
            // p.selected = false;
            projectFrames.clipboard.push(p);
        }
    }

    else if (event.key == "v" && (event.modifiers.control || event.modifiers.meta)) { //paste
        for (var j = 0; j < projectFrames.clipboard.length; j++) {
            // var p = projectFrames.clipboard[j];
            currentFrame.layer.addChild(projectFrames.clipboard[j].clone());
            // p.visible = true;

        }
    }

    else if (event.key == "g" && (event.modifiers.control || event.modifiers.meta)) { //group
        var g;

        var n = currentFrame.selectedItems.length;
        if (n == 1 && currentFrame.selectedItems[0].className == 'Group') { //ungroup
            g = currentFrame.selectedItems[0];
            globalFunc.emptySelectedItems(false);
            var l = g.removeChildren();
            g.parent.insertChildren(g.index, l);
            // for (var j = 0; j < l.length; j++) {
            //     currentFrame.paths.push(l[j]);
            //     // paper.project.activeLayer.addChild(p);
            // }
            g.remove();
            return;
        }

        g = new Group();
        function t(a, b) {
            return a.index >= b.index;
        }
        currentFrame.selectedItems.sort(t);

        var ind = currentFrame.selectedItems[n - 1].index;
        for (var j = 0; j < n; j++) {
            g.addChild(currentFrame.selectedItems[j]);
        }
        g.data.customID = projectFrames.ID;
        projectFrames.ID++;

        g.remove();

        currentFrame.layer.insertChild(ind - n + 1, g);

        globalFunc.emptySelectedItems(false);

        // currentFrame.selectedItems = [g];
        // createRect();
        console.log(currentFrame.layer);
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

globalFunc.emptySelectedItems = function (remove) {
    for (var j = 0; j < currentFrame.selectedItems.length; j++) {
        currentFrame.selectedItems[j].selected = false;
        if (remove) currentFrame.selectedItems[j].remove();
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
                // currentFrame.paths.push(newpath);
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


function createRectAux(items) {
    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.remove();
    }
    if (items.length != 0) {
        var bounds = items[0].bounds;
        for (var j = 1; j < items.length; j++) {
            bounds = bounds.unite(items[j].bounds);
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



function createRect() {
    createRectAux(currentFrame.selectedItems);
}

function moveRect(delta) { //delta is a point
    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.position += delta;
        moveSelectedItems(delta);
    }
}

function rotateRect(alpha, items) { //alpha is an angle
    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.rotate(alpha);
        for (var j = 0; j < items.length; j++) {
            items[j].rotate(alpha, currentFrame.rectangle.position);
        }
    }
    return alpha;
}

function scaleRect(event, origin, items) {
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

        for (var j = 0; j < items.length; j++) {
            items[j].scale(new Point(ratiox, ratioy), origin);
        }
    }
    return [new Point(ratiox, ratioy), origin];
}



function dragRect(event, items) {

    var ret0 = null;
    var ret1 = null;

    var i = currentFrame.rectangle.segments.indexOf(currentFrame.selectedpoint[0]);
    var correspondance = [5, 6, null, null, null, 0, 1];
    if (i == 0 || i == 1 || i == 5 || i == 6) {
        if (event.modifiers.command) {
            ret0 = scaleRect(event, currentFrame.rectangle.position, items);
        }
        else {
            ret0 = scaleRect(event, currentFrame.rectangle.segments[correspondance[i]].point, items);
        }

    }
    else if (i == 3) {
        var teta2 = event.point - currentFrame.rectangle.bounds.center;
        var alpha1 = (teta2 - event.delta).angle;
        var alpha2 = (teta2).angle;
        ret1 = rotateRect(alpha2 - alpha1, items);
    }
    return [ret0, ret1];
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
            globalFunc.emptySelectedItems(false);
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
        dragRect(event, currentFrame.selectedItems);
    }
}

vectorEditor.onMouseUp = function (event) {
    currentFrame.selectedpoint = null;
}

vectorEditor.onKeyDown = function (event) {

    shortcut(event);
    if (event.key == "backspace") {
        globalFunc.emptySelectedItems(true);
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
    if (hit != null) {
        if (currentFrame.selectedItems.includes(hit.item)) {
            if (hit.type == "fill") {
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
            globalFunc.emptySelectedItems(false);
            hit.item.selected = true;
            currentFrame.selectedItems.push(hit.item);
        }
    }

    else {
        globalFunc.emptySelectedItems(false);
    }



}

function movePoint(point, event) {
    var ratio;
    if (point[1] == "segment") {
        point[0].point = event.point;

    }
    else if (point[1] == "handle-in") {
        ratio = point[0].handleOut.length / point[0].handleIn.length
        point[0].handleIn += event.delta;
        if (!event.modifiers.alt) {

            point[0].handleOut.x = -ratio * point[0].handleIn.x;
            point[0].handleOut.y = -ratio * point[0].handleIn.y;
        }

    }
    else {
        ratio = point[0].handleIn.length / point[0].handleOut.length
        point[0].handleOut += event.delta;
        if (!event.modifiers.alt) {

            point[0].handleIn.x = -ratio * point[0].handleOut.x;
            point[0].handleIn.y = -ratio * point[0].handleOut.y;
        }

    }
}

pointEditor.onMouseDrag = function (event) {
    if (currentFrame.selectedpoint == null && currentFrame.selectedItems.length != 0) {
        moveSelectedItems(event.delta);
    }
    if (currentFrame.selectedpoint != null) {
        movePoint(currentFrame.selectedpoint, event);
    }
}

pointEditor.onMouseUp = function (event) {
    // currentFrame.selectedpoint = null;
}

pointEditor.onKeyDown = function (event) {
    shortcut(event);
    if (event.key == "backspace") {
        if (currentFrame.selectedpoint != null) {
            console.log('remove p ');
            currentFrame.selectedpoint[0].path.removeSegment(currentFrame.selectedpoint[0].index);
            currentFrame.selectedpoint = null;
        }
        else globalFunc.emptySelectedItems(true);
    }
}



//animator
function clearAnimator() {
    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.remove();
        currentFrame.rectangle = null;
    }
    currentFrame.selectedpoint = null;
    if (animpath != null) {
        animpath.remove();
        animpath = null;
    }
    animpoint = null;
    if (animpointlist != null) {
        for (var i = 0; i < animpointlist.length; i++) {
            if (animpointlist[i] != null) {
                console.log(animpointlist[i]);
                animpointlist[i][0].remove();
            }
            console.log(animpointlist[i]);
        }
        animpointlist = null;
    }
}

animator.onMouseDown = function (event) {
    if (animpath != null) {
        var hitOptions = {
            segments: true,
            fill: true,
            stroke: true,
            handles: true,
            tolerance: 5,
        };
        var hit = project.hitTest(event.point, hitOptions);

        if (hit != null && hit.item == animpath) {
            if (animpoint != null) {
                animpoint[0].selected = false;
                if (animpoint[1] == "segment" && animpointlist[animpoint[0].index] != null) {
                    animpointlist[animpoint[0].index][0].visible = false;

                }
                animpoint = null;
            }
            if (hit.type == "segment") {
                animpoint = [hit.segment, hit.type];
                animpoint[0].selected = true;
                var ind = hit.segment.index;
                if (animpointlist[ind] == null) {
                    console.log("point");

                    var g = new Group();
                    for (var i = 0; i < currentFrame.selectedItems.length; i++) {
                        g.addChild(currentFrame.selectedItems[i].clone());
                    }
                    g.position = hit.segment.point;
                    g.opacity = 0.5;
                    animpath.bringToFront();
                    animpointlist[ind] = [g, 0];

                    createRectAux([g]);
                }
                else {
                    animpointlist[ind][0].visible = true;
                }
            }
            else if (hit.type == "handle-in" || hit.type == "handle-out") {
                animpoint = [hit.segment, hit.type];
                hit.segment.selected = true;
                if (currentFrame.rectangle != null) {
                    currentFrame.rectangle.remove();
                    currentFrame.rectangle = null;
                }
            }
            else if (hit.type == "stroke") {
                if (currentFrame.rectangle != null) {
                    currentFrame.rectangle.remove();
                    currentFrame.rectangle = null;
                }

                var curve = hit.location._curve;
                var p0 = curve.divideAt(curve.getLocationOf(hit.point))._segment1;

                animpoint = [p0, "segment"];
                animpoint[0].selected = true;
                var g = new Group();
                for (var i = 0; i < currentFrame.selectedItems.length; i++) {
                    g.addChild(currentFrame.selectedItems[i].clone());
                }
                g.position = hit.point;
                g.opacity = 0.5;
                animpath.bringToFront();
                animpointlist[p0.index] = [g, 0];

                createRectAux([g]);
            }
        }
        else if (hit != null && hit.item == currentFrame.rectangle) {
            if (hit.type == "segment") currentFrame.selectedpoint = [hit.segment, null];
        }

        else if (hit != null && animpoint != null) {

        }
        else {
            clearAnimator();
        }
    }
    if (animpath == null && currentFrame.selectedItems.length != 0) {
        animpath = new Path();
        animpath.fullySelected = true;
        animpath.strokeColor = 'black';

    }
}


animator.onMouseDrag = function (event) {
    if (animpoint != null) {
        var ind = animpoint[0].index;
        if (currentFrame.selectedpoint != null && currentFrame.rectangle != null) {
            var teta2 = event.point - currentFrame.rectangle.bounds.center;
            var alpha1 = (teta2 - event.delta).angle;
            var alpha2 = (teta2).angle;
            animpointlist[ind][1] += rotateRect(alpha2 - alpha1, [animpointlist[ind][0]]);
        }
        else {
            movePoint(animpoint, event);
            if (currentFrame.rectangle != null) currentFrame.rectangle.position = event.point;
            if (animpoint[1] == "segment") {
                if (animpointlist[ind] != null) {
                    animpointlist[ind][0].position = event.point;
                }
            }
        }
    }
    else if (animpath != null) {
        animpath.add(event.point);
    }
}


animator.onMouseUp = function (event) {
    currentFrame.selectedpoint = null;
    if (animpointlist == null && animpath != null) {
        animpointlist = [];


        animpath.simplify(100);
        for (var i = 0; i < animpath.segments.length; i++) animpointlist.push(null);
    }


}

animator.onKeyDown = function (event) {
    if (event.key == "backspace") {
        if (animpoint != null) {
            animpointlist[animpoint[0].index][0].remove();
            animpointlist.splice(animpoint[0].index, 1);
            animpath.removeSegment(animpoint[0].index);
            animpoint = null;
            if (currentFrame.rectangle != null) {
                currentFrame.rectangle.remove();
                currentFrame.rectangle = null;
            }
        }

    }
    else if (event.key == "enter" && animpath != null) {
        for (var i = 0; i < animpointlist.length; i++) {
            if (animpointlist[i] != null) {
                animpointlist[i][0].remove();
            }
        }
        if (animpointlist[0] == null) {
            animpointlist[0] = [new Path(), 0];
        }
        var k = 1;
        var j = k;
        var ref;
        while (k < animpointlist.length) {
            j = k;
            while (j < animpointlist.length && animpointlist[j] == null) j++;
            if (j == animpointlist.length) ref = animpointlist[k - 1][1];
            else ref = animpointlist[j][1];

            for (var i = k; i < j; i++) {
                var x = (i + 1 - k) / (j - k + 1);
                console.log(x,animpointlist[k - 1][1],ref);
                animpointlist[i] =  [new Path(),(1-x) * animpointlist[k - 1][1] + x * ref];
            }
            k = j + 1;
        }

        animpath.remove();
        var selectedID = [];
        var animpaths = [];
        var framen = projectFrames.currentN;

        console.log('animating : ', animpointlist);

        for (var i = 0; i < currentFrame.selectedItems.length; i++) {
            selectedID.push(currentFrame.selectedItems[i].data.customID);
            animpaths.push(currentFrame.selectedItems[i]);


        }
        // console.log("IDs ", selectedID);
        var indrot;
        var rot = 0;

        var delta;
        for (var i = 1; i < projectFrames.frameCount; i++) {
            var loc = animpath.getLocationAt(i * animpath.length / projectFrames.frameCount).point;
            delta = loc - animpath.getLocationAt(0).point;

            indrot = animpath.getLocationOf(loc)._segment1.index;

            var x = animpath.getLocationOf(loc)._time;
            rot = (1-x) * animpointlist[indrot][1] + x * animpointlist[indrot + 1][1];
            console.log("rot", rot,animpointlist[indrot][1],animpointlist[indrot+1][1]);

            if (projectFrames.currentN < projectFrames.frames.length - 1) {
                document.getElementById('nextFrame').click();
            }
            else {
                document.getElementById('newFrame').click();
            }

            var ind;
            for (var j = 0; j < currentFrame.layer.children.length; j++) {
                ind = selectedID.indexOf(currentFrame.layer.children[j].data.customID);
                if (ind != -1) currentFrame.layer.children[j].remove();
            }

            for (var j = 0; j < selectedID.length; j++) {
                var p = animpaths[j].clone(insert = false);
                currentFrame.layer.insertChild(p.index, p);
                p.position += delta;
                p.rotate(rot);
            }
        }
        projectFrames.currentN = framen - 1;
        document.getElementById('nextFrame').click();
        globalFunc.emptySelectedItems(false);
        clearAnimator();

    }

    else {
        shortcut(event);
    }
}

activateVC = activateVectorCreator;
function activateVectorCreator() {
    vectorCreator.activate();
    clearAnimator();
    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.remove();
        currentFrame.rectangle = null;
        globalFunc.emptySelectedItems(false);
        currentFrame.selectedpoint = null;
    }
}

activateVE = activateVectorEditor;
function activateVectorEditor() {
    vectorEditor.activate();
    clearAnimator();
    if (currentFrame.selectedItems.length != 0) {
        createRect();
    }
}

activatePE = activatePointEditor;

function activatePointEditor() {
    pointEditor.activate();
    clearAnimator();
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

