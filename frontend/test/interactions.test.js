import { test } from "node:test";
import assert from "node:assert/strict";
import { matchesMember } from "../src/lib/memberFilters.js";
import { emptyFilters } from "../src/lib/tags.js";
import { clampPosition } from "../src/lib/windowPosition.js";
const member = {
  displayName: "Sam",
  username: "sam",
  technology: ["Python"],
  commitment: ["Casual"],
  industry: ["Cyber Security"],
};
test("filters accept any selected tag within a group, and require every selected group", () => {
  const filters = {
    commitment: ["Competitive", "Casual"],
    technology: ["Python", "Java"],
    industry: ["Cyber Security"],
  };
  assert.equal(matchesMember(member, "", filters), true);
  assert.equal(
    matchesMember(member, "", { ...filters, industry: ["Web Development"] }),
    false,
  );
  assert.equal(
    matchesMember(member, "", { ...filters, technology: ["React"] }),
    false,
  );
  assert.equal(matchesMember(member, "", emptyFilters()), true);
});
test("search and selected tags apply together, including missing member tags", () => {
  assert.equal(matchesMember(member, " PYTHON ", emptyFilters()), true);
  assert.equal(matchesMember(member, "unmatched", emptyFilters()), false);
  assert.equal(
    matchesMember({ username: "sam" }, "", {
      ...emptyFilters(),
      commitment: ["Casual"],
    }),
    false,
  );
});
test("notes cannot be dragged out of any viewport edge or beyond a resized viewport", () => {
  const viewport = { width: 1000, height: 800 },
    dimensions = { width: 380, height: 560 };
  assert.deepEqual(clampPosition({ x: -100, y: -100 }, viewport, dimensions), {
    x: 0,
    y: 0,
  });
  assert.deepEqual(clampPosition({ x: 2000, y: 2000 }, viewport, dimensions), {
    x: 620,
    y: 240,
  });
  assert.deepEqual(
    clampPosition({ x: 620, y: 240 }, { width: 320, height: 480 }, dimensions),
    { x: 0, y: 0 },
  );
});
