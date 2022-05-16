import { Box, Typography } from "@mui/material";
import { MenuBtnStyled } from "../../styled";
import { VendorMenuProps } from "../../modal/ModalPanels/Interface";
import { useTranslation } from "react-i18next";
import { BanxaIcon, RampIcon } from "@loopring-web/common-resources";
import { useTheme } from "@emotion/react";
import { useSettings } from "../../../stores";

const IconItem = ({ svgIcon }: { svgIcon: string }) => {
  const theme = useTheme();
  switch (svgIcon) {
    case "BanxaIcon":
      return (
        <BanxaIcon
          style={{
            height: "24px",
            width: "103px",
          }}
          fontColor={theme.colorBase.textPrimary}
        />
      );
    case "RampIcon":
      return (
        <RampIcon
          style={{
            height: "24px",
            width: "114px",
          }}
          fontColor={theme.colorBase.textPrimary}
        />
      );
  }
};

export const VendorMenu = ({
  vendorList,
  // handleSelect,
  vendorForce,
}: VendorMenuProps) => {
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  return (
    <Box
      flex={1}
      display={"flex"}
      alignItems={"stretch"}
      justifyContent={isMobile ? "flex-start" : "center"}
      flexDirection={"column"}
      paddingTop={2}
      paddingX={4}
      paddingBottom={3}
      height={"100%"}
      alignSelf={"flex-start"}
    >
      <Typography variant={"h6"} component={"h4"} width={"100%"}>
        {t("labelL1toL2ThirdPart")}
      </Typography>
      {vendorList.map((item) => (
        <Box key={item.key} marginTop={1.5} width={"100%"}>
          <MenuBtnStyled
            variant={"outlined"}
            size={"large"}
            className={vendorForce === item.key ? "selected vendor" : "vendor"}
            fullWidth
            style={{
              height:
                item.flag &&
                item.flag.startDate < Date.now() &&
                Date.now() < item.flag.endDate
                  ? 56
                  : "",
            }}
            startIcon={IconItem({ svgIcon: item.svgIcon })}
            onClick={(e) => {
              if (item.handleSelect) {
                item.handleSelect(e);
              }
            }}
          >
            <Typography component={"span"} className={"vendorName"} height={0}>
              {t(item.key)}
            </Typography>
            {item.flag &&
              item.flag.startDate < Date.now() &&
              Date.now() < item.flag.endDate && (
                <>
                  <Typography
                    component={"span"}
                    variant={"body2"}
                    color={"var(--color-warning)"}
                  >
                    {t(item.flag.highLight ?? "")}
                  </Typography>
                  <Typography position={"absolute"} right={8} top={4}>
                    {item.flag.tag}
                  </Typography>
                </>
              )}
          </MenuBtnStyled>
        </Box>
      ))}
    </Box>
  );
  {
    /*</WalletConnectPanelStyled>*/
  }
};
