export function getTenantId(request) {
  const url = new URL(request.url);

  const tenantFromUrl = url.searchParams.get("tenant");

  return tenantFromUrl || "generator";
}

export function getTenantConfig(tenantId, bots) {
  return bots[tenantId] || bots.generator;
}
