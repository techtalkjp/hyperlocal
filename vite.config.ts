import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [
      { name: "vite-plus", specifier: "vite-plus/oxlint-plugin" },
      // shadcn design-system rules (policy: apps/web/design.md)
      { name: "shadcn", specifier: "@shadcn/lint" },
    ],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      "shadcn/no-restyle": [
        "error",
        {
          allow: ["layout"],
          contracts: [
            // generic containers: layout primitives, not chrome
            { pattern: "^(Stack|HStack)$", allow: ["layout", "spacing", "shape"] },
            { pattern: "^CardTitle$", allow: ["layout", "typography"] },
            { pattern: "^CardHeader$", allow: ["layout", "spacing"] },
            { pattern: "^CardContent$", allow: ["layout", "spacing"] },
            { pattern: "^CardFooter$", allow: ["layout", "spacing"] },
            // data cells carry text by nature
            { pattern: "^TableCell$", allow: ["layout", "color", "typography"] },
            // tab active-state is customized by design (brand marker)
            { pattern: "^TabsTrigger$", allow: ["layout", "color", "shape"] },
            // admin article editor uses mono for JSON bodies
            { pattern: "^Textarea$", allow: ["layout", "typography"] },
          ],
        },
      ],
      "shadcn/no-raw-colors": "error",
      "shadcn/no-arbitrary-values": ["error", { allow: ["layout"] }],
      "shadcn/no-inline-styles": "error",
      "shadcn/no-unknown-classes": "error",
      "shadcn/require-static-classes": "error",
    },
    overrides: [
      // shadcn-canonical internals style themselves
      {
        files: ["**/components/ui/**"],
        rules: {
          "shadcn/no-restyle": "off",
          "shadcn/no-arbitrary-values": "off",
          "shadcn/no-unknown-classes": "off",
        },
      },
      // view-transition names and continuous numeric values are dynamic per element
      {
        files: [
          "apps/web/app/components/area-link-card.tsx",
          "apps/web/app/routes/_public.($lang)/_index.tsx",
          "apps/web/app/routes/_public.($lang)/area/$area/_index.tsx",
          "apps/web/app/routes/_public.($lang)/area/$area/$category/route.tsx",
          "apps/web/app/routes/_public.($lang)/place/$place/route.tsx",
          "apps/web/app/features/place/components/localized-place-card/image-section.tsx",
          "apps/web/app/features/place/components/localized-place-card/info-section.tsx",
          "apps/web/app/features/place/components/localized-place-details.tsx",
          "apps/admin/app/features/place/components/localized-place-card/image-section.tsx",
          "apps/admin/app/features/place/components/localized-place-card/info-section.tsx",
          "apps/admin/app/features/place/components/localized-place-details.tsx",
          "apps/web/app/features/place/components/rating.tsx",
          "apps/admin/app/features/place/components/rating.tsx",
        ],
        rules: { "shadcn/no-inline-styles": "off" },
      },
    ],
    options: { typeAware: true, typeCheck: true },
  },
});
