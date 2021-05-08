import $ from "jquery";
import "bootstrap/dist/js/bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import * as Plotly from "plotly.js";
import { find_num, suggest_axes } from "./utils";

const MAX_DISPLAY_ROWS = 5;

let axesRatioMode = "fixed";

/**
 * Holds the data to be appended after each paste
 * @type {Plotly.Data[]}
 */
let plotData = [];

Plotly.newPlot(
    "plot-div",
    plotData,
    makeLayout(),
    {
        responsive: true,
        fillFrame: true,
        scrollZoom: true,   // Note this does not work on some browsers like Safari
        modeBarButtonsToRemove: [
            "select2d",
            "zoomIn2d",
            "zoomOut2d",
            "lasso2d",
            "resetScale2d",
            "toggleSpikelines",
            "hoverCompareCartesian",
            "hoverClosestCartesian",
        ],
        modeBarButtonsToAdd: [
            {
                name: 'Switch axes ratio mode',
                icon: Plotly.Icons["tooltip_basic"],
                click: (gd) => {
                    axesRatioMode = axesRatioMode == "fixed" ? "auto" : "fixed";
                    Plotly.relayout(gd, makeLayout());
                }
            },
        ]
    },
);

let nums = [];

document.onpaste = (e) => {
    const pastedText = e.clipboardData.getData("Text");
    nums = find_num(pastedText);
    if (nums.length == 0 || nums[0].length == 0) {
        alert("No valid number detected...");
        return;
    }

    // Append a special index as the first column
    for (let i = 0; i < nums.length; i++) {
        nums[i] = [i].concat(nums[i]);
    }

    const nColumns = nums[0].length;

    let xCol = 0;
    let yCol = nColumns - 1;
    const suggest = suggest_axes(nums);
    if (suggest) {
        xCol = suggest.x;
        yCol = suggest.y;
    }

    $("#config-modal").modal("show");

    const configBody = $("#config-modal-body");
    configBody.empty();

    configBody.append(add_selector_row(nColumns, "x-selector", "x", xCol));

    const table = document.createElement("table");
    table.className = "table small table-borderless text-center";
    table.style.tableLayout = "fixed";
    configBody.append(table);
    fill_table_with_numbers(table, nums);

    configBody.append(add_selector_row(nColumns, "y-selector", "y", yCol));
};

document.getElementById("confirm-button").onclick = () => {
    $("#config-modal").modal("hide");
    $("#plot-div").css("display", "inline");
    $("#prompt-div").css("display", "none");

    const xCol = $("input[name=x-selector]:checked").val();
    const yCol = $("input[name=y-selector]:checked").val();

    const x = [], y = [];
    nums.forEach(line => x.push(line[xCol]));
    nums.forEach(line => y.push(line[yCol]));

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

function add_selector_row(nColumns, name, axis, selectedIndex) {
    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group btn-group-toggle d-flex";
    btnGroup.setAttribute("data-toggle", "buttons");

    for (let i = 0; i < nColumns; i++) {
        const label = document.createElement("label");
        label.innerText = axis;
        label.className = axis == "x" ? "btn btn-outline-danger" : "btn btn-outline-info";
        if (i == selectedIndex) {
            label.className = label.className + " active";
        }

        const input = document.createElement("input");
        input.type = "radio";
        input.name = name;
        input.value = i;
        if (i == selectedIndex) {
            input.setAttribute("checked", "");
        }
        label.appendChild(input);

        btnGroup.appendChild(label);
    }

    return btnGroup;
}

/**
 * @param {HTMLTableElement} table 
 * @param {number[][]} nums 
 */
function fill_table_with_numbers(table, nums) {
    for (let i = 0; i < nums.length; i++) {
        const row = table.insertRow();

        if (i >= MAX_DISPLAY_ROWS && i + 1 < nums.length) {
            for (let j = 0; j < nums[i].length; j++) {
                row.insertCell().appendChild(document.createTextNode("..."));
            }
            i = nums.length - 2;
            continue;
        }

        const id = document.createElement("b");
        id.innerHTML = nums[i][0];
        row.insertCell().append(id);

        for (let j = 1; j < nums[i].length; j++) {
            row.insertCell().appendChild(document.createTextNode(nums[i][j]));
        }
    }
}

/**
 * @return {Plotly.Layout}
 */
function makeLayout() {
    return {
        hovermode: "closest",
        yaxis: {
            scaleanchor: axesRatioMode == "fixed" ? "x" : "y",
        },
    };
}