import { defineBackend } from "@aws-amplify/backend";
import * as iam from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { genWord } from "./functions/gen-word/resource";
import { wordStream } from "./functions/word-stream/resource";
import { storage } from "./storage/resource";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Stack } from "aws-cdk-lib";
import { EventSourceMapping, StartingPosition } from "aws-cdk-lib/aws-lambda";

const backend = defineBackend({
  auth,
  data,
  storage,
  genWord,
  wordStream,
});

const genWordLambda = backend.genWord.resources.lambda;

genWordLambda.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ["bedrock:*"],
    resources: ["*"],
  }),
);

const wordStreamLambda = backend.wordStream.resources.lambda;

wordStreamLambda.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ["bedrock:*"],
    resources: ["*"],
  }),
);

const wordTable = backend.data.resources.tables.Word;

const policy = new Policy(
  Stack.of(wordTable),
  "MyDynamoDBFunctionStreamingPolicy",
  {
    statements: [
      new PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams",
        ],
        resources: ["*"],
      }),
    ],
  },
);

backend.wordStream.resources.lambda.role?.attachInlinePolicy(policy);

const mapping = new EventSourceMapping(
  Stack.of(wordTable),
  "WordTableStreamMapping",
  {
    target: backend.wordStream.resources.lambda,
    eventSourceArn: wordTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  },
);

mapping.node.addDependency(policy);
