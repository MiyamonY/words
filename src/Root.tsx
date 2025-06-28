import { Flex, Grid } from "@aws-amplify/ui-react";
import { Outlet } from "react-router";
import { MainMenu } from "./components/Menu";

const Root = () => {
  return (
    <Grid
      width="800px"
      columnGap="0.5rem"
      rowGap="0.5rem"
      templateRows="1fr 10fr"
      margin="auto"
    >
      <Flex justifyContent="flex-end">
        <MainMenu />
      </Flex>
      <Flex alignItems="center" justifyContent="center">
        <Outlet />
      </Flex>
    </Grid>
  );
};

export default Root;
