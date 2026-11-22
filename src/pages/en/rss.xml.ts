import type { APIRoute } from "astro";
import { feedResponse } from "../../lib/feed";

export const GET: APIRoute = ({ site }) => feedResponse("en", site);
