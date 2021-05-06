
/**
 * Find number patterns in a given text of multiple lines.
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