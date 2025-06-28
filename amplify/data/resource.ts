import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  Word: a
    .model({
      word: a.string().required(),
      meaning: a.customType({
        en: a.string().required(),
        ja: a.string().required(),
      }),
      examples: a.hasMany("ExampleSentense", "wordId"),
      quizes: a.hasMany("Quiz", "wordId"),
    })
    .authorization((allow) => [allow.owner()]),
  ExampleSentense: a
    .model({
      sentense: a.customType({
        en: a.string().required(),
        ja: a.string().required(),
      }),
      wordId: a.id().required(),
      word: a.belongsTo("Word", "wordId"),
    })
    .authorization((allow) => [allow.owner()]),
  Quiz: a
    .model({
      quiz: a.string().required(),
      choices: a.string().array().required(),
      answer: a.string().required(),
      explanation: a.string().required(),
      wordId: a.id().required(),
      word: a.belongsTo("Word", "wordId"),
    })
    .authorization((allow) => [allow.owner()]),
  WordMeaningResponse: a.customType({
    word: a.string().required(),
    meaning: a.customType({
      en: a.string().required(),
      ja: a.string().required(),
    }),
  }),
  ExampleSentenseResponse: a.customType({
    sentense: a.customType({
      en: a.string().required(),
      ja: a.string().required(),
    }),
  }),
  QuizResponse: a.customType({
    quiz: a.string().required(),
    choices: a.string().required().array().required(),
    answer: a.string().required(),
    explanation: a.string().required(),
  }),
  wordMeaning: a
    .generation({
      aiModel: a.ai.model("Claude 3.5 Sonnet"),
      systemPrompt:
        "Generate meaning in Engish and Japanese of the given English word.",
      inferenceConfiguration: {
        maxTokens: 1000,
      },
    })
    .arguments({
      word: a.string(),
    })
    .returns(a.ref("WordMeaningResponse"))
    .authorization((allow) => [allow.authenticated()]),
  exampleSentense: a
    .generation({
      aiModel: a.ai.model("Claude 3.5 Sonnet"),
      systemPrompt:
        "Generate an example sentense in Engish and Japanese of the given English word.",
    })
    .arguments({
      word: a.string(),
    })
    .returns(a.ref("ExampleSentenseResponse"))
    .authorization((allow) => [allow.authenticated()]),
  wordQuiz: a
    .generation({
      aiModel: a.ai.model("Claude 3.5 Sonnet"),
      systemPrompt:
        "Please create a four-option multiple-choice question where students fill in the blank in an English sentence using the specified English word, and provide an explanation for the correct answer.",
      inferenceConfiguration: {
        maxTokens: 1000,
        temperature: 0.6,
        topP: 0.9,
      },
    })
    .arguments({
      word: a.string(),
    })
    .returns(a.ref("QuizResponse"))
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
