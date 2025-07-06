import { defineFunction } from "@aws-amplify/backend";

export const wordStream = defineFunction({
  name: "word-stream",
  resourceGroupName: "data",
  timeoutSeconds: 60 * 3,
});
