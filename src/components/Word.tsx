import type { Schema } from "@amplify/data/resource";
import {
  Button,
  Flex,
  Grid,
  Heading,
  Pagination,
  Text,
} from "@aws-amplify/ui-react";
import { createAIHooks } from "@aws-amplify/ui-react-ai";
import { generateClient } from "aws-amplify/api";
import { useEffect, useState } from "react";
import { MdDelete as DeleteIcon } from "react-icons/md";
import { LiaFlagUsaSolid as USAIcon } from "react-icons/lia";
import { GiJapan as JapanIcon } from "react-icons/gi";
import { MdAdd as AddIcon } from "react-icons/md";
import { MdOutlineCircle as CorrectIcon } from "react-icons/md";
import { MdClear as WrongIcon } from "react-icons/md";

const client = generateClient<Schema>();

const { useAIGeneration } = createAIHooks(client);

interface Props {
  word: Schema["Word"]["type"] | null;
  onDelete: (id: string) => void;
}

export const Word = (props: Props) => {
  const { word, onDelete } = props;

  const [language, setLanguage] = useState<"English" | "Japanese">("English");

  const [quizes, setQuizes] = useState<Schema["Quiz"]["type"][]>([]);

  const [quizNo, setQuizNo] = useState<number>(1);

  const [answered, setAnswered] = useState<"no" | "correct" | "wrong">("no");

  const handleDeleteWord = () => {
    if (!word) return;

    onDelete(word.id);
  };

  const hanldeOnClickLanguage = () => {
    if (language === "English") {
      setLanguage("Japanese");
    } else {
      setLanguage("English");
    }
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

  const [{ data, isLoading }, wordQuiz] = useAIGeneration("wordQuiz");

  const generateQuiz = () => {
    if (!word) return;

    wordQuiz({ word: word.word });
  };

  useEffect(() => {
    (async () => {
      if (data && !!word) {
        await client.models.Quiz.create({
          ...data,
          wordId: word.id,
        });
      }
    })();
  }, [data]);

  const handleNextPage = () => {
    setQuizNo((prev) => prev + 1);
    setAnswered("no");
  };

  const handlePreviousPage = () => {
    setQuizNo((prev) => prev - 1);
    setAnswered("no");
  };

  const handleDeleteQuiz = (id: string) => {
    client.models.Quiz.delete({ id });
  };

  return (
    <Flex direction="column" justifyContent="center" alignItems="center">
      <Heading level={1}>{word?.word}</Heading>

      <Heading level={4}>Meaning</Heading>
      <Flex>
        <Text>
          {language === "English" ? word?.meaning : word?.meaningJapanese}
        </Text>
        <Button onClick={hanldeOnClickLanguage}>
          {language === "English" ? <USAIcon /> : <JapanIcon />}
        </Button>
      </Flex>

      <Heading level={4}>Quiz</Heading>
      <Flex direction="column">
        {quizes.length > 0 && (
          <>
            {quizes.map((quiz, index) => {
              if (index + 1 !== quizNo) {
                return null;
              }

              return (
                <Flex key={quiz.id} direction="column">
                  <Flex>
                    <Text>{quiz.quiz}</Text>

                    <Button
                      size="small"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      color="red"
                    >
                      <DeleteIcon />
                    </Button>
                  </Flex>
                  <Flex direction="column">
                    {quiz.choices.map((choice, index) => (
                      <Text
                        key={index}
                        onClick={() => {
                          if (choice === quiz.answer) {
                            setAnswered("correct");
                          } else {
                            setAnswered("wrong");
                          }
                        }}
                      >
                        {`${index + 1}. ${choice}`}
                      </Text>
                    ))}
                  </Flex>
                  {(answered === "correct" || answered === "wrong") && (
                    <Grid templateColumns="1fr 1fr 10fr" templateRows="1fr 3f">
                      <Flex
                        rowStart="1"
                        rowEnd="-1"
                        fontSize="6rem"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {answered === "correct" ? (
                          <CorrectIcon color="green" />
                        ) : (
                          <WrongIcon color="red" />
                        )}
                      </Flex>
                      <Text fontWeight="bold" columnStart="2" columnEnd="2">
                        Answer
                      </Text>
                      <Text
                        columnStart="3"
                        columnEnd="3"
                      >{`${quiz.answer}`}</Text>
                      <Text fontWeight="bold" columnStart="2" columnEnd="2">
                        Explanation
                      </Text>
                      <Text
                        columnStart="3"
                        columnEnd="3"
                      >{`${quiz.explanation}`}</Text>
                    </Grid>
                  )}
                </Flex>
              );
            })}

            <Pagination
              currentPage={quizNo}
              totalPages={quizes.length}
              siblingCount={1}
              onNext={handleNextPage}
              onPrevious={handlePreviousPage}
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
