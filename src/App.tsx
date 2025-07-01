import type { Schema } from "@amplify/data/resource";
import { Flex } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AddButton } from "@/components/AddBtton";
import { AddWordDialog } from "@/components/AddWordDialog";
import { Words } from "@/components/Words";

const client = generateClient<Schema>();

function App() {
  const [loading, setLoading] = useState<boolean>(false);

  const [words, setWords] = useState<Array<Schema["Word"]["type"]>>([]);

  const [open, setOpen] = useState<boolean>(false);

  const [hasError, setHasError] = useState<
    | {
        hasError: false;
      }
    | { hasError: true; message: string }
  >({
    hasError: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    client.models.Word.observeQuery().subscribe({
      next: (data) => setWords([...data.items]),
    });
  }, []);

  const addWord = async (word: string) => {
    setLoading(true);

    try {
      const { data, errors } = await client.mutations.genWord({ word });

      setHasError({
        hasError: true,
        message: errors?.map((error) => error.message).join("\n") ?? "",
      });

      navigate(`/word/${data?.id}`);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <Flex direction="column" justifyContent="center" alignItems="center">
      <Words words={words} />

      <AddButton onClick={() => setOpen(true)} loading={loading} />

      <AddWordDialog
        onAdd={addWord}
        onClose={() => setOpen(false)}
        open={open}
        hasError={hasError}
        loading={loading}
      />
    </Flex>
  );
}

export default App;
