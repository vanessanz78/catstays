import test from 'node:test';
import assert from 'node:assert/strict';
import { customerFirstName, messageMatchesQuery, messagesForCustomer, quickCustomerMessage } from './customerMessages';

const messages = [
  { id: 'late', customer_id: 'customer-1', subject: 'Second update', body: 'Milo is settled.', created_at: '2026-08-30T02:00:00Z' },
  { id: 'other', customer_id: 'customer-2', subject: 'Different customer', body: 'Not in this thread.', created_at: '2026-08-30T01:30:00Z' },
  { id: 'early', customer_id: 'customer-1', subject: 'First update', body: 'Welcome to CatStays.', created_at: '2026-08-30T01:00:00Z' },
];

test('builds one customer conversation in chronological order', () => {
  assert.deepEqual(messagesForCustomer(messages, 'customer-1').map((message) => message.id), ['early', 'late']);
});

test('searches message subjects and bodies without case sensitivity', () => {
  assert.equal(messageMatchesQuery(messages[0], 'milo'), true);
  assert.equal(messageMatchesQuery(messages[0], 'SECOND'), true);
  assert.equal(messageMatchesQuery(messages[0], 'payment'), false);
});

test('creates a customer-safe quick reply without example contact details', () => {
  assert.equal(customerFirstName('  Vanessa Wilson '), 'Vanessa');
  assert.match(quickCustomerMessage('Vanessa Wilson', 'Deloraine Cattery'), /^Hi Vanessa,/);
  assert.match(quickCustomerMessage('Vanessa Wilson', 'Deloraine Cattery'), /Deloraine Cattery$/);
});
