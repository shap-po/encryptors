import {error, json} from '@sveltejs/kit';
import {languages} from "$lib/util/lang";
import {loadAndScoreText} from "$lib/server/tools/scoreText";

/**
 * Score the text based on the letter frequencies. The higher the score, the more likely the text is valid.
 * @param request - the request object, containing the language key and text
 * @constructor
 */
export async function POST({request}): Promise<Response> {
    // parse the request body
    let requestJson;
    try {
        requestJson = await request.json();
    } catch {
        return json({error: 'Invalid JSON'}, {status: 400});
    }

    const {language: language, text} = requestJson;

    // validate the parameters
    if (language === undefined) {
        throw error(400, 'Missing "language" parameter');
    }
    if (text === undefined) {
        throw error(400, 'Missing "text" parameter');
    }
    if (typeof language !== 'string') {
        throw error(400, 'Invalid "language" parameter');
    }
    if (typeof text !== 'string') {
        throw error(400, 'Invalid "text" parameter');
    }
    if (!languages[language]) {
        throw error(400, 'Invalid language');
    }

    const result = {
        score: await loadAndScoreText(language, text),
    };

    return json(result);
}
