
/**
 * Find number patterns in a given text of mulitple lines.
 * @param {string} text The full text content
 * @return {number[][]} Lines of numbers
 */
export function find_num(text) {
    let res = [];

    const lines = text.split("\n");

    for (let iLine = 0; iLine < lines.length; iLine++) {
        const line = lines[iLine];

        const numbers = extract_numbers(line);
        if (numbers.length > 0) {
            res.push(numbers);
        }
    }

    return res;
}

/**
 * @param {string} line 
 */
function extract_numbers(line) {
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