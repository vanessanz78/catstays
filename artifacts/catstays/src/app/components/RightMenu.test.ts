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
    "Cat Updates",
  ]);
});

test("website and room administration stay out of the primary navigation group", () => {
  assert.equal(labels.includes("View Website"), false);
  assert.deepEqual(labels.slice(-2), ["Room Planner", "Edit Website"]);
});
