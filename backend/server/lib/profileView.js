// Explicit projection: email, imported notes, and Auth0 identities never enter public responses.
const publicProfileFields = [
  "username",
  "displayName",
  "bio",
  "avatarUrl",
  "commitment",
  "technology",
  "industry",
  "createdAt",
  "first_name",
  "last_name",
  "pronouns",
  "coding_languages",
  "learning_interest",
  "competitive",
  "hackathon_experience",
  "project_description",
  "github_link",
  "linkedin_link",
  "experience",
  "learning",
  "githubUrl",
  "linkedinUrl",
  "currentProject",
  "upcomingEvents",
  "organizations",
  "hackathons",
].join(" ");
function tags(value) {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? [value]
      : [];
  return [
    ...new Set(
      values
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}
function safeLink(value) {
  if (typeof value !== "string") return "";
  try {
    return ["http:", "https:"].includes(new URL(value).protocol) ? value : "";
  } catch {
    return "";
  }
}
function toProfileView(record, sourceType = "account") {
  const source =
    typeof record.toObject === "function" ? record.toObject() : record;
  const displayName =
    source.displayName ||
    [source.first_name, source.last_name].filter(Boolean).join(" ").trim();
  const technology = tags(
    source.technology?.length ? source.technology : source.coding_languages,
  ).map((tag) => (tag.toLowerCase() === "javascript" ? "JavaScript" : tag));
  const learning = tags(
    source.learning?.length ? source.learning : source.learning_interest,
  );
  const industry = tags(source.industry);
  const industries = {
    "web development": "Web Development",
    cybersecurity: "Cyber Security",
    "cyber security": "Cyber Security",
    "computer science": "Computer Science",
  };
  for (const interest of tags(source.learning_interest)) {
    const matchingIndustry = industries[interest.toLowerCase()];
    if (matchingIndustry && !industry.includes(matchingIndustry))
      industry.push(matchingIndustry);
  }
  // Preserve other interests under Learning without inventing skills or industry tags.
  const commitment = tags(source.commitment);
  if (!commitment.length && typeof source.competitive === "boolean")
    commitment.push(source.competitive ? "Competitive" : "Casual");
  const project =
    source.currentProject && typeof source.currentProject === "object"
      ? source.currentProject
      : {};
  return {
    _id: source._id == null ? undefined : String(source._id),
    username: source.username || "",
    source: sourceType,
    profileKey:
      sourceType === "people"
        ? `~people.${source._id}`
        : source.username || `~${source._id}`,
    displayName: displayName || source.username || "Member",
    bio: source.bio || "",
    avatarUrl: safeLink(source.avatarUrl),
    pronouns: source.pronouns || "",
    experience: source.experience || source.hackathon_experience || "",
    technology: [...new Set(technology)],
    learning,
    industry,
    commitment,
    githubUrl: safeLink(source.githubUrl || source.github_link),
    linkedinUrl: safeLink(source.linkedinUrl || source.linkedin_link),
    currentProject: {
      name: typeof project.name === "string" ? project.name : "",
      description:
        typeof project.description === "string"
          ? project.description
          : source.project_description || "",
    },
    upcomingEvents: tags(source.upcomingEvents),
    organizations: tags(source.organizations),
    hackathons: tags(source.hackathons),
    ...(source.createdAt ? { createdAt: source.createdAt } : {}),
  };
}
module.exports = { publicProfileFields, toProfileView };
