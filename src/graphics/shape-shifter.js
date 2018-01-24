const svgUtils = require('./svg-utils');
const { drawStraightPoly, drawCurvePoly, drawQuadCurvePoly } = svgUtils;

const transparent = [0, 0, 0, 0];
const config = {
    svg: null,
    width: 0,
    height: 0,
    points: [],

    numShapes: 3,

    numPoints: 4,
    maxPoints: 64,
    minPoints: 4,

    speed: 2,
    minSpeed: 1,
    maxSpeed: 10,

    colours: {
        lines: [],
        fills: [],
    },

    drawLines: [true, true, true],
    drawFills: [true, true, true],
};

const init = (svg, dimensions, numPoints) => {
    config.numPoints = numPoints || config.numPoints;

    //clone the colours array?
    if (!config.origColours) {
        config.origColours = Object.create(config.colours);
    }

    config.svg = svg;
    config.width = dimensions.width;
    config.height = dimensions.height;

    createRandomColours();
    createPoints();
};

const setNumPoints = (numPoints) => {
    config.numPoints = Math.max(
        Math.min(numPoints, config.maxPoints),
        config.minPoints
    );
    createPoints();
};

const newColours = () => createRandomColours();

const setSpeed = (speed) => {
    config.speed = Math.max(Math.min(speed, config.maxSpeed), config.minSpeed);
};

const setDrawFill = (which) => {
    which = which - 1;
    return (willDraw) => {
        config.drawFills[which] = !!willDraw;
    };
};

const setDrawLine = (which) => {
    which = which - 1;
    return (willDraw) => {
        config.drawLines[which] = !!willDraw;
    };
};

const createRandomColours = () => {
    config.colours = Object.create(config.origColours);
    for (let i = 0; i < config.numShapes; i++) {
        const line = [];
        const fill = [];

        for (let c = 0; c < 3; c++) {
            line.push(Math.round(Math.random() * 255));
            fill.push(Math.round(Math.random() * 255));
        }
        line.push(0.5);
        fill.push(0.5);
        config.colours.lines[i] = line;
        config.colours.fills[i] = fill;
    }
};

const createPoints = () => {
    config.points = [];
    for (var i = 0; i < config.numPoints; i++) {
        var xdir = Math.random(),
            ydir = Math.random();
        if (xdir < 0.5) {
            xdir = -1;
        } else {
            xdir = 1;
        }
        if (ydir < 0.5) {
            ydir = -1;
        } else {
            ydir = 1;
        }
        var point = {
            x: Math.random() * config.width,
            y: Math.random() * config.height,
            xdir: xdir,
            ydir: Math.round(Math.random() * 2) - 1,
            xinc: Math.random() * config.speed + 1,
            yinc: Math.random() * config.speed + 1,
        };
        config.points.push(point);
    }
};

const animate = () => {
    for (var i = 0; i < config.numPoints; i++) {
        var point = config.points[i];

        point.x += point.xinc * point.xdir;
        point.y += point.yinc * point.ydir;

        if (config.width < point.x) {
            point.xdir = -1;
            point.x = config.width;
            point.xinc = Math.random() * config.speed + 1;
        } else if (0 > point.x) {
            point.xdir = 1;
            point.x = 0;
            point.xinc = Math.random() * config.speed + 1;
        }

        if (config.height < point.y) {
            point.ydir = -1;
            point.y = config.height;
            point.yinc = Math.random() * config.speed + 1;
        } else if (0 > point.y) {
            point.ydir = 1;
            point.y = 0;
            point.yinc = Math.random() * config.speed + 1;
        }
    }
};

const drawSVG = () => {
    const svg = config.svg;

    //eww
    svg.innerHTML = '';

    if (config.drawFills[0] || config.drawLines[0]) {
        const fill = config.drawFills[0]
            ? config.colours.fills[0]
            : transparent;
        const stroke = config.drawLines[0]
            ? config.colours.lines[0]
            : transparent;
        drawStraightPoly(svg, config.points, fill, stroke);
    }
    if (config.drawFills[1] || config.drawLines[1]) {
        const fill = config.drawFills[1]
            ? config.colours.fills[1]
            : transparent;
        const stroke = config.drawLines[1]
            ? config.colours.lines[1]
            : transparent;
        drawCurvePoly(svg, config.points, fill, stroke);
    }

    if (config.drawFills[2] || config.drawLines[2]) {
        const fill = config.drawFills[2]
            ? config.colours.fills[2]
            : transparent;
        const stroke = config.drawLines[2]
            ? config.colours.lines[2]
            : transparent;
        drawQuadCurvePoly(svg, config.points, fill, stroke);
    }
};

module.exports = {
    init,
    newColours,
    createPoints,
    setNumPoints,
    setSpeed,
    setDrawLine,
    setDrawFill,
    drawSVG,
    animate,
};
