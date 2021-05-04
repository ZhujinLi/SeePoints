import { find_num } from './find_num';
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
        assert.strictEqual(res[0][0], 11633721);
        assert.strictEqual(res[0][1], 3987484);
        assert.strictEqual(res[4][0], 11633722);
        assert.strictEqual(res[4][1], 3987548);
    });

    it('should handle real numbers', () => {
        const text = `
+		[1]	{x=452.000001 y=11844.0004 }	const Vector2
+		[2]	{x=768.000002 y=11876.0005 }	const Vector2
+		[3]	{x=4832.00003 y=11888.0006 }	const Vector2
`;
        const res = find_num(text);
        assert.strictEqual(res.length, 3);
        assert.strictEqual(res[0][0], 452.000001);
        assert.strictEqual(res[0][1], 11844.0004);
    });
});
