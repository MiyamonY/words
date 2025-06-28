import { useEffect, useState } from "react";
import type { Schema } from "@amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Words } from "@/components/Words";
import { MainMenu } from "@/components/Menu";
import { Flex, View } from "@aws-amplify/ui-react";
import { AddButton } from "@/components/AddBtton";
import { AddWordDialog } from "@/components/AddWordDialog";
import { createAIHooks } from "@aws-amplify/ui-react-ai";

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
    <View as="main">
      <Flex direction="column" justifyContent="center" alignItems="center">
        <View as="header" alignSelf="end">
          <MainMenu />
        </View>
        <View maxWidth="400px">
          <Words words={words} />
        </View>
        <View maxWidth="400px">
          <AddButton onClick={() => setOpen(true)} loading={isLoading} />
        </View>
      </Flex>
      <AddWordDialog
        onAdd={addWord}
        onClose={() => setOpen(false)}
        open={open}
      />
    </View>
  );
}

export default App;
