const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const client = new LambdaClient();

function formatCommand({ origin, operation, puzzleName, answer, uuid }) {
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
                answer,
                uuid
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

async function addCorrect(origin, puzzleName, uuid) {
    return client.send(formatCommand({ origin, operation: "correct", puzzleName, uuid }));
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
