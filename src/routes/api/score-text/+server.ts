import {parseRequestOrThrow, z} from "$lib/server/util/api";
import {json} from '@sveltejs/kit';
import {languages} from "$lib/util/lang";
import {loadAndScoreText} from "$lib/util/frequencyAnalysis";

const PostSchema = z.object({
    language: z.string().refine((val) => languages[val]),
    text: z.string(),
});

export async function POST({request}): Promise<Response> {
    const {language, text} = await parseRequestOrThrow(request, PostSchema);

    const result = {
        score: await loadAndScoreText(language, text),
    };

    return json(result);
}
