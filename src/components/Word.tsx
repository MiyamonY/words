import type { Schema } from "@amplify/data/resource";
import { Button, Flex, Heading } from "@aws-amplify/ui-react";
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
      <Heading>{word?.word}</Heading>
      <Button size="small" onClick={handleOnClick}>
        <DeleteIcon />
      </Button>
    </Flex>
  );
};
