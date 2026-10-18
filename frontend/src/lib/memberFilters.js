export function matchesMember(member, query, filters) {
  const search = query.trim().toLowerCase();
  return (
    (!search ||
      [
        member.displayName,
        member.username,
        ...(member.technology || []),
        ...(member.industry || []),
      ].some((value) => value?.toLowerCase().includes(search))) &&
    Object.entries(filters).every(
      ([group, selected]) =>
        !selected.length ||
        selected.some((tag) => (member[group] || []).includes(tag)),
    )
  );
}
