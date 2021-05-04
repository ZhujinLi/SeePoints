
/**
 * Find number patterns in a given text of mulitple lines.
 * @param {string} text The full text content
 * @return {number[][]} Lines of numbers
 */
export function find_num(text) {
    let res = [];

    const re = /x=((?:-?\d+)(?:\.\d+)?(?:e(?:-?\d+))?)(?:.*)y=((?:-?\d+)(?:\.\d+)?(?:e(?:-?\d+))?)/;

    const lines = text.split("\n");

    for (let iLine = 0; iLine < lines.length; iLine++) {
        const line = lines[iLine];

        const match = re.exec(line);
        if (!match || match.length < 3) {
            continue;
        }

        const x = Number(match[1]);
        const y = Number(match[2]);
        res.push([x, y]);
    }

    return res;
}