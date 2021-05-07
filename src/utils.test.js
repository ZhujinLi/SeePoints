import { find_num, suggest_axes } from './utils';
import * as assert from 'assert';

describe('find_num', () => {
    it('should handle basic Visual Studio debug format', () => {
        const text = `
+		[0]	{x=11633721 y=3987484 }	NdsPoint
+		[1]	{x=11633722 y=3987491 }	NdsPoint
+		[2]	{x=11633725 y=3987525 }	NdsPoint
+		[3]	{x=11633724 y=3987528 }	NdsPoint
+		[4]	{x=11633722 y=3987548 }	NdsPoint
`;
        const res = find_num(text);
        assert.strictEqual(res.length, 5);
        assert.strictEqual(res[0][0], 0);
        assert.strictEqual(res[0][1], 11633721);
        assert.strictEqual(res[0][2], 3987484);
        assert.strictEqual(res[4][0], 4);
        assert.strictEqual(res[4][1], 11633722);
        assert.strictEqual(res[4][2], 3987548);
    });

    it('should handle real numbers', () => {
        const text = `
+		[1]	{x=452.000001 y=11844.0004 }	const Vector2
+		[2]	{x=768.000002 y=11876.0005 }	const Vector2
+		[3]	{x=4832.00003 y=11888.0006 }	const Vector2
`;
        const res = find_num(text);
        assert.strictEqual(res.length, 3);
        assert.strictEqual(res[0][0], 1);
        assert.strictEqual(res[0][1], 452.000001);
        assert.strictEqual(res[0][2], 11844.0004);
        assert.strictEqual(res[0][3], 2);   // In 'Vector2'
    });

    it('should return empty array on invalid input', () => {
        const text = `
hello world
this log contains no number...
`;
        const res = find_num(text);
        assert.strictEqual(res.length, 0);
    });

    it('should recognize a custom log format', () => {
        const text = `
(452.000001,11844.0004)
(768.000002, 11876.0005)
[768.000002  11876.0005
lon:768.000002  lat:11876.0005
`;
        const res = find_num(text);
        assert.strictEqual(res.length, 4);
        assert.strictEqual(res[0].length, 2);
        assert.strictEqual(res[1].length, 2);
        assert.strictEqual(res[2].length, 2);
        assert.strictEqual(res[3].length, 2);
    });

    it('should return empty array on invalid input', () => {
        const text = `
hello world
this log contains no number...
`;
        const res = find_num(text);
        assert.strictEqual(res.length, 0);
    });

    it('should choose the dominant number of columns', () => {
        const text = `
123 455
124 456 789
[warn] this line is a noise
125 457
126 458 789 123
127 322
`;
        const res = find_num(text);
        assert.strictEqual(res.length, 3);

        assert.strictEqual(res[0].length, 2);
        assert.strictEqual(res[0][0], 123);
        assert.strictEqual(res[0][1], 455);

        assert.strictEqual(res[1].length, 2);
        assert.strictEqual(res[1][0], 125);
        assert.strictEqual(res[1][1], 457);

        assert.strictEqual(res[2].length, 2);
        assert.strictEqual(res[2][0], 127);
        assert.strictEqual(res[2][1], 322);

    });

    it('should handle single number', () => {
        const text = `
123
456
`;
        const res = find_num(text);
        assert.strictEqual(res.length, 2);

        assert.strictEqual(res[0].length, 1);
        assert.strictEqual(res[0][0], 123);

        assert.strictEqual(res[1].length, 1);
        assert.strictEqual(res[1][0], 456);
    });
});

describe('suggest_axes', () => {
    it('should handle multiple columns', () => {
        const nums = [
            [0, 11633721, 3987484, 3],
            [1, 11633722, 3987491, 3],
            [2, 11633725, 3987525, 3],
            [3, 11633724, 3987528, 3],
            [4, 11633722, 3987548, 3],
        ];
        const res = suggest_axes(nums);
        assert.strictEqual(res.x, 1);
        assert.strictEqual(res.y, 2);
    });

    it('should handle two columns', () => {
        const nums = [
            [11633721, 3987484],
            [11633722, 3987491],
            [11633725, 3987525],
            [11633724, 3987528],
            [11633722, 3987548],
        ];
        const res = suggest_axes(nums);
        assert.strictEqual(res.x, 0);
        assert.strictEqual(res.y, 1);
    });

    it('should return null for invalid inputs', () => {
        assert.strictEqual(suggest_axes([]), null);
        assert.strictEqual(suggest_axes([[]]), null);
        assert.strictEqual(suggest_axes([[1]]), null);
        assert.strictEqual(suggest_axes([[1], [2]]), null);
        assert.strictEqual(suggest_axes([[1, 2]]), null);
        assert.strictEqual(suggest_axes([[9], [3], [1], [4], [8]]), null);
    });
});