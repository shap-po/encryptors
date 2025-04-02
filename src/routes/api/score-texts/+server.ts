import {parseRequestOrThrow, z} from "$lib/server/util/api";
import {json} from '@sveltejs/kit';
import {languages} from "$lib/util/lang";
import {loadAndScoreTexts} from "$lib/util/frequencyAnalysis";

const PostSchema = z.object({
    language: z.string().refine((val) => languages[val]),
    texts: z.string().array(),
});

export async function POST({request}): Promise<Response> {
    const {language, texts} = await parseRequestOrThrow(request, PostSchema);
    const result = await loadAndScoreTexts(language, texts);
    return json(result);
}
