import type { Schema } from "@amplify/data/resource";
import { Flex } from "@aws-amplify/ui-react";
import { createAIHooks } from "@aws-amplify/ui-react-ai";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AddButton } from "@/components/AddBtton";
import { AddWordDialog } from "@/components/AddWordDialog";
import { Words } from "@/components/Words";

const client = generateClient<Schema>();

const { useAIGeneration } = createAIHooks(client);

function App() {
  const [words, setWords] = useState<Array<Schema["Word"]["type"]>>([]);

  const [open, setOpen] = useState<boolean>(false);

  const [hasError, setHasError] = useState<{
    hasError: boolean;
    message?: string;
  }>({
    hasError: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    client.models.Word.observeQuery().subscribe({
      next: (data) => setWords([...data.items]),
    });
  }, []);

  // Though return value 'messages' is deprecated, error messages are in it.
  const [{ data, isLoading, messages }, wordMeaning] =
    useAIGeneration("wordMeaning");

  const addWord = (word: string) => {
    try {
      wordMeaning({ word });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    (async () => {
      console.log(messages);

      if (messages && messages?.length > 0) {
        setHasError({ hasError: true, message: messages[0].message });

        return;
      }

      if (data) {
        const { data: word, errors } = await client.models.Word.create({
          ...data,
        });

        if (errors || !word) {
          console.error(errors);

          return;
        }

        navigate(`/word/${word?.id}`);
      }
    })();
  }, [data, navigate, messages]);

  return (
    <Flex direction="column" justifyContent="center" alignItems="center">
      <Words words={words} />
      <AddButton onClick={() => setOpen(true)} loading={isLoading} />
      <AddWordDialog
        onAdd={addWord}
        onClose={() => setOpen(false)}
        open={open}
        hasError={hasError}
      />
    </Flex>
  );
}

export default App;
