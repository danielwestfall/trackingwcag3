/**
 * Display label for a WCAG 3 provision type, matching how W3C renders it
 * (computeProvisionTypeLabel in w3c/wcag3 src/lib/guidelines.ts): the source
 * frontmatter says "foundational", but the published draft says
 * "Core requirement", and an untyped provision is shown as "Requirement".
 * Use this anywhere a type is shown to readers; keep the raw value for
 * filtering and data attributes.
 */
export function provisionTypeLabel(type: string | null | undefined): string {
  if (!type) return "Requirement";
  if (type === "foundational") return "Core requirement";
  if (type === "supplemental") return "Supplemental requirement";
  if (type === "assertion") return "Assertion";
  if (type === "recommended practice") return "Recommended practice";
  return type.charAt(0).toUpperCase() + type.slice(1);
}
