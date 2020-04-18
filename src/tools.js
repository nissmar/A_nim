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
    size: [view.size.width+2, view.size.height+2],
    strokeColor: 'white',
    selected: false,
    locked: true,
});
rect.sendToBack();
rect.fillColor = '#e0e0e0';

//KEY SHORTCUTS
function shortcut(event) {
    // console.log('shortcut');
    if (event.key == "a") {
        document.getElementById('PE').click();

    }
    else if (event.key == "v") {
        document.getElementById('VE').click();

    }
    else if (event.key == "p") {
        document.getElementById('VC').click();
    }
    else if (event.key == "space") {
        if (projectFrames.currentN == projectFrames.frames.length-1) {
            document.getElementById('newFrame').click();

        }
        else {
            document.getElementById('nextFrame').click();

        }
    }
    else if (event.key == "enter") {
        document.getElementById('play').click();
    }

    else if (event.key == "backspace" && currentFrame.currentPath == null) {
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
    // currentFrame.paths.push(path);
    // currentFrame.currentPath = path;
    return path;
}

function closePath(path) {
    path.closed = true;
    path.fullySelected = false;
    path.fillColor = currentStyle.fillColor;
    path.strokeWidth = currentStyle.strokeWidth;
}

//vector creator
vectorCreator.onMouseDown = function(event) {
    if (newpath == null) {
        newpath = createPath();
        newpath.add(event.point);
    }
    else {
        if (newpath.segments.length > 0) {
            if ( (event.point - newpath.segments[0].point).length < mindistance) {
                closePath(newpath);
                currentFrame.paths.push(newpath);
                currentFrame.currentPath = new Group([newpath]);
                newpath = null;
            }
            else newpath.add(event.point);
        }
        else newpath.add(event.point);
    }
    

}


vectorCreator.onMouseDrag = function(event) {
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
vectorCreator.onKeyDown = function(event) {
    shortcut(event);
}

//vector Editor


function createRect(item) {
    //creating bouding rect
    bounds = item.bounds;
    b = bounds.clone().expand(10,10);
    currentFrame.rectangle = new Path.Rectangle(b);
    currentFrame.rectangle.pivot = currentFrame.rectangle.position;
    currentFrame.rectangle.insert(2, new Point(b.center.x, b.top));
    currentFrame.rectangle.insert(2, new Point(b.center.x, b.top-25));
    currentFrame.rectangle.insert(2, new Point(b.center.x, b.top));
    currentFrame.rectangle.position = item.bounds.center;
    currentFrame.rectangle.rotation = item.rotation;
    currentFrame.rectangle.scaling = item.scaling;
    currentFrame.rectangle.strokeWidth = 1;
    currentFrame.rectangle.strokeColor = 'blue';
    currentFrame.rectangle.name = "selection rectangle";
    currentFrame.rectangle.selected = true;
    currentFrame.rectangle.ppath = item;
    currentFrame.rectangle.ppath.pivot = currentFrame.rectangle.pivot;

}


vectorEditor.onMouseDown = function(event) {

    var hitOptions = {
        segments: true,
        stroke: true,
        // class: Group,
        handles : false,
        fill: true,
        tolerance: 5,
    };
    var hit = project.hitTest(event.point, hitOptions);
    console.log(hit);
    if (currentFrame.currentPath != null) {
        if (event.modifiers.shift) {
            if (hit != null) {
                currentFrame.currentPath.addChild(hit.item);
                currentFrame.rectangle.remove();
                createRect(currentFrame.currentPath);
            }
           
        }
        else if (hit != null && hit.item == currentFrame.rectangle && hit.type=="segment") {
            currentFrame.selectedpoint = [hit.segment,null];
        }
        
        else if (!currentFrame.currentPath.contains(event.point)) {
            // if (hit != null) {
            //     //A COMPLETER
            // }
            currentFrame.currentPath = null;
            currentFrame.selectedpoint = null;
            currentFrame.rectangle.remove();
            currentFrame.rectangle = null;
        }
    }
    else {
        if (hit != null) {
            console.log(hit.item.index);
            currentFrame.currentPath =  new Group();
            currentFrame.currentPath.addChild(hit.item);
            console.log(hit.item.index);
            currentFrame.selectedpoint = null;
            createRect(currentFrame.currentPath);
           
        }
    }
  

   
}

function scaleCurrentPath(origin, event) {
    var c = event.point;
    var d = event.delta;
    if ((c-d-origin).x*(c-origin).x>0 && (c-d-origin).y*(c-origin).y>0) {
        var ratiox = (c-origin).x / (c-d-origin).x;
        var ratioy = (c-origin).y / (c-d-origin).y;
        currentFrame.rectangle.scale(new Point(ratiox,ratioy),  origin);
        currentFrame.rectangle.ppath.scale(new Point(ratiox,ratioy),  origin);
    }
}

vectorEditor.onMouseDrag = function(event) {

    if (Key.isDown('s') && currentFrame.currentPath != null) {
        currentStyle.strokeWidth += event.delta.x/3;
        currentFrame.currentPath.strokeWidth = currentStyle.strokeWidth ;
    }
    // else if (Key.isDown('r') && currentFrame.currentPath != null) {
    //     for (var i=0; i<currentFrame.currentPath.segments.length;i++) {
    //         currentFrame.currentPath.segments[i].point += (new Point(0.5,0.5) - Point.random())*event.delta.x;
    //         // currentFrame.currentPath.segments[i].point.handleIn += (new Point(0.5,0.5) - Point.random())*10000*event.delta.x;
    //         // currentFrame.currentPath.segments[i].point.handleOut += (new Point(0.5,0.5) - Point.random())*event.delta.x;
    //     }
    // }
    else if (currentFrame.selectedpoint == null && currentFrame.rectangle != null) {
        currentFrame.rectangle.position += event.delta;
        currentFrame.currentPath.position += event.delta;
    }
    else if (currentFrame.selectedpoint != null) {
        var i = currentFrame.rectangle.segments.indexOf(currentFrame.selectedpoint[0]);
    
        var correspondance = [5,6,null,null,null,0,1];
        if (i==0 || i==1 || i==5 || i==6) {
            if (event.modifiers.command) {
                scaleCurrentPath(currentFrame.rectangle.position,event);
            }
            else {
                scaleCurrentPath(currentFrame.rectangle.segments[correspondance[i]].point,event);
            }
            
        }
        else if (i==3) {
            var teta2 = event.point - currentFrame.rectangle.bounds.center;
            var alpha1 = (teta2 - event.delta).angle;
            var alpha2 = (teta2).angle;
            // console.log(event.delta);
            // console.log(currentFrame.currentPath);
            currentFrame.rectangle.rotate(alpha2- alpha1);
            currentFrame.rectangle.ppath.rotate(alpha2- alpha1);
        }
    }
}

vectorEditor.onMouseUp = function(event) {
    currentFrame.selectedpoint = null;
}

vectorEditor.onKeyDown = function(event){

    shortcut(event);
    if (event.key == "backspace") {
        if (currentFrame.selectedpoint == null && currentFrame.currentPath != null) {
            // console.log(currentFrame.paths.indexOf(currentFrame.currentPath)-1);
            currentFrame.paths.splice(currentFrame.paths.indexOf(currentFrame.currentPath),1);
            currentFrame.currentPath.remove();
            currentFrame.currentPath = null;
            currentFrame.rectangle.remove();
            currentFrame.rectangle = null;

        }
    }
    else if (event.key == "=") {
        if (currentFrame.currentPath != null) {
            currentFrame.currentPath.bringToFront();
        }
    }
    else if (event.key == "-") {
        if (currentFrame.currentPath != null) {
            currentFrame.currentPath.sendToBack();
            rect.sendToBack();
        }
    }
    
}



//point Editor
pointEditor.onMouseDown = function(event) {
    var hitOptions = {
        segments: true,
        stroke: true,
        handles : true,
        fill: true,
        tolerance: 5,
    };
    var hit = project.hitTest(event.point, hitOptions);
    console.log(hit);
    if (hit != null) {
        if (hit.type == "fill") {
            if (currentFrame.selectedpoint != null) {
                currentFrame.selectedpoint[0].selected = false;
                currentFrame.selectedpoint = null;
            }
            if (currentFrame.currentPath != null) {
                currentFrame.currentPath.selected = false;
            }
            currentFrame.currentPath = new Group([hit.item]);
            currentFrame.currentPath.selected = true;
        }
        else if (hit.type == "segment" || hit.type == "handle-in" || hit.type == "handle-out") {
            if (currentFrame.currentPath != null) {
                if (currentFrame.selectedpoint != null) {
                    currentFrame.selectedpoint[0].selected = false;
                }
                currentFrame.selectedpoint = [hit.segment, hit.type];
                hit.segment.selected =true;
            }


        }
        else if (hit.type == "stroke") { 
            if (currentFrame.selectedpoint != null) {
                currentFrame.selectedpoint[0].selected = false;
                currentFrame.selectedpoint = null;
            }
            if (currentFrame.currentPath != null) {
                var curve = hit.location._curve;
                curve.divideAt(curve.getLocationOf(hit.point));
            }             
        }
    }
    
    else {
        if (currentFrame.currentPath != null) {
            currentFrame.currentPath.fullySelected = false;
            currentFrame.selectedpoint = null;
            currentFrame.currentPath = null;
        }
    }
  
    
   
}


pointEditor.onMouseDrag = function(event) {
    if (currentFrame.selectedpoint == null && currentFrame.currentPath!=null) {
        currentFrame.currentPath.position += event.delta;
    }
    if (currentFrame.selectedpoint !=null) {
        var ratio;
        if (currentFrame.selectedpoint[1] == "segment") {
            currentFrame.selectedpoint[0].point = event.point;
        }
        else if (currentFrame.selectedpoint[1] == "handle-in") {
            ratio = currentFrame.selectedpoint[0].handleOut.length / currentFrame.selectedpoint[0].handleIn.length
            currentFrame.selectedpoint[0].handleIn += event.delta;
            if (!event.modifiers.alt) {
                
                currentFrame.selectedpoint[0].handleOut.x =  -ratio*currentFrame.selectedpoint[0].handleIn.x;
                currentFrame.selectedpoint[0].handleOut.y =  -ratio*currentFrame.selectedpoint[0].handleIn.y;
            }
            
        } 
        else {
            ratio = currentFrame.selectedpoint[0].handleIn.length / currentFrame.selectedpoint[0].handleOut.length
            currentFrame.selectedpoint[0].handleOut += event.delta;
            if (!event.modifiers.alt) {
                
                currentFrame.selectedpoint[0].handleIn.x =  -ratio*currentFrame.selectedpoint[0].handleOut.x;
                currentFrame.selectedpoint[0].handleIn.y =  -ratio*currentFrame.selectedpoint[0].handleOut.y;
            }
            
        } 
 
    }
}

pointEditor.onMouseUp = function(event) {
    // currentFrame.selectedpoint = null;
}

pointEditor.onKeyDown = function(event){
    shortcut(event);
    if (event.key == "backspace") {
        console.log(currentFrame.selectedpoint);
        if (currentFrame.selectedpoint != null) {
            currentFrame.selectedpoint[0].path.removeSegment(currentFrame.selectedpoint[0].index);
        }
        else if (currentFrame.currentPath != null) {
            // console.log(currentFrame.paths.indexOf(currentFrame.currentPath)-1);
            currentFrame.paths.splice(currentFrame.paths.indexOf(currentFrame.currentPath),1);
            currentFrame.currentPath.remove();
            currentFrame.currentPath = null;
            currentFrame.rectangle.remove();
            currentFrame.rectangle = null;
    
        }
    }
}



//animator
animator.onMouseDown = function(event) {
    console.log('current Path : ', currentFrame.currentPath.children);

    if (animpath != null) {
        animpath.remove();
    }
    if (currentFrame.currentPath != null) {
        animpath = new Path();
        animpath.fullySelected = true;    
        animpath.strokeColor = 'black';
        
    }

   

}


animator.onMouseDrag = function(event) {
    if (animpath != null) {
        animpath.add(event.point);
    }

}


animator.onMouseUp = function(event) {
    if (animpath != null) {
        var index = [];
        var animpaths = [];

        console.log('animating : ');

        // console.log('current Path : ', currentFrame.currentPath);
        console.log('paths : ', currentFrame.paths);
        for (var i=0; i<currentFrame.currentPath.children.length;i++) {
            index.push(currentFrame.paths.indexOf(currentFrame.currentPath.children[i]));
            animpaths.push(currentFrame.currentPath.children[i]);

            
        }
        console.log(animpaths);
        animpath.simplify(100);
        for (var i=1;i<10;i++){

            if (projectFrames.currentN<projectFrames.frames.length-1) {
                console.log('next');
                document.getElementById('nextFrame').click();
                var npath = null;
                for (var j=0; j<animpaths.length;j++) {
                    npath = animpaths[j].clone()
                    currentFrame.paths.push(npath);

                    animpaths[j] = npath;
                }
            }
            else {
                
                document.getElementById('newFrame').click();
                for (var j=0; j<animpaths.length;j++) {
                    animpaths[j] = currentFrame.paths[index[j]];
                }
            }
            
            for (var j=0; j<index.length;j++) {
                console.log('j',index[j], currentFrame.paths);
                // currentFrame.paths[index[j]].position += animpath.getLocationAt(i*animpath.length/10).point-animpath.getLocationAt((i-1)*animpath.length/10).point;
                animpaths[j].position += animpath.getLocationAt(i*animpath.length/10).point-animpath.getLocationAt((i-1)*animpath.length/10).point;

            }
        }
        animpath.remove();
        animpath = null;
    }
}

animator.onKeyDown = function(event) {
    shortcut(event);
}

activateVC = activateVectorCreator;
function activateVectorCreator(){
    vectorCreator.activate();
    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.remove();
        currentFrame.rectangle = null;
        currentFrame.currentPath = null;
        currentFrame.selectedpoint = null;
    }
}

activateVE = activateVectorEditor;
function activateVectorEditor(){
    vectorEditor.activate();
    if (currentFrame.currentPath != null) {
        currentFrame.currentPath.fullySelected = false;
        // currentFrame.currentPath = null;
        currentFrame.selectedpoint = null;
        createRect(currentFrame.currentPath);
    }
}

activatePE = activatePointEditor;

function activatePointEditor(){
    pointEditor.activate();
    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.remove();
        currentFrame.rectangle = null;
        currentFrame.currentPath.selected = true;
        currentFrame.selectedpoint = null;
    }
}


activateA = activateAnimator;

function activateAnimator(){
    animator.activate();
    if (currentFrame.rectangle != null) {
        currentFrame.rectangle.remove();
        currentFrame.rectangle = null;
        // currentFrame.currentPath = null;
    }
    console.log('current Path : ', currentFrame.currentPath);
    currentFrame.selectedpoint = null;
    if (currentFrame.currentPath != null) {
        currentFrame.currentPath.selected = true;
    }
   

}
