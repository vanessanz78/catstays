import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSmartImportPreview, normaliseImportDate, normaliseImportTime, splitImportList } from './smartImport';

const context = {
  customers: [{ id: 'customer-1', name: 'Vanessa Wilson', email: 'vanessa@example.com', phone: '021 123 456', cats: [{ name: 'Milo' }] }],
  rooms: [{ id: 'room-1', name: 'Private Suite' }],
  bookingKeys: ['customer-1|room-1|2026-09-01|2026-09-03'],
};

test('normalises New Zealand style dates and common booking times', () => {
  assert.equal(normaliseImportDate('1/9/2026'), '2026-09-01');
  assert.equal(normaliseImportDate('2026-09-03'), '2026-09-03');
  assert.equal(normaliseImportDate('2026-13-40'), '');
  assert.equal(normaliseImportDate('31/2/2026'), '');
  assert.equal(normaliseImportTime('9:15 am'), '09:15:00');
  assert.equal(normaliseImportTime('4:45pm'), '16:45:00');
  assert.equal(normaliseImportTime('25:00'), null);
});

test('splits cat and amenity lists without blank values', () => {
  assert.deepEqual(splitImportList('Milo, Luna | Coco; '), ['Milo', 'Luna', 'Coco']);
});

test('maps customer aliases and detects an existing customer', () => {
  const [row] = buildSmartImportPreview('customers', [{ 'Client Name': 'Vanessa Wilson', Email: 'VANESSA@example.com', Mobile: '021123456' }], context);
  assert.equal(row.payload.name, 'Vanessa Wilson');
  assert.equal(row.payload.email, 'vanessa@example.com');
  assert.equal(row.duplicate, true);
  assert.deepEqual(row.errors, []);
});

test('preserves Revelation customer identifiers and historic balances', () => {
  const [row] = buildSmartImportPreview('customers', [{
    customer_name: 'Legacy Customer',
    email: 'legacy@example.com',
    external_source: 'revelation_pets',
    external_id: '24611',
    legacy_last_booking: '1/9/2025',
    legacy_account_balance: '$42.50',
    legacy_metadata: '{"marketing_opt_in":true}',
  }], { customers: [], rooms: [] });
  assert.equal(row.payload.external_id, '24611');
  assert.equal(row.payload.legacy_last_booking, '2025-09-01');
  assert.equal(row.payload.legacy_account_balance, 42.5);
  assert.deepEqual(row.payload.legacy_metadata, { marketing_opt_in: true });
  assert.equal(row.duplicate, false);
});

test('matches Revelation cats to their owner by source identifier', () => {
  const [row] = buildSmartImportPreview('cats', [{
    cat_name: 'Pipi',
    owner_external_id: '24611',
    external_source: 'revelation_pets',
    external_id: '24611:1',
  }], {
    customers: [{ id: 'customer-legacy', name: 'Legacy Customer', email: 'legacy@example.com', phone: null, external_source: 'revelation_pets', external_id: '24611' }],
    rooms: [],
  });
  assert.equal(row.payload.customer_id, 'customer-legacy');
  assert.equal(row.payload.external_id, '24611:1');
  assert.deepEqual(row.errors, []);
});

test('keeps same-name Revelation cats when their source identifiers differ', () => {
  const preview = buildSmartImportPreview('cats', [
    { cat_name: 'Milo', owner_external_id: '100', external_source: 'revelation_pets', external_id: '100:1' },
    { cat_name: 'Milo', owner_external_id: '100', external_source: 'revelation_pets', external_id: '100:2' },
  ], {
    customers: [{ id: 'customer-1', name: 'Owner', email: 'owner@example.com', phone: null, external_source: 'revelation_pets', external_id: '100', cats: [] }],
    rooms: [],
  });

  assert.equal(preview.length, 2);
  assert.equal(preview.filter((row) => row.duplicate).length, 0);
  assert.deepEqual(preview.map((row) => row.payload.external_id), ['100:1', '100:2']);
});

test('matches cats to owners and blocks unknown owners', () => {
  const [matched, missing] = buildSmartImportPreview('cats', [
    { 'Cat Name': 'Luna', 'Owner Email': 'vanessa@example.com', Breed: 'Ragdoll' },
    { 'Cat Name': 'Coco', 'Owner Email': 'missing@example.com' },
  ], context);
  assert.equal(matched.payload.customer_id, 'customer-1');
  assert.deepEqual(matched.errors, []);
  assert.match(missing.errors.join(' '), /could not be matched/i);
});

test('maps rooms with a daily rate and capacity', () => {
  const [row] = buildSmartImportPreview('rooms', [{ Room: 'Garden Suite', 'Daily Rate': '$35.50', Capacity: '3', Amenities: 'Heater, Window' }], context);
  assert.equal(row.payload.price_per_night, 35.5);
  assert.equal(row.payload.capacity, 3);
  assert.deepEqual(row.payload.amenities, ['Heater', 'Window']);
  assert.deepEqual(row.errors, []);
});

test('maps bookings to real customer and room ids and flags duplicates', () => {
  const [row] = buildSmartImportPreview('bookings', [{
    'Customer Email': 'vanessa@example.com',
    Room: 'Private Suite',
    'Check In': '1/9/2026',
    'Check Out': '3/9/2026',
    'Check In Time': '9:15am',
    'Check Out Time': '5pm',
    Cats: 'Milo, Luna',
    Total: '$120',
  }], context);
  assert.equal(row.payload.customer_id, 'customer-1');
  assert.equal(row.payload.room_id, 'room-1');
  assert.equal(row.payload.number_of_cats, 2);
  assert.equal(row.payload.total_amount, 120);
  assert.equal(row.duplicate, true);
  assert.deepEqual(row.errors, []);
});

test('skips a repeated row in the same CSV preview', () => {
  const rows = buildSmartImportPreview('rooms', [
    { Room: 'Garden Suite', 'Daily Rate': '35' },
    { Room: 'Garden Suite', 'Daily Rate': '35' },
  ], { customers: [], rooms: [] });
  assert.equal(rows[0].duplicate, false);
  assert.equal(rows[1].duplicate, true);
  assert.match(rows[1].warnings.join(' '), /same CSV file/i);
});
