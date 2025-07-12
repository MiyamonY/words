import { env } from "$amplify/env/gen-word";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { Logger } from "@aws-lambda-powertools/logger";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../data/resource";

const { resourceConfig, libraryOptions } =
  await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const appClient = generateClient<Schema>();

const bedrockClient = new BedrockRuntimeClient();

const logger = new Logger({
  logLevel: "DEBUG",
  serviceName: "gen-word",
});

export const handler: Schema["genWord"]["functionHandler"] = async (event) => {
  logger.info("Event:", { data: event });

  const word = event.arguments.word ?? "";

  try {
    const { data, errors } = await appClient.models.Word.create({
      word,
      // owner: (event?.identity as { username: string }).username, // AppSyncIdentityCognito
    });

    if (errors && errors.length > 0) {
      throw new Error(errors[0].message);
    }

    return data;
  } catch (error) {
    logger.error(`Error generating image: ${error}`);

    throw error;
  }
};

