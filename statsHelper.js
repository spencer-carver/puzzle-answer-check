const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const client = new LambdaClient();

function formatCommand({ origin, operation, puzzleName, answer }) {
    return new InvokeCommand({
        FunctionName: "puzzle-stats",
        InvocationType: "Event",
        LogType: "None",
        Payload: JSON.stringify({
            headers: {
                origin
            },
            requestContext: {},
            pathParameters: {
                puzzleName

            },
            body: JSON.stringify({
                operation,
                answer
            })
        })
    });
}

async function addHint(origin, puzzleName) {
    return client.send(formatCommand({ origin, operation: "hint", puzzleName }));
}

async function addIntermediate(origin, puzzleName) {
    return client.send(formatCommand({ origin, operation: "intermediate", puzzleName }));
}

async function addCorrect(origin, puzzleName) {
    return client.send(formatCommand({ origin, operation: "correct", puzzleName }));
}

async function addIncorrect(origin, puzzleName, candidateAnswer) {
    return client.send(formatCommand({ origin, operation: "incorrect", puzzleName, answer: candidateAnswer }));
}

module.exports = {
    addHint,
    addIntermediate,
    addIncorrect,
    addCorrect
};
