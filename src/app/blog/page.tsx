import { BlogIndex } from "@/app/blog/blog-index";
import { BLOG_INDEX_DESCRIPTION, BLOG_INDEX_TITLE } from "@/app/blog/copy";
import { JsonLd } from "@/components/seo/json-ld";
import { ROUTES } from "@/lib/routes";
import { buildMarketingPageJsonLd } from "@/lib/seo/structured-data";

export default function BlogPage() {
  return (
    <>
      <JsonLd
        data={buildMarketingPageJsonLd({
          name: BLOG_INDEX_TITLE,
          path: ROUTES.blog,
          description: BLOG_INDEX_DESCRIPTION,
        })}
      />
      <BlogIndex />
    </>
  );
}
