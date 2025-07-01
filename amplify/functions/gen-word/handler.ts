import { env } from "$amplify/env/gen-word";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../data/resource";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  env
);

const Bucket = env.WORDSAPP_BUCKET_NAME;

Amplify.configure(resourceConfig, libraryOptions);

const appClient = generateClient<Schema>();

const s3Client = new S3Client();

const bedrockClient = new BedrockRuntimeClient();

export const handler: Schema["genWord"]["functionHandler"] = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

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

    const key = await generateImage(word);

    const { errors: imageErrors } = await appClient.models.Image.create({
      wordId: data?.id ?? "",
      path: key,
    });

    if (imageErrors && imageErrors.length > 0) {
      throw new Error(imageErrors[0].message);
    }

    return data;
  } catch (error) {
    console.error("Error generating image:", error);

    throw error;
  }
};

const generateMeaning = async (word: string) => {
  const prompt = `Please provide the meaning of the word "${word}" in both English and Japanese. Following these guidelines:
- Provide concise and clear definitions
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

  console.log("generateMeaning", { text });

  return {
    en: extractTagValue(text, "en") ?? "",
    ja: extractTagValue(text, "ja") ?? "",
  };
};

const generateImage = async (word: string) => {
  const prompt = `Please generate an image based on ${word} following these guidelines:
- Visually depict what ${word} represents or means
- Do not include the actual word text in the image
- Design it to be memorable and helpful for English language learning`;

  const command = new InvokeModelCommand({
    modelId: "amazon.nova-canvas-v1:0",
    body: JSON.stringify({
      taskType: "TEXT_IMAGE",
      textToImageParams: {
        text: prompt,
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
