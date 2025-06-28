import {
  Alert,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  TextField,
} from "@aws-amplify/ui-react";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface Props {
  onAdd: (word: string) => void;
  onClose: () => void;
  open: boolean;
  hasError: { hasError: boolean; message?: string };
}

export const AddWordDialog = (props: Props) => {
  const { onAdd, onClose, open, hasError } = props;

  const [word, setWord] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);

  const show = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    if (open) {
      show();
    } else {
      close();
    }
  }, [open, show, close]);

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWord(e.target.value);
  };

  return (
    <dialog ref={dialogRef}>
      <Flex direction="column">
        <Heading>単語を追加</Heading>
        <TextField
          label="単語"
          errorMessage="There is an error"
          value={word}
          onChange={handleOnChange}
          isRequired
        />
        <ButtonGroup justifyContent="center">
          <Button onClick={() => onClose()}>キャンセル</Button>
          <Button onClick={() => onAdd(word)}>追加</Button>
        </ButtonGroup>
        {hasError.hasError && (
          <Alert variation="error">
            英単語の追加に失敗しました
            <br />
            {`(${hasError.message})`}
          </Alert>
        )}
      </Flex>
    </dialog>
  );
};
