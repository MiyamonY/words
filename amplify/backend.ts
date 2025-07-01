import { defineBackend } from "@aws-amplify/backend";
import * as iam from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { genWord } from "./functions/gen-word/resource";
import { storage } from "./storage/resource";

const backend = defineBackend({
  auth,
  data,
  storage,
  genWord,
});

const genWordLambda = backend.genWord.resources.lambda;

genWordLambda.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ["bedrock:*"],
    resources: ["*"],
  })
);
