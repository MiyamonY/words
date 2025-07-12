import { env } from "$amplify/env/word-stream";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { Logger } from "@aws-lambda-powertools/logger";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import type { DynamoDBRecord, DynamoDBStreamHandler } from "aws-lambda";
import type { Schema } from "../../data/resource";

const Bucket = env.WORDSAPP_BUCKET_NAME;

const { resourceConfig, libraryOptions } =
  await getAmplifyDataClientConfig(env);

Amplify.configure(resourceConfig, libraryOptions);

const appClient = generateClient<Schema>();

const s3Client = new S3Client();

const bedrockClient = new BedrockRuntimeClient();

const logger = new Logger({
  logLevel: "DEBUG",
  serviceName: "word-stream",
});

export const handler: DynamoDBStreamHandler = async (event) => {
  await Promise.all(
    event.Records.map(async (record) => {
      logger.info(`Processing record: ${record.eventID}`);

      logger.info(`Event Type: ${record.eventName}`);

      if (record.eventName === "INSERT") {
        await handleRecord(record);
      }
    }),
  );

  logger.info(`Successfully processed ${event.Records.length} records.`);

  return {
    batchItemFailures: [],
  };
};

const handleRecord = async (record: DynamoDBRecord) => {
  logger.info(`record`, { data: record });

  const newImage = record.dynamodb?.NewImage;
  if (!newImage) {
    logger.error(`New image is undefined`);

    throw new Error("new image is null");
  }

  const id = newImage.id.S;

  const word = newImage.word.S;

  logger.debug(`id:${id}, word:${word}`);

  if (!id || !word) {
    logger.error(`id or word is null`, { data: { id, word } });

    throw new Error("word is null");
  }

  await updateMeaning(id, word);

  await createImage(id, word);

  logger.info("success");
};

const updateMeaning = async (id: string, word: string) => {
  const meaning = await generateMeaning(word);

  const { errors } = await appClient.models.Word.update({
    id,
    meaning,
  });

  if (errors && errors.length > 0) {
    logger.error("app client error", errors[0] as unknown as Error);

    throw new Error(errors[0].message);
  }
};

const createImage = async (id: string, word: string) => {
  const key = await generateImage(word);

  const { errors } = await appClient.models.Image.create({
    wordId: id,
    path: key,
  });

  if (errors && errors.length > 0) {
    logger.error("app client error", errors[0] as unknown as Error);

    throw new Error(errors[0].message);
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

const generateImageDescription = async (word: string) => {
  const prompt = `You are a skilled prompt engineer.
Your task is to create a prompt for an image generation AI model that will produce a visually memorable
and educational image to help English language learners understand and remember the word '${word}'.
The image should clearly convey the meaning of the word while being engaging and easy to remember.
Please provide the image generation prompt enclosed within <description></description> tags.`;

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

  return extractTagValue(text, "description");
};

const generateImage = async (word: string) => {
  const description = await generateImageDescription(word);

  logger.debug("description", { data: description });

  const command = new InvokeModelCommand({
    modelId: "amazon.nova-canvas-v1:0",
    body: JSON.stringify({
      taskType: "TEXT_IMAGE",
      textToImageParams: {
        text: description,
      },
      imageGenerationConfig: {
        width: 320,
        height: 320,
        seed: Math.floor(Math.random() * 858993460),
        quality: "standard",
      },
    }),
  });

  const response = await bedrockClient.send(command);

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  if (!responseBody.images || responseBody.images.length === 0) {
    throw new Error("No images generated");
  }

  const imageBase64 = responseBody.images[0];

  const imageBuffer = Buffer.from(imageBase64, "base64");

  const key = `images/${word}-${Date.now()}.png`;

  const uploadCommand = new PutObjectCommand({
    Bucket,
    Key: key,
    Body: imageBuffer,
    ContentType: "image/png",
  });

  await s3Client.send(uploadCommand);

  return key;
};

const extractTagValue = (text: string, tagName: string): string | undefined => {
  const regex = new RegExp(`<${tagName}>(.*?)</${tagName}>`, "i");

  const match = text.match(regex);

  return match ? match[1] : undefined;
};
