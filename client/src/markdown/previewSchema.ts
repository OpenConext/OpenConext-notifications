import { defaultSchema } from 'rehype-sanitize';
import type { Options } from 'rehype-sanitize';

// The editor preview renders raw HTML from the markdown (rehype-raw) without sanitizing it, so
// e.g. <iframe srcdoc="<script>..."> runs script on our origin (stored XSS, the notification is
// loaded in the editor again on edit). This schema is applied after rehype-raw and mirrors the
// policy of the server (MarkdownRenderer): only these elements, only href on links and only
// http, https and mailto links. Everything else (iframe, img, style, event handlers, ...) is removed.
export const previewSchema: Options = {
    ...defaultSchema,
    tagNames: [
        'p',
        'div',
        'span',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote',
        'ul',
        'ol',
        'li',
        'pre',
        'code',
        'hr',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'del',
        'sub',
        'sup',
        'a',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
    ],
    attributes: { a: ['href'] },
    protocols: { href: ['http', 'https', 'mailto'] },
    clobber: [],
};
