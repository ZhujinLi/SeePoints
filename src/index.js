import * as Plotly from "plotly.js";
import { find_num } from "./find_num";

// On every paste the data is appended 
let plotData = [];

const div = document.body.appendChild(document.createElement("div"));
div.id = "div-plot";
Plotly.newPlot(
    "div-plot",
    plotData,
    { yaxis: { scaleanchor: "x" } },
    { responsive: true },
);

document.onpaste = (e) => {
    const text = e.clipboardData.getData("Text");
    const nums = find_num(text);

    const x = [], y = [];
    nums.forEach(elem => x.push(elem[0]));
    nums.forEach(elem => y.push(elem[1]));

    plotData.push({
        x: x,
        y: y,
        text: [...Array(x.length).keys()],
        mode: "text+lines+markers",
        textinfo: "label",
        textposition: "bottom right",
    });

    Plotly.redraw("div-plot");
};