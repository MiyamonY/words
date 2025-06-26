import type { Schema } from "../../amplify/data/resource";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { MdDelete as DeleteIcon } from "react-icons/md";

interface Props {
  words: Array<Schema["Word"]["type"]>;
  onDelete: (id: string) => void;
}

export const Words = (props: Props) => {
  const { words, onDelete } = props;

  return (
    <Table caption="" highlightOnHover={false}>
      <TableHead>
        <TableRow>
          <TableCell as="th">単語</TableCell>
          <TableCell as="th">意味</TableCell>
          <TableCell as="th">操作</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {words.map((todo) => (
          <TableRow key={todo.id}>
            <TableCell>{todo.word}</TableCell>
            <TableCell>{todo.meaning}</TableCell>
            <TableCell>
              <Button size="small" onClick={() => onDelete(todo.id)}>
                <DeleteIcon />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
