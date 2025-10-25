export function isAdminOrOwner(rolesMap, projectId) {
  const role = rolesMap[projectId];
  return role === "OWNER" || role === "ADMIN";
}

export function isViewer(rolesMap, projectId) {
  const role = rolesMap[projectId];
  return role === "VIEWER";
}

export function isMember(rolesMap, projectId) {
  const role = rolesMap[projectId];
  return role === "MEMBER";
}