import { Box, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { MenuBtnStyled } from "../../styled";
import { SendAssetProps } from "./Interface";
import { useTranslation } from "react-i18next";
import {
  BackIcon,
  ExchangeAIcon,
  IncomingIcon,
  L1L2_NAME_DEFINED,
  L1l2Icon,
  L2l2Icon,
  MapChainId,
  OutputIcon,
} from "@loopring-web/common-resources";
import { useSettings, useToggle } from "../../../stores";

const BoxStyled = styled(Box)`` as typeof Box;

const IconItem = ({ svgIcon }: { svgIcon: string }) => {
  switch (svgIcon) {
    case "IncomingIcon":
      return <IncomingIcon color={"inherit"} sx={{ marginRight: 1 }} />;
    case "L2l2Icon":
      return <L2l2Icon color={"inherit"} sx={{ marginRight: 1 }} />;
    case "L1l2Icon":
      return <L1l2Icon color={"inherit"} sx={{ marginRight: 1 }} />;
    case "ExchangeAIcon":
      return <ExchangeAIcon color={"inherit"} sx={{ marginRight: 1 }} />;
    case "OutputIcon":
      return <OutputIcon color={"inherit"} sx={{ marginRight: 1 }} />;
  }
};
export const SendAsset = ({
  sendAssetList,
  allowTrade,
  symbol,
  isToL1,
}: SendAssetProps) => {
  const { t } = useTranslation("common");
  const { defaultNetwork, isMobile } = useSettings();
  const network = MapChainId[defaultNetwork] ?? MapChainId[1];
  const {
    toggle: { send },
  } = useToggle();

  return (
    <BoxStyled
      flex={1}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"space-between"}
      flexDirection={"column"}
      width={"var(--modal-width)"}
    >
      <Typography
        component={"h3"}
        variant={isMobile ? "h4" : "h3"}
        whiteSpace={"pre"}
        marginBottom={3}
        marginTop={-1}
      >
        {t("labelSendAssetTitle", {
          symbol,
          loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        })}
      </Typography>
      <Box
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        flex={1}
        alignItems={"stretch"}
        alignSelf={"stretch"}
        className="modalContent"
        paddingX={isMobile ? 7 : 10}
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
        <Box flex={1} flexDirection={"column"}>
          {sendAssetList.reduce((prev, item) => {
            if (
              !symbol ||
              (item.key == "SendAssetToAnotherNet" &&
                send["orbiter"]?.includes(symbol)) ||
              !["SendAssetToAnotherNet"].includes(item.key)
            ) {
              prev.push(
                <Box key={item.key} marginTop={1.5}>
                  <MenuBtnStyled
                    variant={"outlined"}
                    size={"large"}
                    className={`sendAsset  ${isMobile ? "isMobile" : ""}`}
                    fullWidth
                    disabled={
                      !!(
                        item.enableKey &&
                        allowTrade[item.enableKey]?.enable === false
                      ) ||
                      (/SendTo?(\w)+L1/gi.test(item.key) && isToL1)
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
                      lineHeight={"1.2em"}
                      sx={{
                        textIndent: 0,
                        textAlign: "left",
                      }}
                    >
                      <>{IconItem({ svgIcon: item.svgIcon })}</>
                      {t("label" + item.key, {
                        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                      })}
                    </Typography>
                  </MenuBtnStyled>
                </Box>
              );
            }
            return prev;
          }, [] as JSX.Element[])}
        </Box>
      </Box>
    </BoxStyled>
  );
  {
    /*</WalletConnectPanelStyled>*/
  }
};
