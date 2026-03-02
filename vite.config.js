import { defineConfig } from "vite";

import { resolve } from "path";

export default defineConfig({
	build: {
		outDir: "dist",

		rollupOptions: {
			input: {
				main: resolve(__dirname, "index.html"),

				browse: resolve(__dirname, "browse.html"),

				map: resolve(__dirname, "map.html"),
			},
		},
	},

	base: "./",
});
