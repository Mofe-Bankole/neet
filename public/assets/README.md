# Dotneet visual assets

These source SVG assets were created for this project. They contain original layout and text, with no bundled font binaries, stock photography or third-party icons. Arial/Helvetica are device fonts; use a licensed installed font when editing or exporting. The text wordmark is a version-one treatment, not a trademark clearance or a claim of official Nimiq endorsement.

Run `npm run assets:export` from the source root after changing `src/design/tokens.json`. Keep the JSON and CSS token source synchronized first. Edit `scripts/export-assets.mjs` for layout or copy changes. The SVG files are editable vector layouts; convert to PNG only at the final export size. A presentation app can place SVGs on 16:9 slides, but native editable slide masters are not included.

- `brand/dotneet-wordmark.svg`: navy-backed wordmark, 400×160.
- `templates/01…07`: seven 1920×1080 presentation examples.
- `templates/08-social-announcement.svg`: square 1080×1080 social layout.
- `templates/09-video-opening.svg` and `10-video-closing.svg`: 1920×1080 video frames.

Retain the explicit illustrative/sample disclosures in the evidence example. The demo and closing layouts contain visible insertion instructions; replace them with actual authorized material before publishing. No usage, payment, adoption or judging results are asserted.

See `docs/11-cross-format-templates.md` for compositions, safe areas, export guidance and asset-generation prompts. SVG files are representative templates, not a finished pitch deck.
