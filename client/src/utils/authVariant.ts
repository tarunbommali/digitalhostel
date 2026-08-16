// Determines platform vs tenant branding for any auth-flow page
export function resolveAuthVariant(orgSlug?: string): "platform" | "tenant" {
  return orgSlug ? "tenant" : "platform";
}

export default resolveAuthVariant;
