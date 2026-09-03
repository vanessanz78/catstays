import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./RightMenu.tsx", import.meta.url),
  "utf8",
);
const menuSource = source.match(
  /export const menuItems: MenuItem\[\] = \[([\s\S]*?)\n\];/,
)?.[1];
assert.ok(menuSource, "menuItems source should be present");
const labels = [...menuSource.matchAll(/label: ["']([^"']+)["']/g)].map(
  (match) => match[1],
);

test("staff dashboard navigation prioritises daily operational work", () => {
  assert.deepEqual(labels.slice(0, 6), [
    "Today",
    "Bookings",
    "Calendar",
    "Customers",
    "Messages",
    "Reports",
  ]);
});

test("website and room administration stay out of the primary navigation group", () => {
  assert.equal(labels.includes("View Website"), false);
  assert.deepEqual(labels.slice(-2), ["Settings", "Edit Website"]);
});

test("marketing and finance have separate ordered groups without duplicated setup links", () => {
  assert.deepEqual(labels.slice(6, 10), ['Cat Updates', 'Social Media', 'Marketing Studio', 'Promotions']);
  assert.deepEqual(labels.slice(10, 12), ['Insights', 'Accounting']);
  assert.equal(labels.length, 14);
  for (const label of ['Smart Import', 'Payment Setup', 'Booking Setup', 'Subscription', 'Room Planner']) {
    assert.equal(labels.includes(label), false);
  }
  const settings = readFileSync(new URL('../pages/staff/StaffDashboard.tsx', import.meta.url), 'utf8');
  for (const path of ['room-planner', 'booking-setup', 'payment', 'subscription', 'smart-import']) {
    assert.ok(settings.includes(`path: '/staff-dashboard/${path}'`));
  }
});
