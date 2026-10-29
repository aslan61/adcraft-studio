import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cleanAndParseJSON } from './clientAiService.ts';

describe('Client AI Service - Robust JSON Parser', () => {
  test('Parses plain standard JSON object cleanly', () => {
    const input = '{"status":"success","score":98}';
    const parsed = cleanAndParseJSON<{ status: string; score: number }>(input);

    assert.ok(parsed);
    assert.equal(parsed.status, 'success');
    assert.equal(parsed.score, 98);
  });

  test('Extracts and parses JSON wrapped in markdown ```json code blocks', () => {
    const input = '```json\n{\n  "hook": "Stop Scrolling",\n  "ctr": "+45%"\n}\n```';
    const parsed = cleanAndParseJSON<{ hook: string; ctr: string }>(input);

    assert.ok(parsed);
    assert.equal(parsed.hook, 'Stop Scrolling');
    assert.equal(parsed.ctr, '+45%');
  });

  test('Extracts and parses JSON array embedded inside conversational LLM text', () => {
    const input = 'Sure, here are your requested hooks:\n[{"id":"h1","text":"Hook One"},{"id":"h2","text":"Hook Two"}]\nLet me know if you need changes!';
    const parsed = cleanAndParseJSON<Array<{ id: string; text: string }>>(input);

    assert.ok(Array.isArray(parsed));
    assert.equal(parsed.length, 2);
    assert.equal(parsed[0].id, 'h1');
    assert.equal(parsed[1].text, 'Hook Two');
  });

  test('Safely returns null on completely malformed or non-JSON text without throwing', () => {
    assert.equal(cleanAndParseJSON(''), null);
    assert.equal(cleanAndParseJSON(null as any), null);
    assert.equal(cleanAndParseJSON('This is conversational output with no valid json data at all.'), null);
    assert.equal(cleanAndParseJSON('{ broken json without closing bracket'), null);
  });
});
