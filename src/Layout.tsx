import { Flex, Grid } from "@aws-amplify/ui-react";
import { useAtom } from "jotai";
import { GiJapan as JapanIcon } from "react-icons/gi";
import { Outlet } from "react-router";
import { MainMenu } from "./components/Menu";
import { jaAtom } from "./storage";

const Layout = () => {
  const [ja, setJa] = useAtom(jaAtom);

  const toggleJa = () => {
    setJa((prev) => !prev);
  };

  return (
    <Grid
      width="800px"
      columnGap="0.5rem"
      rowGap="0.5rem"
      templateRows="1fr 10fr 1fr"
      margin="auto"
    >
      <Flex justifyContent="flex-end">
        <MainMenu />
      </Flex>
      <Flex alignItems="center" justifyContent="center">
        <Outlet />
      </Flex>
      <Flex justifyContent="center">
        <JapanIcon color={ja ? "red" : "gray"} onClick={toggleJa} />
      </Flex>
    </Grid>
  );
};

export default Layout;
