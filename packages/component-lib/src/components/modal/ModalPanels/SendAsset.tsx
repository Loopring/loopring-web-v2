import { Box, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { MenuBtnStyled } from "../../styled";
import { SendAssetProps } from "./Interface";
import { useTranslation } from "react-i18next";
import {
  BackIcon,
  CardIcon,
  IncomingIcon,
} from "@loopring-web/common-resources";

const BoxStyled = styled(Box)`` as typeof Box;

const IconItem = ({ svgIcon }: { svgIcon: string }) => {
  switch (svgIcon) {
    case "IncomingIcon":
      return <IncomingIcon color={"inherit"} />;
    case "CardIcon":
      return <CardIcon color={"inherit"} />;
  }
};
export const SendAsset = ({
  sendAssetList,
  allowTrade,
  symbol,
}: SendAssetProps) => {
  const { t } = useTranslation("common");
  return (
    <BoxStyled
      flex={1}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"space-between"}
      flexDirection={"column"}
    >
      <Typography
        component={"h3"}
        variant={"h3"}
        marginBottom={3}
        marginTop={-1}
      >
        {t("labelSendAssetTitle")}
      </Typography>
      <Box
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        flex={1}
        alignItems={"stretch"}
        alignSelf={"stretch"}
        className="modalContent"
        paddingX={10}
        paddingBottom={4}
      >
        <Typography
          component={"p"}
          variant={"body1"}
          color={"textSecondary"}
          marginBottom={1}
        >
          {t("labelSendAssetHowto")}
        </Typography>
        <>
          {sendAssetList.map((item) => (
            <Box key={item.key} marginTop={1.5}>
              <MenuBtnStyled
                variant={"outlined"}
                size={"large"}
                className={"sendAsset"}
                fullWidth
                disabled={
                  !!(
                    item.enableKey &&
                    allowTrade[item.enableKey]?.enable === false
                  )
                }
                endIcon={<BackIcon sx={{ transform: "rotate(180deg)" }} />}
                onClick={(e) => {
                  item.handleSelect(e);
                }}
              >
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"inherit"}
                  display={"inline-flex"}
                  alignItems={"center"}
                >
                  <>{IconItem({ svgIcon: item.svgIcon })}</>
                  {t("label" + item.key)}
                </Typography>
              </MenuBtnStyled>
            </Box>
          ))}
        </>
      </Box>
    </BoxStyled>
  );
  {
    /*</WalletConnectPanelStyled>*/
  }
};
