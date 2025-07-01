import type { Schema } from "@amplify/data/resource";
import { Button, Flex, Heading, Pagination, Text } from "@aws-amplify/ui-react";
import { createAIHooks } from "@aws-amplify/ui-react-ai";
import { generateClient } from "aws-amplify/api";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { MdAdd as AddIcon, MdDelete as DeleteIcon } from "react-icons/md";
import { useNavigate } from "react-router";
import { jaAtom } from "@/storage";
import { ExampleSentenses } from "./ExampleSentenses";
import { Images } from "./Images";
import { Quiz } from "./Quiz";

const client = generateClient<Schema>();

const { useAIGeneration } = createAIHooks(client);

interface Props {
  id: string;
}

export const Word = (props: Props) => {
  const { id } = props;

  const [ja] = useAtom(jaAtom);

  const navigate = useNavigate();

  const [word, setWord] = useState<Schema["Word"]["type"] | null>(null);

  useEffect(() => {
    (async () => {
      const { data: word } = await client.models.Word.get({ id });

      setWord(word);
    })();
  }, [id]);

  const [quizes, setQuizes] = useState<Schema["Quiz"]["type"][]>([]);

  const [quizNo, setQuizNo] = useState<number>(1);

  const handleDeleteWord = async () => {
    if (!word) return;

    await client.models.Word.delete({ id: word.id });

    navigate("/");
  };

  useEffect(() => {
    if (word) {
      const subscribe = client.models.Quiz.observeQuery({
        filter: { wordId: { eq: word.id } },
      }).subscribe({
        next: (data) => setQuizes([...data.items]),
      });

      return () => subscribe.unsubscribe();
    }
  }, [word]);

  const [{ data: quiz, isLoading }, wordQuiz] = useAIGeneration("wordQuiz");

  const generateQuiz = () => {
    if (!word) return;

    wordQuiz({ word: word.word });
  };

  useEffect(() => {
    (async () => {
      if (quiz && !!word) {
        await client.models.Quiz.create({
          ...quiz,
          wordId: word.id,
        });
      }
    })();
  }, [quiz, word]);

  const hndleOnDelete = async (id: string) => {
    await client.models.Quiz.delete({ id });
  };

  const handleNextPage = () => {
    setQuizNo((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    setQuizNo((prev) => prev - 1);
  };

  const handleChange = (newPageIndex?: number, _?: number) => {
    if (newPageIndex) {
      setQuizNo(newPageIndex);
    }
  };

  return (
    <Flex direction="column" justifyContent="center" alignItems="center">
      <Heading level={1}>{word?.word}</Heading>

      <Heading level={4}>Meaning</Heading>
      <Flex direction="column" alignItems="center">
        <Text>{word?.meaning?.en}</Text>
        {ja && <Text>{word?.meaning?.ja}</Text>}
      </Flex>

      <Heading level={4}>Image</Heading>
      <Images word={word} />

      <Heading level={4}>Examples</Heading>
      <ExampleSentenses word={word} />

      <Heading level={4}>Quiz</Heading>
      <Flex direction="column">
        {quizes.length > 0 && (
          <>
            {quizes.map((quiz, index) => {
              if (index + 1 !== quizNo) {
                return null;
              }

              return (
                <Quiz quiz={quiz} key={quiz.id} onDelete={hndleOnDelete} />
              );
            })}

            <Pagination
              currentPage={quizNo}
              totalPages={quizes.length}
              siblingCount={1}
              onNext={handleNextPage}
              onPrevious={handlePreviousPage}
              onChange={handleChange}
            />
          </>
        )}
        <Button size="small" onClick={generateQuiz} isLoading={isLoading}>
          <AddIcon />
        </Button>
      </Flex>
      <Button size="small" onClick={handleDeleteWord} color="red">
        <DeleteIcon />
      </Button>
    </Flex>
  );
};
