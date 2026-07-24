// Explicit Node.js runtime — required for fs, crypto, and path modules
// that are incompatible with Vercel Edge Runtime.
export const runtime = "nodejs";

import app from "../server.ts";
export default app;
