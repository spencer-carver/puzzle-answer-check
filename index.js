const INTERMEDIATE_MAP = require("./intermediates");
const ANSWERS_MAP = require("./answers");
const HINTS = require("./hints");
const { isAllowed, STAGING_API_DOMAIN } = require("./private-helpers");
const statsHelper = require("./statsHelper");

function massageAnswer(answer) {
    return answer.toUpperCase().replace(/\\p{Punct}/g, "").replace(/-/g, "").replace(/\s/g, "").replace(/[!-\/:-@[-`{-~]/g, "");
}

exports.handler = async (event) => {
    console.log(event);
    const {
        headers,
        pathParameters,
        requestContext,
        body
    } = event;
    
    const origin = headers.origin || headers.Origin;
    
    if ((!origin && requestContext.domainName !== STAGING_API_DOMAIN) || (origin && !isAllowed(origin))) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: "CORS error" })
        };
    }

    const { puzzleName } = pathParameters;
    const { uuid, answer, hintCount } = JSON.parse(body);
    
    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true"
        },
        multiValueHeaders: {}
    };
    
    const candidateAnswer = massageAnswer(answer);
    const solution = massageAnswer(ANSWERS_MAP[puzzleName]);
    
    if (solution === candidateAnswer) {
        response.body = JSON.stringify({
            correct: true,
            submission: candidateAnswer,
            value: ANSWERS_MAP[puzzleName]
        });
        
        if (origin.startsWith("https")) {
            await statsHelper.addCorrect(origin, puzzleName, uuid);
        }
    } else if (Object.keys(INTERMEDIATE_MAP[puzzleName]).indexOf(candidateAnswer) !== -1) {
        response.body = JSON.stringify({
            correct: false,
            intermediate: true,
            submission: candidateAnswer,
            value: INTERMEDIATE_MAP[puzzleName][candidateAnswer]
        });

        if (origin.startsWith("https")) {
            await statsHelper.addIntermediate(origin, puzzleName);
        }
    } else if (candidateAnswer === "HINT") {
        const hintIndex = hintCount >= HINTS[puzzleName].length ? HINTS[puzzleName].length - 1 : hintCount;
        response.body = JSON.stringify({
            correct:false,
            hint: true,
            submission: candidateAnswer,
            value: HINTS[puzzleName][hintIndex]
        });
        
        if (origin.startsWith("https")) {
            await statsHelper.addHint(origin, puzzleName);
        }
    } else {
        response.body = JSON.stringify({
            correct: false,
            submission: candidateAnswer,
            value: candidateAnswer
        });
        
        if (origin.startsWith("https")) {
            await statsHelper.addIncorrect(origin, puzzleName, candidateAnswer);
        }
    }

    return response;
};
