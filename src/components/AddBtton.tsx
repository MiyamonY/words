import { Button } from "@aws-amplify/ui-react";

interface Props {
  onClick: () => void;
}

export const AddButton = (props: Props) => {
  const { onClick } = props;

  return <Button onClick={onClick}>追加</Button>;
};
