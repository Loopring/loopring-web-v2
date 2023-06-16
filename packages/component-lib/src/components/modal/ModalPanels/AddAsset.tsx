import { Box, Typography } from "@mui/material";
import { MenuBtnStyled } from "../../styled";
import { AddAssetProps } from "./Interface";
import { useTranslation } from "react-i18next";
import {
  AddAssetList,
  AnotherIcon,
  BackIcon,
  CardIcon,
  ExchangeAIcon,
  IncomingIcon,
  L1l2Icon,
  L2l2Icon,
  OutputIcon,
} from "@loopring-web/common-resources";
import { useSettings, useToggle } from "../../../stores";

const IconItem = ({ svgIcon }: { svgIcon: string }) => {
  switch (svgIcon) {
    case "IncomingIcon":
      return <IncomingIcon color={"inherit"} sx={{ marginRight: 1 }} />;
    case "CardIcon":
      return <CardIcon color={"inherit"} sx={{ marginRight: 1 }} />;
    case "L2l2Icon":
      return <L2l2Icon color={"inherit"} sx={{ marginRight: 1 }} />;
    case "L1l2Icon":
      return <L1l2Icon color={"inherit"} sx={{ marginRight: 1 }} />;
    case "ExchangeAIcon":
      return <ExchangeAIcon color={"inherit"} sx={{ marginRight: 1 }} />;
    case "OutputIcon":
      return <OutputIcon color={"inherit"} sx={{ marginRight: 1 }} />;
    case "AnotherIcon":
      return <AnotherIcon color={"inherit"} sx={{ marginRight: 1 }} />;
  }
};
export const AddAsset = ({
  symbol,
  addAssetList,
  allowTrade,
  isNewAccount = false,
}: AddAssetProps) => {
  const { t } = useTranslation("common");
  const { isMobile } = useSettings();
  const {
    toggle: { receive },
  } = useToggle();

  const isLp: boolean = symbol?.startsWith("LP-") ?? false;
  const lpDisaList = [
    AddAssetList.BuyWithCard.key,
    AddAssetList.FromExchange.key,
  ];
  return (
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
        {isNewAccount
          ? t("labelAddAssetTitleActive")
          : t("labelAddAssetTitle", { symbol })}
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
          {t("labelAddAssetHowto")}
        </Typography>
        <>
          {addAssetList.reduce((prev, item) => {
            if (
              !symbol ||
              (item.key == "FromAnotherNet" &&
                receive["orbiter"]?.includes(symbol)) ||
              (item.key == "FromExchange" &&
                receive["layerSwap"]?.includes(symbol)) ||
              !["FromAnotherNet", "FromExchange"].includes(item.key)
            ) {
              prev.push(
                <Box key={item.key} marginTop={1.5}>
                  <MenuBtnStyled
                    variant={"outlined"}
                    size={"large"}
                    className={`addAsset ${isMobile ? "isMobile" : ""}`}
                    fullWidth
                    disabled={
                      !!(
                        item.enableKey &&
                        allowTrade[item.enableKey]?.enable === false
                      ) ||
                      (isLp && lpDisaList.includes(item.key))
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
                      {t("label" + item.key)}
                    </Typography>
                  </MenuBtnStyled>
                </Box>
              );
            }
            return prev;
          }, [] as JSX.Element[])}
        </>
      </Box>
    </Box>
  );
};
