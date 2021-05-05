import $ from "jquery";
import "bootstrap/dist/js/bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import * as Plotly from "plotly.js";
import { find_num } from "./find_num";

// On every paste the data is appended 
let plotData = [];

Plotly.newPlot(
    "plot-div",
    plotData,
    { yaxis: { scaleanchor: "x" } },
    { responsive: true, fillFrame: true },
);

let pastedText = "";

document.onpaste = (e) => {
    $("#config-modal").modal("show");
    pastedText = e.clipboardData.getData("Text");

    const configBody = $("#config-modal-body");
    configBody.empty();

    const nums = find_num(pastedText);

    const table = document.createElement("table");
    table.className = "table small table-borderless";
    for (let i = 0; i < nums.length; i++) {
        const row = table.insertRow();

        if (i > 2) {
            for (let j = 0; j < nums[i].length + 1; j++) {
                row.insertCell().appendChild(document.createTextNode("..."));
            }
            break;
        }

        const id = document.createElement("b");
        id.innerHTML = i;
        row.insertCell().append(id);

        for (let j = 0; j < nums[i].length; j++) {
            row.insertCell().appendChild(document.createTextNode(nums[i][j]));
        }
    }

    configBody.append(table);
};

document.getElementById("confirm-button").onclick = () => {
    $("#config-modal").modal("hide");

    const nums = find_num(pastedText);

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

    Plotly.redraw("plot-div");
};