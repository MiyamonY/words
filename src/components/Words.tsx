import type { Schema } from "@amplify/data/resource";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useNavigate } from "react-router";

interface Props {
  words: Array<Schema["Word"]["type"]>;
}

export const Words = (props: Props) => {
  const { words } = props;

  const navigate = useNavigate();

  const handleOnClick = (id: string) => {
    navigate(`/word/${id}`);
  };

  return (
    <Table highlightOnHover variation="striped">
      <TableHead>
        <TableRow>
          <TableCell as="th">単語</TableCell>
          <TableCell as="th">意味</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {words.map(({ id, word, meaning }) => (
          <TableRow key={id} onClick={() => handleOnClick(id)}>
            <TableCell>{word}</TableCell>
            <TableCell>{meaning}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
