const svgUtils = require('./svg-utils');
const { drawStraightPoly, drawCurvePoly, drawQuadCurvePoly, drawSVGElem, drawSVGCircle } = svgUtils;

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
    drawFills: [false, false, true],
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
const DEG_2_RAD = Math.PI / 180;
const RAD_2_DEG = 180 / Math.PI;

const createRandomColours = () => {
    config.colours = Object.create(config.origColours);
    for (let i = 0; i < config.numShapes; i++) {
        const line = [];
        const fill = [];

        for (let c = 0; c < 3; c++) {
            line.push(Math.round(Math.random() * 255));
            fill.push(Math.round(Math.random() * 255));
        }
        line.push(i === 0 ? 0.75 : 0.5);
        fill.push(0.3);
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

const pointsToSpine = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return {
        r: Math.sqrt(dx * dx + dy * dy),
        theta: Math.atan2(dy, dx) * RAD_2_DEG,
        offset: {
            x: p1.x,
            y: p1.y,
        },
    };
};

const pointsToSpines = (points) => {
    const spines = [];
    for (let i = 0; i < config.points.length; i+=2) {
        const p1 = config.points[i+1];
        const p2 = config.points[i];
        const p3 = config.points[(i+2)%config.points.length];
        spines.push(pointsToSpine(p1, p2));
        spines.push(pointsToSpine(p1, p3));
    }
    return spines;
};


const drawMeshPoly = (svg, spine1, spine2, fill, stroke) => {
    const { offset } = spine1;
    let pointsStr = `M ${offset.x} ${offset.y} `;
    let x = 0;
    let y = config.numPoints - 1;
    const step1 = spine1.r / config.numPoints;
    const step2 = spine2.r / config.numPoints;
    let pos1 = 0;
    let pos2 = spine2.r;
    const angle1 = spine1.theta * DEG_2_RAD;
    const angle2 = spine2.theta * DEG_2_RAD;
    // loop through n points.
    for (let i = 0; i < config.numPoints - 1; i += 2) {
        // up along to 'first' point on axis 1
        pos1 += step1;
        pointsStr += `L ${pos1 * Math.cos(angle1) + offset.x} ${pos1 *
            Math.sin(angle1) +
            offset.y} `;
        // to 'last' point on axis 2
        pointsStr += `L ${pos2 * Math.cos(angle2) + offset.x} ${pos2 *
            Math.sin(angle2) +
            offset.y} `;
        pos2 -= step2;
        // to 'penultimate' point on axis 2
        pointsStr += `L ${pos2 * Math.cos(angle2) + offset.x} ${pos2 *
            Math.sin(angle2) +
            offset.y} `;
        pos1 += step1;
        // to '2nd' point on axis 1
        pointsStr += `L ${pos1 * Math.cos(angle1) + offset.x} ${pos1 *
            Math.sin(angle1) +
            offset.y} `;
        pos2 -= step2;
    }
    // pos1 += step1;
    // pointsStr += `L ${pos1 * Math.cos(angle1) + offset.x} ${pos1 *
    //     Math.sin(angle1) +
    //     offset.y} `;
    pointsStr += `L ${pos2 * Math.cos(angle2) + offset.x} ${pos2 *
        Math.sin(angle2) +
        offset.y} `;

    let path = drawSVGElem(fill, stroke, pointsStr, 'path');
    svg.appendChild(path);
    pointsStr = `M ${offset.x} ${offset.y} `;
    const p1 = {
        x: spine1.r * Math.cos(angle1) + offset.x,
        y: spine1.r * Math.sin(angle1) + offset.y,
    };
    pointsStr += `L ${p1.x} ${p1.y} `;
    pointsStr += `L ${spine1.r * Math.cos(angle1) + offset.x} ${spine1.r *
        Math.sin(angle1) +
        offset.y} `;
    path = drawSVGElem(fill, stroke, pointsStr, 'path');
    svg.appendChild(path);
    pointsStr = `M ${offset.x} ${offset.y} `;
    const p2 = {
        x: spine2.r * Math.cos(angle2) + offset.x,
        y: spine2.r * Math.sin(angle2) + offset.y,
    };
    pointsStr += `L ${p2.x} ${p2.y} `;
    path = drawSVGElem(fill, stroke, pointsStr, 'path');
    svg.appendChild(path);

    if (config.debug) {
        path = drawSVGCircle([0xff, 0, 0xff, 0.5], [0, 0, 0, 0], offset, 5);
        svg.appendChild(path);
        path = drawSVGCircle([0, 0, 0xff, 0.5], [0, 0, 0, 0], p1, 5);
        svg.appendChild(path);
        path = drawSVGCircle([0xff, 0xff, 0, 0.5], [0, 0, 0, 0], p2, 5);
        svg.appendChild(path);
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
        const spines = pointsToSpines(config.points);
        for (let i = 0; i < spines.length; i+=2) {
            const spine1 = spines[i];
            const spine2 = spines[(i + 1) % spines.length];
            drawMeshPoly(svg, spine1, spine2, fill, stroke);
        }
    }
    if (config.drawFills[1] || config.drawLines[1]) {
        const fill = config.drawFills[1]
            ? config.colours.fills[1]
            : transparent;
        const stroke = config.drawLines[1]
            ? config.colours.lines[1]
            : transparent;
        drawStraightPoly(svg, config.points, fill, stroke);
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
