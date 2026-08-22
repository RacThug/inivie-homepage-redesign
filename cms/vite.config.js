import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

/*
 * The scaffold shipped a `fonts: [bunny('Instrument Sans', ...)]` entry here.
 * It is removed rather than repointed: docs/DESIGN-SYSTEM.md ch. 8.1 puts the
 * admin on the system UI stack, so a downloaded typeface would be fetched on
 * every build and rendered by nothing.
 */
export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
