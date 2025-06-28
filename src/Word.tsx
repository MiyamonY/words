import type { Schema } from "@amplify/data/resource";
import { generateClient } from "aws-amplify/api";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import { Word } from "@/components/Word";

const client = generateClient<Schema>();

const Page = () => {
  const { id } = useParams();

  const [word, setWord] = useState<Schema["Word"]["type"] | null>(null);

  useEffect(() => {
    (async () => {
      const { data: word } = await client.models.Word.get({ id });

      setWord(word);
    })();
  }, [id]);

  if (!id) {
    return <Navigate to="/404" />;
  }

  const deleteWord = (id: string) => {
    client.models.Word.delete({ id });
  };

  return <Word word={word} onDelete={deleteWord} />;
};

export default Page;
