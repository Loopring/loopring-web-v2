import { Box, Typography } from "@mui/material";

import { useSettings } from "../../../stores";
import { Button } from "../../basic-lib";

export const ThirdPanelReturn = ({
  title,
  description,
  btnInfo,
}: {
  title: string | JSX.Element;
  description: string | JSX.Element;
  btnInfo: {
    btnTxt: string;
    callback: () => void;
  };
} & any) => {
  const { isMobile } = useSettings();

  return (
    <>
      <Box
        flex={1}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDirection={"column"}
      >
        <Typography
          component={"h3"}
          variant={isMobile ? "h4" : "h3"}
          whiteSpace={"pre"}
          marginBottom={3}
          marginTop={-1}
        >
          {title}
        </Typography>
        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          flex={1}
          alignItems={"stretch"}
          alignSelf={"stretch"}
          className="modalContent"
          paddingX={isMobile ? 7 : 5}
          paddingBottom={4}
        >
          <Typography
            component={"p"}
            variant={"body1"}
            color={"textSecondary"}
            marginBottom={1}
          >
            {description}
          </Typography>
        </Box>
        <Box alignSelf={"stretch"} paddingX={5} marginY={5 / 2}>
          <Button
            variant={"contained"}
            fullWidth
            size={"medium"}
            onClick={(e?: any) => {
              if (btnInfo?.callback) {
                btnInfo.callback(e);
              }
            }}
          >
            {btnInfo?.btnTxt}
          </Button>
        </Box>
      </Box>
    </>
  );
};
