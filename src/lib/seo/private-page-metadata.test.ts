import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  PRIVATE_APP_PATHS,
  ROBOTS_DISALLOW_PATHS,
} from "@/lib/seo/private-app-paths";
import {
  PRIVATE_PAGE_DESCRIPTION,
  PRIVATE_PAGE_ROBOTS,
  PRIVATE_PAGE_TITLE,
  privatePageMetadata,
} from "@/lib/seo/private-page-metadata";
import { PUBLIC_PAGE_ROBOTS, publicPageMetadata } from "@/lib/seo/page-metadata";
import { PUBLIC_INDEXABLE_PATHS } from "@/lib/seo/internal-links";

describe("private page robots contract", () => {
  it("emits noindex, nofollow for private surfaces including googleBot", () => {
    const meta = privatePageMetadata();
    expect(meta.robots).toEqual(PRIVATE_PAGE_ROBOTS);
    expect(meta.title).toEqual({ absolute: PRIVATE_PAGE_TITLE });
    expect(meta.description).toBe(PRIVATE_PAGE_DESCRIPTION);
    expect(meta.keywords).toEqual([]);
    expect(meta.openGraph).toMatchObject({
      title: PRIVATE_PAGE_TITLE,
      description: PRIVATE_PAGE_DESCRIPTION,
    });
    expect(PRIVATE_PAGE_ROBOTS).toMatchObject({
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    });
  });

  it("has an App Router layout for every private app path", () => {
    const appRoot = path.join(process.cwd(), "src", "app");
    for (const route of PRIVATE_APP_PATHS) {
      const layoutPath = path.join(appRoot, route.slice(1), "layout.tsx");
      expect(existsSync(layoutPath), `missing layout for ${route}`).toBe(true);
    }
  });

  it("keeps private prefixes in robots.txt disallow", () => {
    for (const route of PRIVATE_APP_PATHS) {
      expect(ROBOTS_DISALLOW_PATHS).toContain(route);
    }
  });

  it("does not mark legitimate public marketing pages as noindex", () => {
    for (const pathName of PUBLIC_INDEXABLE_PATHS) {
      const meta = publicPageMetadata({
        title: "t",
        description: "d",
        path: pathName,
      });
      expect(meta.robots).toEqual(PUBLIC_PAGE_ROBOTS);
    }
  });
});
