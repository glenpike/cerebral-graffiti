const QuickSettings = require('quicksettings');
const ShapeShifter = require('./graphics/gabo-shifter');

//Create svg
//Create element for drawing (if it doesn't exist?)
//Save a reference

//Create some points

//Pass to the drawing function

//animate

//repeat drawing

//Settings object
const getDimensions = (el) => {
    let dimensions = null;
    if (el) {
        dimensions = {
            width: el.width.baseVal.value | 0,
            height: el.height.baseVal.value | 0,
        };
    }
    console.log('dimensions ', dimensions);
    return dimensions;
};

const defaultSettings = {
    numPoints: 64,
    speed: 5,
    outline1: true,
    fill1: false,
    outline2: true,
    fill2: false,
    outline3: true,
    fill3: true,
};

const panelContainer = document.querySelector('.js-controls');
const svgContainer = document.querySelector('.js-cerebral');
const dimensions = getDimensions(svgContainer);

ShapeShifter.init(svgContainer, dimensions, defaultSettings.numPoints);

QuickSettings.useExtStyleSheet();
const settings = QuickSettings.create(0, 0, 'Play', panelContainer);
settings.addButton('New Shape', () => ShapeShifter.createPoints());
settings.addDropDown('Points', [4, 8, 16, 32, 64], (obj) =>
    ShapeShifter.setNumPoints(+obj.value)
);
settings.addNumber('Speed', 1, 100, 5, 1, ShapeShifter.setSpeed);

settings.addBoolean('Outline 1', true, ShapeShifter.setDrawLine(1));
settings.addBoolean('Fill 1', false, ShapeShifter.setDrawFill(1));
settings.addBoolean('Outline 2', true, ShapeShifter.setDrawLine(2));
settings.addBoolean('Fill 2', false, ShapeShifter.setDrawFill(2));
settings.addBoolean('Outline 3', true, ShapeShifter.setDrawLine(3));
settings.addBoolean('Fill 3', true, ShapeShifter.setDrawFill(3));

settings.addButton('New Colours', ShapeShifter.newColours);

// settings.setValuesFromJSON(defaultSettings);

settings.setDraggable(true);
settings.setCollapsible(true);

setInterval(function() {
    ShapeShifter.drawSVG();
    ShapeShifter.animate();
}, 50);
