import test from 'node:test';
import assert from 'node:assert/strict';
import { customerMessageHtml, customerPhotoUpdateHtml } from './emailTemplates';

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

test('renders a factual private cat update and escapes the caption and image URL', () => {
  const html = customerPhotoUpdateHtml({
    customerName: 'Vanessa Wilson',
    catteryName: 'Deloraine Cattery',
    catName: 'Milo',
    caption: 'Milo is settled.\nNo daily promise <script>alert("no")</script>',
    imageUrl: 'https://example.com/photo.jpg?token=a&size=large',
    portalUrl: 'https://delorainecattery.catstays.app/client-portal?update=one',
  });

  assert.match(html, /New update for Milo/);
  assert.match(html, /Milo is settled\.<br \/>/);
  assert.match(html, /photo\.jpg\?token=a&amp;size=large/);
  assert.match(html, /Photo updates are sent when the cattery chooses to share them/);
  assert.doesNotMatch(html, /<script>alert/);
});
