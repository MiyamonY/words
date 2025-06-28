import type { Schema } from "@amplify/data/resource";
import { Button, Flex, Heading, Text } from "@aws-amplify/ui-react";
import { MdDelete as DeleteIcon } from "react-icons/md";

interface Props {
  word: Schema["Word"]["type"] | null;
  onDelete: (id: string) => void;
}

export const Word = (props: Props) => {
  const { word, onDelete } = props;

  const handleOnClick = () => {
    if (!word) return;

    onDelete(word.id);
  };

  return (
    <Flex direction="column" justifyContent="center" alignItems="center">
      <Heading level={1}>{word?.word}</Heading>

      <Heading level={4}>意味</Heading>
      <Text>{word?.meaning}</Text>

      <Button size="small" onClick={handleOnClick} color="red">
        <DeleteIcon />
      </Button>
    </Flex>
  );
};
