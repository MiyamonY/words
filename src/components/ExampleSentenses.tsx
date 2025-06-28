import type { Schema } from "@amplify/data/resource";
import { Button, Flex, Text } from "@aws-amplify/ui-react";
import { createAIHooks } from "@aws-amplify/ui-react-ai";
import { generateClient } from "aws-amplify/api";
import { useEffect, useState } from "react";
import { MdAdd as AddIcon, MdDelete as DeleteIcon } from "react-icons/md";

const client = generateClient<Schema>();

const { useAIGeneration } = createAIHooks(client);

interface Props {
  word: Schema["Word"]["type"] | null;
}

export const ExampleSentenses = (props: Props) => {
  const { word } = props;

  const [{ data: sentense, isLoading }, exampleSentense] =
    useAIGeneration("exampleSentense");

  useEffect(() => {
    (async () => {
      if (sentense && !!word) {
        await client.models.ExampleSentense.create({
          ...sentense,
          wordId: word.id,
        });
      }
    })();
  }, [sentense, word]);

  const generateExampleSentense = () => {
    if (!word) return;

    exampleSentense({ word: word.word });
  };

  const [sentenses, setSentenses] = useState<
    Schema["ExampleSentense"]["type"][]
  >([]);

  useEffect(() => {
    if (word) {
      const subscribe = client.models.ExampleSentense.observeQuery({
        filter: { wordId: { eq: word.id } },
      }).subscribe({
        next: (data) => setSentenses([...data.items]),
      });

      return () => subscribe.unsubscribe();
    }
  }, [word]);

  const handleOnDelete = (id: string) => {
    client.models.ExampleSentense.delete({ id });
  };

  return (
    <Flex direction="column">
      {sentenses.map(({ id, sentense }, index) => {
        return (
          <Flex direction="row" key={id}>
            <Text>{`${index + 1}. ${sentense?.en}`}</Text>
            <Button size="small" onClick={() => handleOnDelete(id)} color="red">
              <DeleteIcon />
            </Button>
          </Flex>
        );
      })}

      <Button
        size="small"
        onClick={generateExampleSentense}
        isLoading={isLoading}
      >
        <AddIcon />
      </Button>
    </Flex>
  );
};
