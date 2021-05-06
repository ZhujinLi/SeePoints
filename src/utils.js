
/**
 * Find number patterns in a given text consisting of multiple lines.
 * @param {string} text The full text content
 * @return {number[][]} Lines of numbers; each line contains the same number of numbers (at least one)
 */
export function find_num(text) {
    let res = [];

    const lines = text.split("\n");

    for (let iLine = 0; iLine < lines.length; iLine++) {
        const line = lines[iLine];

        const numbers = extract_numbers_in_line(line);
        if (numbers.length > 0) {
            res.push(numbers);
        }
    }

    res = filter_nums(res);

    return res;
}

/**
 * Suggest x and y axes and return their indexes.
 * @param {number[][]} nums Lines of numbers; each line must contain the same number of columns
 * @return An object containing x and y. Or null.
 */
export function suggest_axes(nums) {
    if (nums.length <= 2) {
        return null;
    }

    const nColumns = nums[0].length;
    if (nColumns <= 1) {
        return null;
    }

    // Now there are at least 3 lines each with at least 2 columns

    const entropy = [];
    for (let iCol = 0; iCol < nColumns; iCol++) {
        entropy.push(calc_entropy_of_column(nums, iCol));
    }

    let first = entropy[0] > entropy[1] ? 0 : 1;
    let second = entropy[0] > entropy[1] ? 1 : 0;
    for (let iCol = 2; iCol < nColumns; iCol++) {
        if (entropy[iCol] > entropy[first]) {
            second = first;
            first = iCol;
        } else if (entropy[iCol] > entropy[second]) {
            second = iCol;
        }
    }

    return { x: Math.min(first, second), y: Math.max(first, second) };
}

/**
 * How chaos is a column of numbers?
 * @param {number[][]} nums 
 */
function calc_entropy_of_column(nums, iCol) {
    const column = nums.map(line => line[iCol]);

    const firstOrderDiff = [];
    for (let i = 1; i < column.length; i++) {
        firstOrderDiff.push(column[i] - column[i - 1]);
    }

    const secondOrderDiff = [];
    for (let i = 1; i < firstOrderDiff.length; i++) {
        secondOrderDiff.push(Math.abs(firstOrderDiff[i] - firstOrderDiff[i - 1]));
    }

    return secondOrderDiff.reduce((acc, val) => acc + val);
}

/**
 * @param {string} line 
 */
function extract_numbers_in_line(line) {
    const numbers = [];

    const match = line.match(/[0-9+\-\.]+/g);
    if (match) {
        for (const s of match) {
            const num = parseFloat(s);
            if (!isNaN(num)) {
                numbers.push(num);
            }
        }
    }
    return numbers;
}

/**
 * Filter out lines of noise that have different number of columns.
 * @param {number[][]} nums 
 */
function filter_nums(nums) {
    if (nums.length == 0) {
        return nums;
    }

    const cnt = {};
    for (const line of nums) {
        const n = line.length;
        cnt[n] = cnt[n] ? cnt[n] + 1 : 1;
    }

    let maxOne = 0;
    for (const key in cnt) {
        if (maxOne == 0 || cnt[key] > cnt[maxOne]) {
            maxOne = key;
        }
    }

    return nums.filter(line => line.length == maxOne);

}