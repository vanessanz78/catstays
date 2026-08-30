import test from 'node:test';
import assert from 'node:assert/strict';
import { customerMessageHtml } from './emailTemplates';

test('renders a branded customer message and escapes staff-entered HTML', () => {
  const html = customerMessageHtml({
    customerName: 'Vanessa Wilson',
    catteryName: 'Deloraine Cattery',
    subject: 'Milo update <today>',
    message: 'Milo is settled.\n<script>alert("no")</script>',
  });

  assert.match(html, /Deloraine Cattery sent you a message/);
  assert.match(html, /Milo update &lt;today&gt;/);
  assert.match(html, /Milo is settled\.<br \/>/);
  assert.doesNotMatch(html, /<script>alert/);
});
