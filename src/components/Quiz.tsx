import type { Schema } from "@amplify/data/resource";
import { Button, Flex, Grid, Text } from "@aws-amplify/ui-react";
import { useState } from "react";
import {
  MdOutlineCircle as CorrectIcon,
  MdDelete as DeleteIcon,
  MdClear as WrongIcon,
} from "react-icons/md";

interface Props {
  quiz: Schema["Quiz"]["type"];
  onDelete: (id: string) => void;
}

export const Quiz = (props: Props) => {
  const { quiz, onDelete } = props;

  const [answered, setAnswered] = useState<"no" | "correct" | "wrong">("no");

  const handleDeleteQuiz = (id: string) => {
    onDelete(id);
  };

  return (
    <Flex direction="column">
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
        {quiz?.choices.map((choice, index) => (
          <Text
            key={choice}
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
          <Text columnStart="3" columnEnd="3">{`${quiz.answer}`}</Text>
          <Text fontWeight="bold" columnStart="2" columnEnd="2">
            Explanation
          </Text>
          <Text columnStart="3" columnEnd="3">{`${quiz.explanation}`}</Text>
        </Grid>
      )}
    </Flex>
  );
};
