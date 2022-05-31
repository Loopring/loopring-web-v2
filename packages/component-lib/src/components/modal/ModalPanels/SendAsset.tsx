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
import { useSettings } from "../../../stores";

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
  isToL1,
}: SendAssetProps) => {
  const { t } = useTranslation("common");
  const { isMobile } = useSettings();
  // const [isToL1, setIsToL1] = React.useState<boolean>(true);
  // React.useEffect(() => {
  //   // debugger;
  //   if (symbol && /^LP-/gi.test(symbol)) {
  //     setIsToL1(true);
  //   }
  //   setIsToL1(false);
  // }, [symbol]);

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
        variant={isMobile ? "h4" : "h3"}
        whiteSpace={"pre"}
        marginBottom={3}
        marginTop={-1}
      >
        {t("labelSendAssetTitle", { symbol })}
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
        {sendAssetList.map((item) => {
          return (
            <Box key={item.key} marginTop={1.5}>
              <MenuBtnStyled
                variant={"outlined"}
                size={"large"}
                className={"sendAsset"}
                fullWidth
                isMobile={isMobile}
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
                >
                  <>{IconItem({ svgIcon: item.svgIcon })}</>
                  {t("label" + item.key)}
                </Typography>
              </MenuBtnStyled>
            </Box>
          );
        })}
      </Box>
    </BoxStyled>
  );
  {
    /*</WalletConnectPanelStyled>*/
  }
};
