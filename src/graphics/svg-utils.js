const ns = 'http://www.w3.org/2000/svg';

const colourFromArray = (rgba) =>
    `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`;

const drawSVGElem = (fill, stroke, pointsStr, name = 'path') => {
    const path = document.createElementNS(ns, name);

    path.setAttribute('fill', colourFromArray(fill));
    path.setAttribute('stroke', colourFromArray(stroke));
    path.setAttribute(name === 'path' ? 'd' : 'points', pointsStr);
    return path;
};

const drawStraightPoly = (svg, points, fill, stroke) => {
    const pointsStr = points.reduce(function(acc, p) {
        return `${acc} ${p.x},${p.y}`;
    }, '');
    const path = drawSVGElem(fill, stroke, pointsStr, 'polygon');
    svg.appendChild(path);
};

const drawCurvePoly = (svg, points, fill, stroke) => {
    let pointsStr = `M ${points[0].x} ${points[0].y} `;
    let i = 1;
    for (; i < points.length - 2; i += 2) {
        pointsStr += `Q ${points[i].x} ${points[i].y} ${points[i + 1].x}
        ${points[i + 1].y} `;
    }
    pointsStr += `Q ${points[i].x} ${points[i].y} ${points[0].x}
    ${points[0].y}`;

    const path = drawSVGElem(fill, stroke, pointsStr, 'path');
    svg.appendChild(path);
};

const drawQuadCurvePoly = (svg, points, fill, stroke) => {
    let p1 = {
        x:
            (points[0].x - points[points.length - 1].x) / 2 +
            points[points.length - 1].x,
        y:
            (points[0].y - points[points.length - 1].y) / 2 +
            points[points.length - 1].y,
    };
    let pointsStr = `M ${p1.x} ${p1.y} `;
    for (let i = 1; i < points.length; i++) {
        const p = {
            x: (points[i].x - points[i - 1].x) / 2 + points[i - 1].x,
            y: (points[i].y - points[i - 1].y) / 2 + points[i - 1].y,
        };
        pointsStr += `Q ${points[i - 1].x} ${points[i - 1].y} ${p.x} ${p.y} `;
    }
    pointsStr += `Q ${points[points.length - 1].x} ${
        points[points.length - 1].y
    } ${p1.x} ${p1.y}`;

    const path = drawSVGElem(fill, stroke, pointsStr, 'path');
    svg.appendChild(path);
};

module.exports = {
    colourFromArray,
    drawSVGElem,
    drawStraightPoly,
    drawCurvePoly,
    drawQuadCurvePoly,
};
