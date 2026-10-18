const { test } = require("node:test");
const assert = require("node:assert/strict");
const { toProfileView } = require("../server/lib/profileView");
const imported = {
  _id: "507f1f77bcf86cd799439011",
  first_name: "Test",
  last_name: "Member",
  pronouns: "they/them",
  coding_languages: "Javascript",
  learning_interest: "Cybersecurity",
  competitive: false,
  hackathon_experience: "Intermediate",
  project_description: "A database-backed project.",
  github_link: "https://github.com/example",
  linkedin_link: "https://linkedin.com/in/example",
  email: "private@example.com",
  notes: "Never expose this note",
  auth0Id: "private-identity",
};
test("imported keys become the fields rendered by profile pages", () => {
  const result = toProfileView(imported, "people");
  assert.equal(result.displayName, "Test Member");
  assert.equal(result.pronouns, "they/them");
  assert.equal(result.experience, "Intermediate");
  assert.deepEqual(result.technology, ["JavaScript"]);
  assert.deepEqual(result.learning, ["Cybersecurity"]);
  assert.deepEqual(result.industry, ["Cyber Security"]);
  assert.deepEqual(result.commitment, ["Casual"]);
  assert.equal(result.currentProject.description, imported.project_description);
  assert.equal(result.githubUrl, imported.github_link);
  assert.equal(result.linkedinUrl, imported.linkedin_link);
  assert.equal(result.profileKey, `~people.${imported._id}`);
  for (const privateKey of ["email", "notes", "auth0Id"])
    assert.equal(Object.hasOwn(result, privateKey), false);
});
test("competitive false is preserved and unclassified interests do not become industries", () => {
  const result = toProfileView(
    { ...imported, learning_interest: "Machine Learning" },
    "people",
  );
  assert.deepEqual(result.commitment, ["Casual"]);
  assert.deepEqual(result.industry, []);
  assert.deepEqual(result.learning, ["Machine Learning"]);
});
test("canonical account edits take precedence over imported display fields", () => {
  const result = toProfileView({
    ...imported,
    username: "test_member",
    displayName: "Chosen name",
    technology: ["React"],
    commitment: ["Competitive"],
  });
  assert.equal(result.displayName, "Chosen name");
  assert.deepEqual(result.technology, ["React"]);
  assert.deepEqual(result.commitment, ["Competitive"]);
  assert.equal(result.profileKey, "test_member");
});
test("arrays, absent fields, and unsafe links are handled without leaking data", () => {
  const result = toProfileView(
    {
      _id: imported._id,
      coding_languages: ["Javascript", "JavaScript", "Python"],
      github_link: "javascript:alert(1)",
    },
    "people",
  );
  assert.deepEqual(result.technology, ["JavaScript", "Python"]);
  assert.deepEqual(result.commitment, []);
  assert.equal(result.githubUrl, "");
  assert.equal(result.currentProject.description, "");
});
