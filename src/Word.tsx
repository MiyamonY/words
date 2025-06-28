import { useEffect, useState } from "react";
import type { Schema } from "@amplify/data/resource";
import { generateClient } from "aws-amplify/api";
import { Word } from "@/components/Word";
import { Navigate, useParams } from "react-router";
const client = generateClient<Schema>();

const Page = () => {
  const { id } = useParams();

  if (!id) {
    return <Navigate to="/404" />;
  }

  const [word, setWord] = useState<Schema["Word"]["type"] | null>(null);

  useEffect(() => {
    (async () => {
      const { data: word } = await client.models.Word.get({ id });

      setWord(word);
    })();
  }, [id]);

  const deleteWord = (id: string) => {
    client.models.Word.delete({ id });
  };

  return <Word word={word} onDelete={deleteWord} />;
};

export default Page;
