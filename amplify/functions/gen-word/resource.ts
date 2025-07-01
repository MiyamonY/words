import { defineFunction } from "@aws-amplify/backend";

export const genWord = defineFunction({
  name: "gen-word",
  entry: "./handler.ts",
  timeoutSeconds: 60 * 3,
  environment: {
    IMAGE_MODEL: "amazon.nova-canvas-v1:0",
  },
});
