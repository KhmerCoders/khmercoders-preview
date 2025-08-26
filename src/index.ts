/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { Container, getRandom } from "@cloudflare/containers";

export class Backend extends Container {
	defaultPort = 3000;
	sleepAfter = "10m";
}

export interface Env {
	BACKEND: DurableObjectNamespace<Backend>;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const containerInstance = await getRandom(env.BACKEND, 1);
		return containerInstance.fetch(request);
	},
} satisfies ExportedHandler<Env>;
