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
    const meaning = await generateMeaning(word);

    const { data, errors } = await appClient.models.Word.create({
      word,
      meaning,
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

const generateMeaning = async (word: string) => {
  const prompt = `Please provide the meaning of the word "${word}" in both English and Japanese. Following these guidelines:
- Provide concise and clear definitions
- Include definitions of the word only
- Output format below

<en>[English explanation here]</en>
<ja>[Japanese explanation here]</ja>`;

  const command = new InvokeModelCommand({
    modelId: "apac.anthropic.claude-3-7-sonnet-20250219-v1:0",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }],
        },
      ],
    }),
  });

  const res = await bedrockClient.send(command);

  const body = JSON.parse(Buffer.from(res.body).toString("utf-8"));

  const text = body.content[0].text.replace(/\r?\n/g, "");

  return {
    en: extractTagValue(text, "en") ?? "",
    ja: extractTagValue(text, "ja") ?? "",
  };
};

const extractTagValue = (text: string, tagName: string): string | undefined => {
  const regex = new RegExp(`<${tagName}>(.*?)</${tagName}>`, "i");

  const match = text.match(regex);

  return match ? match[1] : undefined;
};
