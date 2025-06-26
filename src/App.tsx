import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Words } from "./components/Words";
import { MainMenu } from "./components/Menu";
import { Flex, View } from "@aws-amplify/ui-react";
import { AddButton } from "./components/AddBtton";
import { AddWordDialog } from "./components/AddWordDialog";

const client = generateClient<Schema>();

function App() {
  const [words, setWords] = useState<Array<Schema["Word"]["type"]>>([]);

  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    client.models.Word.observeQuery().subscribe({
      next: (data) => setWords([...data.items]),
    });
  }, []);

  const addWord = (word: string) => {
    client.models.Word.create({
      word,
    });

    setOpen(false);
  };

  const deleteWord = (id: string) => {
    client.models.Word.delete({ id });
  };

  return (
    <View as="main">
      <Flex direction="column" justifyContent="center" alignItems="center">
        <View as="header" alignSelf="end">
          <MainMenu />
        </View>
        <View maxWidth="400px">
          <Words words={words} onDelete={deleteWord} />
        </View>
        <View maxWidth="400px">
          <AddButton onClick={() => setOpen(true)} />
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
