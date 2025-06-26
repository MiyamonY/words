import { Button } from "@aws-amplify/ui-react";

interface Props {
  onClick: () => void;
  loading: boolean;
}

export const AddButton = (props: Props) => {
  const { onClick, loading } = props;

  return (
    <Button onClick={onClick} isLoading={loading}>
      追加
    </Button>
  );
};
