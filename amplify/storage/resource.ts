import { defineStorage } from "@aws-amplify/backend";
import { wordStream } from "../functions/word-stream/resource";

export const storage = defineStorage({
  name: "wordsapp",
  access: (allow) => ({
    "images/*": [
      allow.authenticated.to(["read"]),
      allow.resource(wordStream).to(["read", "write", "delete"]),
    ],
  }),
  isDefault: true,
});
