import {error} from "@sveltejs/kit";
import {z, ZodSchema} from "zod";

export async function parseRequestOrThrow<T>(request: Request, zodSchema: ZodSchema<T>): Promise<T> {
    let requestJson;
    try {
        requestJson = await request.json();
    } catch {
        throw error(400, 'Invalid JSON');
    }

    const parsed = zodSchema.safeParse(requestJson);

    if (!parsed.success) {
        throw error(400, parsed.error);
    }

    return parsed.data;
}

export {z};
