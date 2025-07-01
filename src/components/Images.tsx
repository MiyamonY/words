import type { Schema } from "@amplify/data/resource";
import { Button, Flex } from "@aws-amplify/ui-react";
import { StorageImage } from "@aws-amplify/ui-react-storage";
import { generateClient } from "aws-amplify/api";
import { useEffect, useState } from "react";
import { MdDelete as DeleteIcon } from "react-icons/md";

const client = generateClient<Schema>();

interface Props {
  word: Schema["Word"]["type"] | null;
}

export const Images = (props: Props) => {
  const { word } = props;

  const [images, setImages] = useState<Schema["Image"]["type"][]>([]);

  useEffect(() => {
    if (word) {
      const subscribe = client.models.Image.observeQuery({
        filter: { wordId: { eq: word.id } },
      }).subscribe({
        next: (data) => setImages([...data.items]),
      });

      return () => subscribe.unsubscribe();
    }
  }, [word]);

  const handleOnDelete = (id: string) => {
    client.models.Image.delete({ id });
  };

  return (
    <Flex direction="column">
      {images.map(({ id, path }) => {
        return (
          <Flex direction="column" key={id}>
            <StorageImage alt="img" path={path} width={128} height={128} />
            <Button size="small" onClick={() => handleOnDelete(id)} color="red">
              <DeleteIcon />
            </Button>
          </Flex>
        );
      })}
    </Flex>
  );
};
