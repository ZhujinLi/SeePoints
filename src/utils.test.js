import { find_num, suggest_axes, gen_labels } from './utils';
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
        assert.deepStrictEqual(res, [
            [0, 11633721, 3987484],
            [1, 11633722, 3987491],
            [2, 11633725, 3987525],
            [3, 11633724, 3987528],
            [4, 11633722, 3987548],
        ]);
    });

    it('should handle real numbers', () => {
        const text = `
+		[1]	{x=452.000001 y=11844.0004 }	const Vector2
+		[2]	{x=768.000002 y=11876.0005 }	const Vector2
+		[3]	{x=4832.00003 y=11888.0006 }	const Vector2
`;
        const res = find_num(text);
        assert.deepStrictEqual(res, [
            [1, 452.000001, 11844.0004, 2],
            [2, 768.000002, 11876.0005, 2],
            [3, 4832.00003, 11888.0006, 2],
        ]);
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
        assert.deepStrictEqual(res, [
            [452.000001, 11844.0004],
            [768.000002, 11876.0005],
            [768.000002, 11876.0005],
            [768.000002, 11876.0005],
        ]);
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
        assert.deepStrictEqual(res, [[123, 455], [125, 457], [127, 322]]);
    });

    it('should handle single number', () => {
        const text = `
123
456
`;
        const res = find_num(text);
        assert.deepStrictEqual(res, [[123], [456]]);
    });

    it('should handle exp representation', () => {
        const text = `
        +		[0]	{x=-1.39876443e-06 y=32.0000000 }	Vector2
        +		[1]	{x=-27.7128124 y=16.0000019 }	Vector2
`;
        const res = find_num(text);
        assert.deepStrictEqual(res, [
            [0, -0.00000139876443, 32, 2],
            [1, -27.7128124, 16.0000019, 2]
        ]);
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
        assert.deepStrictEqual(res, { x: 1, y: 2 });
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
        assert.deepStrictEqual(res, { x: 0, y: 1 });
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

describe('gen_labels', () => {
    it('should handle regular case', () => {
        const x = [1, 2, 3, 4, 5];
        const y = [6, 7, 8, 9, 0];

        const labels = gen_labels(x, y);
        assert.deepStrictEqual(labels, [0, 1, 2, 3, 4]);
    });

    it('should handle duplicates', () => {
        const x = [1, 2, 1, 1, 5];
        const y = [6, 7, 8, 6, 0];

        const labels = gen_labels(x, y);
        assert.deepStrictEqual(labels, ["0,3", 1, 2, "0,3", 4]);
    });
});