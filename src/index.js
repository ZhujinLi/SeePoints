import $ from "jquery";
import "bootstrap/dist/js/bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import * as Plotly from "plotly.js";
import * as utils from "./utils";

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
    nums = utils.find_num(pastedText);
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
    const suggest = utils.suggest_axes(nums);
    if (suggest) {
        xCol = suggest.x;
        yCol = suggest.y;
    }

    $("#config-modal").modal("show");

    const configBody = $("#config-modal-body");
    configBody.empty();

    const table = document.createElement("table");
    table.className = "table small table-borderless";
    configBody.append(table);

    add_selector_row_to_table(table, nColumns, "x-selector-radio");
    $("input[name=x-selector-radio][value=" + xCol + "]").prop("checked", true);

    fill_table_with_numbers(table, nums);

    add_selector_row_to_table(table, nColumns, "y-selector-radio");
    $("input[name=y-selector-radio][value=" + yCol + "]").prop("checked", true);
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