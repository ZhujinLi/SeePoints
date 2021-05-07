import $ from "jquery";
import "bootstrap/dist/js/bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import * as Plotly from "plotly.js";
import { find_num, suggest_axes } from "./utils";

const MAX_DISPLAY_ROWS = 8;

// On every paste the data is appended 
let plotData = [];

Plotly.newPlot(
    "plot-div",
    plotData,
    { yaxis: { scaleanchor: "x" } },
    { responsive: true, fillFrame: true },
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
        label.className = "btn btn-outline-info";
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

        if (i >= MAX_DISPLAY_ROWS) {
            for (let j = 0; j < nums[i].length; j++) {
                row.insertCell().appendChild(document.createTextNode("..."));
            }
            break;
        }

        const id = document.createElement("b");
        id.innerHTML = nums[i][0];
        row.insertCell().append(id);

        for (let j = 1; j < nums[i].length; j++) {
            row.insertCell().appendChild(document.createTextNode(nums[i][j]));
        }
    }
}