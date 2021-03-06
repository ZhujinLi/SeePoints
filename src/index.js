import "./index.css";
import $ from "jquery";
import "bootstrap/dist/js/bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Plotly from "plotly.js";
import { find_num, gen_labels, suggest_axes, split_log_by_empty_lines } from "./utils";

const MAX_DISPLAY_ROWS = 5;

let fixedAxesRatio = true;
let showLabels = true;

/**
 * Holds the data to be appended after each paste
 * @type {Plotly.Data[]}
 */
const plotData = [];

/* Multiple sections separated by empty lines are supported. In such cases,
 * the modal window would show up multiple times. A new window can only show
 * up after previous one has committed, so we need this queue for sync.
 */
let textSections = [];

Plotly.newPlot(
    "plot-div",
    plotData,
    {
        hovermode: "closest",
        dragmode: "pan",
    },
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
            "autoScale2d",
        ],
        modeBarButtonsToAdd: [
            {
                name: "Toggle axes ratio mode",
                icon: Plotly.Icons["autoscale"],
                click: () => {
                    fixedAxesRatio = !fixedAxesRatio;
                    relayout();
                }
            },
            {
                name: "Toggle label display",
                icon: Plotly.Icons["question"],
                click: () => {
                    showLabels = !showLabels;
                    update_label_display();
                }
            },
        ],
    },
);

let nums = [];

document.onpaste = (e) => {
    const pastedText = e.clipboardData.getData("Text");
    textSections = split_log_by_empty_lines(pastedText);
    process_next_text_section();
}

/**
 * @param {string} text 
 */
function add_new_data(text) {
    nums = find_num(text);
    if (nums.length == 0 || nums[0].length == 0) {
        process_next_text_section();
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

    // Use large size if the line is too long
    if (nColumns > 8) {
        document.getElementById("config-modal-dialog").classList.remove("modal-lg");
        document.getElementById("config-modal-dialog").classList.add("mw-100");
        document.getElementById("config-modal-dialog").classList.add("w-100");
    } else {
        document.getElementById("config-modal-dialog").classList.remove("mw-100");
        document.getElementById("config-modal-dialog").classList.remove("w-100");
        document.getElementById("config-modal-dialog").classList.add("modal-lg");
    }

    $("#config-modal").modal("show");

    const configBody = document.getElementById("config-modal-body");
    configBody.innerHTML = "";

    configBody.appendChild(add_selector_row(nColumns, "x-selector", "x", xCol));

    const table = document.createElement("table");
    table.className = "table small table-borderless text-center";
    table.style.tableLayout = "fixed";
    configBody.appendChild(table);
    fill_table_with_numbers(table, nums);

    configBody.appendChild(add_selector_row(nColumns, "y-selector", "y", yCol));
}

document.getElementById("confirm-button").onclick = () => {
    if (textSections.length == 0)
        $("#config-modal").modal("hide");

    document.getElementById("prompt-div").style.display = "none";
    document.getElementById("github-corner").style.display = "none";
    document.getElementById("plot-div").style.display = "inline";

    const xCol = document.querySelector("input[name=x-selector]:checked").value;
    const yCol = document.querySelector("input[name=y-selector]:checked").value;

    const x = [], y = [];
    nums.forEach(line => x.push(line[xCol]));
    nums.forEach(line => y.push(line[yCol]));

    plotData.push({
        x: x,
        y: y,
        text: gen_labels(x, y),
        textinfo: "label",
        textposition: "top center",
    });

    relayout();
    update_label_display();
    Plotly.redraw("plot-div");

    process_next_text_section();
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

function relayout() {
    // "autorange" is needed or there could be error in Plotly when adjusting axes ratio
    Plotly.relayout("plot-div", {
        yaxis: fixedAxesRatio ? {
            scaleanchor: "x",
            scaleratio: 1,
            autorange: true,
        } : {
            autorange: true,
        },
        xaxis: {
            autorange: true,
        }
    });
}

function update_label_display() {
    plotData.forEach(dat => dat.mode = showLabels ? "text+lines+markers" : "lines+markers");
    Plotly.redraw("plot-div");
}

function process_next_text_section() {
    const section = textSections.shift();
    if (section != undefined) {
        add_new_data(section);
    }
}