
    // globals (some could likely be encapsulated elsewhere)
    var master;
var pegMgr;
var pegProjectileMgr;

// config
var laserVelocity = [50, 0];
var heroMovementScale = 5;
var numClouds = 9;
var drawingEnabled = true;
var loggingEnabled = false;
var invertColor = false;
var drawIntervalMillis = 50;
var renderByJs = false;

function doDrawImage(mgr) {
    if (renderByJs) {
        doJsDrawImage(mgr.x, mgr.y, mgr.jsSrc);
    } else {
        doTagDrawImage(mgr.x, mgr.y, mgr.tagId);
    }
}

function doJsDrawImage(x, y, src) {
    var a_canvas = getCanvas()
    var a_context = a_canvas.getContext("2d");
    var item = new Image();
    item.src = src;
    // TODO: refactor
    if (!invertColor) {
        a_context.drawImage(item, x, y);
    } else {
        drawImageOnCanvasInvert(a_context, item, x, y);
    }
}

function doTagDrawImage(x, y, src) {
    var a_canvas = getCanvas()
    var a_context = a_canvas.getContext("2d");
    var item = document.getElementById(src);
            
    // TODO: refactor
    if (!invertColor) {
        a_context.drawImage(item, x, y);
    } else {
        drawImageOnCanvasInvert(a_context, item, x, y);
    }
}

function drawImageOnCanvasInvert(a_context, item, x, y)
{
    a_context.drawImage(item, x, y);

    var imageData = a_context.getImageData(x, y, item.width, item.height);
    var data = imageData.data;

    for (var i = 0; i < data.length; i += 4) {
        // red
        data[i] = 255 - data[i];
        // green
        data[i + 1] = 255 - data[i + 1];
        // blue
        data[i + 2] = 255 - data[i + 2];
    }

    // overwrite original image
    a_context.putImageData(imageData, x, y);
}

function clearCanvas() {
    var a_canvas = getCanvas();
    a_canvas.width = a_canvas.width;
}



// TODO: consider refactoring these mgr classes (looks like common type interface)

function CanvasMaster() {
    this.heroMgr = createInitialPegasusManager();
    var assetMgrs = [];
    createInitalCloudManagers().forEach(function(e){
        assetMgrs.push(e);
    });
    createIndicatorManagers().forEach(function (e) {
        assetMgrs.push(e);
    });

    this.assetMgrs = assetMgrs;
}

function AssetManager(x, y, jsSrc, name, tagId) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.jsSrc = jsSrc;
    this.tagId = tagId;
}

// TODO: consider moving velocity to class/object
function ProjectileManager(x, y, velocity, jsSrc, name, tagId) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.velocity = velocity; // hmmm...
    this.jsSrc = jsSrc;
    this.tagId = tagId;
}

// adjust the position of assetMgrOne and/or assetMgrTwo depending on the types
// ... could be moved to strategy pattern (for this game implementation) ...
function SetRelationalPositionTwo(assetMgrOne, assetMgrTwo) {
    // if moved to other class...
    //this.assetMgrOne = assetMgrOne;
    //this.assetMgrTwo = assetMgrTwo;

    if (assetMgrOne.name && assetMgrOne.name == 'Pegasus'
        && assetMgrTwo.name && assetMgrTwo.name == 'laser'){
                
        assetMgrTwo.x = assetMgrOne.x + 103;
        assetMgrTwo.y = assetMgrOne.y + 35;
    }
}

// adjust the position of assetMgrOne and/or assetMgrTwo depending on the types
// ... could be moved to strategy pattern (for this game implementation) ...
function SetRelationalPosition(assetMgr) {
    // if moved to other class...
    //this.assetMgrOne = assetMgrOne;
    //this.assetMgrTwo = assetMgrTwo;

    // TODO: work on this
    if (assetMgr.name && assetMgr.name == 'cloud'
        && !isInsideCanvas(assetMgr)) {
        var canvas = getCanvas();
        var xY = getRandomXyFromCanvas();
        assetMgr.x = canvas.width;
        assetMgr.y = xY[1];
    }
}

function isInsideCanvas(assetMgr) {
    var canvas = getCanvas();

    log([assetMgr.x, assetMgr.y] + " " + [canvas.width, canvas.height]);

    // TODO: may need to add height, width to assetMgr class,
    // this only checks x,y position of asset in relation to canvas
    return assetMgr.x <= canvas.width
        && assetMgr.x >= 0
        && assetMgr.y <= canvas.height
        && assetMgr.y >= 0;
}

function createInitialPegasusManager() {
    return new AssetManager(0, 0, "_ui/images/Sprites/PegMedium.png", "Pegasus", "pegImg");
}

function createInitalLaserManager() {
    // TODO: consider drawing a line (rather than an image),
    // may be more efficient
    return new ProjectileManager(0, 0, laserVelocity, "_ui/images/Sprites/lasersmall.png", "laser", "laser");
}

function createInitialCanvasMaster() {
    var result = new CanvasMaster();
    result.heroMgr = createInitialPegasusManager();
    return result;
}

function createInitalCloudManagers() {
    var result = [];

    for(var i = 1; i <= numClouds; i++)
    {
        var src = "_ui/images/Sprites/Cloud" + i + "_resized.png";
        var tag = "cloud" + i;
        var velocity = [-Math.random() - 1, 0];
        var initialPosition = getRandomXyFromCanvas();
        result.push(new ProjectileManager(initialPosition[0], initialPosition[1], velocity, src , "cloud", tag));
    }

    return result;
}

function createIndicatorManagers() {
    var result = [];

    //result.push(new AssetManager(200, 200, "_ui/images/Sprites/LifeInd.png", "lifeInd", "lifeInd"));

    return result;
}

function getCanvas()
{
    return document.getElementById('a');
}

function getRandomXyFromCanvas() {
    var a_canvas = getCanvas();
    return [Math.random() * a_canvas.width, Math.random() * a_canvas.height];
}

// x is horizontal shift, y the vertical
function move(mgr, x, y) {
    mgr.x += x;
    mgr.y += y;
}

function log(str) {
    if (loggingEnabled) {
        console.log(str);
    }
}

function setStateMessages()
{
    $('#drawingState').text(drawingEnabled);
    $('#loggingState').text(loggingEnabled);
    $('#invertColor').text(invertColor);
}

$(document).ready(function () {

    master = createInitialCanvasMaster();
    pegMgr = createInitialPegasusManager();
    pegProjectileMgr = createInitalLaserManager();
    setStateMessages();

    // Rendering block
    setInterval(function () {
        if (!drawingEnabled) {
            return;
        }

        clearCanvas();

        // draw hero
        //log([master.heroMgr.x, master.heroMgr.y] + " " + master.heroMgr.src);
        doDrawImage(master.heroMgr);

        // TODO: hit detection...
        master.assetMgrs.forEach(function (item) {
            //log([item.x, item.y] + " " + item.src);

            SetRelationalPosition(item);

            // TODO: detect when off canvas
            if (item.velocity) {
                move(item, item.velocity[0], item.velocity[1]);
            }

            doDrawImage(item);
        });
    }, drawIntervalMillis);

    $(document).keydown(function (e) {

        // TODO: may need to move this checking into 
        // rendering area, two buttons cannot be held at once
        // w/ any effectiveness in the game

        switch (e.keyCode) {
            // hero movement
            case 37: // left
                move(master.heroMgr, -heroMovementScale, 0);
                break;
            case 39: // right
                move(master.heroMgr, heroMovementScale, 0);
                break;
            case 38: // up
                move(master.heroMgr, 0, -heroMovementScale);
                break;
            case 40: // down
                move(master.heroMgr, 0, heroMovementScale);
                break;

                // non-hero actions
            case 32: // space
                // TODO: figure out how to determine initial position
                // of projectile

                var projectile = createInitalLaserManager();
                SetRelationalPositionTwo(master.heroMgr, projectile);
                master.assetMgrs.push(projectile);
                break;

                // settings
            case 27: // esc
                drawingEnabled = !drawingEnabled;
                setStateMessages();
                break;
            case 76:
                loggingEnabled = !loggingEnabled;
                setStateMessages();
                break;
            case 73:
                invertColor = !invertColor;
                setStateMessages();
                break;
        }

    });
});
