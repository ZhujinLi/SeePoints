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

let nums = [];

document.onpaste = (e) => {
    const pastedText = e.clipboardData.getData("Text");
    nums = find_num(pastedText);
    if (nums.length == 0 || nums[0].length == 0) {
        alert("No valid number detected...");
        return;
    }

    // First column is a special index
    for (let i = 0; i < nums.length; i++) {
        nums[i] = [i].concat(nums[i]);
    }

    $("#config-modal").modal("show");

    const configBody = $("#config-modal-body");
    configBody.empty();

    const nColumns = nums[0].length;

    const table = document.createElement("table");
    table.className = "table small table-borderless";
    configBody.append(table);

    add_selector_row_to_table(table, nColumns, "x-selector-radio");
    $("input[name=x-selector-radio][value=0]").prop("checked", true);

    fill_table_with_numbers(table, nums);

    add_selector_row_to_table(table, nColumns, "y-selector-radio");
    $("input[name=y-selector-radio][value=0]").prop("checked", true);
};

document.getElementById("confirm-button").onclick = () => {
    $("#config-modal").modal("hide");

    const xCol = $("input[name=x-selector-radio]:checked").val();
    const yCol = $("input[name=y-selector-radio]:checked").val();

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

function add_selector_row_to_table(table, nColumns, name) {
    const selectorRow = table.insertRow();
    for (let i = 0; i < nColumns; i++) {
        const colForm = document.createElement("div");
        colForm.className = "form-check";

        const colInput = document.createElement("input");
        colInput.className = "form-check-input";
        colInput.type = "radio";
        colInput.name = name;
        colInput.value = i;
        colForm.appendChild(colInput);

        selectorRow.insertCell().appendChild(colForm);
    }
}

/**
 * @param {HTMLTableElement} table 
 * @param {number[][]} nums 
 */
function fill_table_with_numbers(table, nums) {
    for (let i = 0; i < nums.length; i++) {
        const row = table.insertRow();

        if (i > 2) {
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