# Pauline cooks

A Dutch and English catering website for Pauline in Arcen, created from the supplied brand presentation.

## Content and design

- `app/content.ts`: Dutch and English copy, service descriptions and example menus.
- `app/page.tsx`: page layout, menu tabs, language selection and enquiry form.
- `app/globals.css`: tomato-red and cream styling, typography, responsive layouts and reduced-motion support.
- `public/images`: supplied presentation imagery, including the watercolor figs and portrait.
- `public/fonts`: locally hosted typefaces.

The wordmark changes between Pauline kookt (NL) and Pauline cooks (EN). All handwritten elements use the shared `--font-handwriting` token. Biro Script Plus is currently resolved only when installed on the visitor's device; Caveat remains the bundled fallback. The exact Biro Script Plus webfont was not supplied. Once its webfont file is provided, add that source to the existing `@font-face` rule so every visitor sees the same face.

The main navigation selects the relevant menu. Menu choices are large, labelled controls; mobile service headings precede their images, and menu contents appear above explanatory copy. The small gallery uses two additional images from the supplied presentation.

## Enquiries

The form prepares an email or WhatsApp message for the visitor to review and send. It does not silently send messages or store enquiries. A copy option and direct email/WhatsApp links provide alternatives. Only the language preference is saved on the visitor's device.

The contact details are in `app/page.tsx`; accompanying contact copy is in `app/content.ts`. Prices, quantities, delivery and setup are confirmed in a personal proposal. There is no checkout, payment collection or invented booking availability.

## Local checks

Use the package manager and runtime profile configured in this checkout. Type checking: `node node_modules/typescript/bin/tsc --noEmit`. Build: `npm run build`. In the managed preview environment, use `sites-preview start` and `sites-preview stop`.

Deployment belongs to the Site identified by `.openai/hosting.json`. Use the Sites publication workflow and preserve that identity.
