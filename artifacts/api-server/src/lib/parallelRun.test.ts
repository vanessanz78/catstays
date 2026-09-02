import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { checkParallelRunRequest as check } from './parallelRun.js';
test('other catteries retain public booking access', () => assert.equal(check(undefined, false, false, null, 'customer@example.com'), null));
test('parallel run blocks anonymous and customer submissions', () => assert.ok(check('test_only', false, true, 'test@example.com', 'test@example.com')));
test('staff must explicitly submit a test', () => assert.ok(check('test_only', true, false, 'test@example.com', 'test@example.com')));
test('staff cannot send test messages to customers', () => assert.ok(check('test_only', true, true, 'test@example.com', 'customer@example.com')));
test('unverified email cannot receive a test', () => assert.ok(check('test_only', true, true, null, 'test@example.com')));
test('verified staff can test using their own email', () => assert.equal(check('test_only', true, true, 'Test@Example.com', ' test@example.com '), null));
