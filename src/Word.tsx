import { Navigate, useParams } from "react-router";
import { Word } from "@/components/Word";

const Page = () => {
  const { id } = useParams();

  if (!id) {
    return <Navigate to="/404" />;
  }

  return <Word id={id} />;
};

export default Page;
