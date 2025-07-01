import { defineStorage } from "@aws-amplify/backend";
import { genWord } from "../functions/gen-word/resource";

export const storage = defineStorage({
  name: "wordsapp",
  access: (allow) => ({
    "images/*": [
      allow.authenticated.to(['read']),
      allow.resource(genWord).to(["read", "write", "delete"])],
  }),
  isDefault: true,
});
