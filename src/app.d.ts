declare global {
	namespace App {}

	// Injected by vite.config.ts at build time.
	const __COMMIT__: string;
	const __BUILT__: string;
}

export {};
