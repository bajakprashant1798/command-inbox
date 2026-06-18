import { corsair } from "@/server/corsair";
import { toNextJsHandler } from "corsair";

const handler = toNextJsHandler(corsair);

export const GET = handler.GET;
export const POST = handler.POST;
