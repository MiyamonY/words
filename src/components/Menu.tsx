import { MenuItem, useAuthenticator } from "@aws-amplify/ui-react";
import { Menu } from "@aws-amplify/ui-react";

export const MainMenu = () => {
  const { signOut } = useAuthenticator();

  return (
    <Menu menuAlign="center">
      <MenuItem onClick={signOut}>SignOut</MenuItem>
    </Menu>
  );
};
