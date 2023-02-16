import { Box, Typography } from "@mui/material";

import { useSettings } from "../../../stores";
import { Button } from "../../basic-lib";
import { BackIcon, SoursURL } from "@loopring-web/common-resources";
import { MenuBtnStyled } from "../../styled";

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
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            paddingY={3}
          >
            <img
              className="loading-gif"
              width="36"
              src={`${SoursURL}images/loading-line.gif`}
            />
          </Box>
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

export const ContinuousBanxaOrder = ({
  title,
  // description,
  btnInfo,
  btnInfo2,
}: {
  title: string | JSX.Element;
  // description: string | JSX.Element;
  btnInfo?: {
    btnTxt: string;
    callback: () => void;
    isLoading?: boolean;
  };
  btnInfo2?: {
    btnTxt: string;
    callback: () => void;
    isLoading?: boolean;
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
          variant={"h5"}
          whiteSpace={"pre"}
          marginBottom={3}
          marginTop={-1}
        >
          {title}
        </Typography>
        <Box display={"flex"} flexDirection={"column"} paddingBottom={3}>
          <Box marginTop={1.5}>
            <MenuBtnStyled
              variant={"outlined"}
              size={"large"}
              className={`banxaEnter  ${isMobile ? "isMobile" : ""}`}
              fullWidth
              loading={btnInfo?.isLoading ? "true" : "false"}
              disabled={btnInfo?.isLoading}
              endIcon={<BackIcon sx={{ transform: "rotate(180deg)" }} />}
              onClick={(_e) => {
                btnInfo.callback();
              }}
            >
              <Typography
                component={"span"}
                variant={"inherit"}
                color={"inherit"}
                display={"inline-flex"}
                alignItems={"center"}
                lineHeight={"1.2em"}
                sx={{
                  textIndent: 0,
                  textAlign: "left",
                }}
              >
                {btnInfo.btnTxt}
              </Typography>
            </MenuBtnStyled>
          </Box>
          <Box marginTop={1.5}>
            <MenuBtnStyled
              variant={"outlined"}
              size={"large"}
              className={`banxaEnter  ${isMobile ? "isMobile" : ""}`}
              fullWidth
              loading={btnInfo?.isLoading ? "true" : "false"}
              disabled={btnInfo2?.isLoading}
              endIcon={<BackIcon sx={{ transform: "rotate(180deg)" }} />}
              onClick={(_e) => {
                btnInfo2.callback();
              }}
            >
              <Typography
                component={"span"}
                variant={"inherit"}
                color={"inherit"}
                display={"inline-flex"}
                alignItems={"center"}
                lineHeight={"1.2em"}
                sx={{
                  textIndent: 0,
                  textAlign: "left",
                }}
              >
                {btnInfo2.btnTxt}
              </Typography>
            </MenuBtnStyled>
          </Box>
        </Box>
      </Box>
    </>
  );
};
