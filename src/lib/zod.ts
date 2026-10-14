import type { ZodObject, ZodRawShape } from "astro/zod";
import { render } from "astro:content";

/**
 * Renders a collection entry, with remarkPluginFrontmatter
 * validated/typed against an additional Zod schema.
 */
export async function renderAndValidate<T extends ZodRawShape>(
  entry: any,
  schema: ZodObject<T>
) {
  const result = await render(entry);
  return {
    ...result,
    remarkPluginFrontmatter: schema.parse(result.remarkPluginFrontmatter),
  };
}
