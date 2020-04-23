
# A_nim

<img src="A_nim.gif">


This a project I developped on my spare time. Based on Paper.js, it allows the user to create custom gifs using vector graphics.

## Tools

### Pen  

Use it to draw a new shape with Bezier Curves.

### Shape Editor 

Use it to move, resize and rotate a shape.

### Node Editor

Use it to adjust the individual nodes of a shape. 

### Sync

Use it to add/modify the selected item on all frames.


### Animator 

Use it to move the selected shape along a path drawn when clicking and dragging.

### Fill and Stroke color selectors 

Use them to apply custom colors.

### SVG Loader

Use it to import a .svg file into the current project.

### GIF Creator

Use it to compile your project into a GIF.


## Shortcuts

Shortcuts can be pretty useful when working with A_nim:

- P : Pen tool
- V : Shape Editor tool
- A : Node Editor tool
- S + Mouse Drag : changes the stroke width (only available with the Shape Editor tool activated)
- B : Change the background color to current fill color
- CTRL + G : Group/Ungroup selection
- CTRL + C/V : Copy/Paste
- Delete : Jump to first frame
- Space : Jump to next frame
- Enter : Play GIF



## Installation

First download the `.zip` file. Then in your terminal type:

```shell
$ cd Downloads/A_nim-master
```

You have to setup a local server in order to run A_nim. Try:
```shell
$ php -S localhost:8000
```
or :

```shell
$ python -m SimpleHTTPServer
```


Next, go to `http://localhost:8000` in your favorite web browser and enjoy!
