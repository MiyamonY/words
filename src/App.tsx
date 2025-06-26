import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Words } from "./components/Words";
import { MainMenu } from "./components/Menu";
import { Flex, View } from "@aws-amplify/ui-react";
import { AddButton } from "./components/AddBtton";

const client = generateClient<Schema>();

function App() {
  const [words, setWords] = useState<Array<Schema["Word"]["type"]>>([]);

  useEffect(() => {
    client.models.Word.observeQuery().subscribe({
      next: (data) => setWords([...data.items]),
    });
  }, []);

  const createTodo = () => {
    client.models.Word.create({
      word: window.prompt("Word"),
      meaning: window.prompt("Meaning"),
    });
  };

  const deleteTodo = (id: string) => {
    client.models.Word.delete({ id });
  };

  return (
    <View as="main">
      <Flex direction="column" justifyContent="center" alignItems="center">
        <View as="header" alignSelf="end">
          <MainMenu />
        </View>
        <View maxWidth="400px">
          <Words words={words} onDelete={deleteTodo} />
        </View>
        <View maxWidth="400px">
          <AddButton onClick={createTodo} />
        </View>
      </Flex>
    </View>
  );
}

export default App;
