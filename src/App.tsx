import type { Schema } from "@amplify/data/resource";
import { Flex } from "@aws-amplify/ui-react";
import { createAIHooks } from "@aws-amplify/ui-react-ai";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState } from "react";
import { AddButton } from "@/components/AddBtton";
import { AddWordDialog } from "@/components/AddWordDialog";
import { Words } from "@/components/Words";

const client = generateClient<Schema>();

const { useAIGeneration } = createAIHooks(client);

function App() {
  const [words, setWords] = useState<Array<Schema["Word"]["type"]>>([]);

  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    client.models.Word.observeQuery().subscribe({
      next: (data) => setWords([...data.items]),
    });
  }, []);

  const [{ data, isLoading }, wordMeaning] = useAIGeneration("wordMeaning");

  const addWord = (word: string) => {
    wordMeaning({ word });

    setOpen(false);
  };

  useEffect(() => {
    if (data) {
      client.models.Word.create({ ...data });
    }
  }, [data]);

  return (
    <Flex direction="column" justifyContent="center" alignItems="center">
      <Words words={words} />
      <AddButton onClick={() => setOpen(true)} loading={isLoading} />
      <AddWordDialog
        onAdd={addWord}
        onClose={() => setOpen(false)}
        open={open}
      />
    </Flex>
  );
}

export default App;
