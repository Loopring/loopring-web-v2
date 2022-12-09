import { Box } from "@mui/material";
import { useTheme } from "@emotion/react";

export const RedPacketPanel = () => {
  const theme = useTheme();
  return (
    <Box flex={1}>
      <Box
        position={"absolute"}
        display={"flex"}
        alignItems={"center"}
        sx={{
          right: 2 * theme.unit,
          top: -42,
          zIndex: 99,
        }}
      ></Box>
    </Box>
  );
};
