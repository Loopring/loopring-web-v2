import { Box, Typography } from "@mui/material";
import { MenuBtnStyled } from "../../styled";
import { VendorMenuProps } from "../../modal/ModalPanels/Interface";
import { useTranslation } from "react-i18next";
import { BanxaIcon, RampIcon } from "@loopring-web/common-resources";
import { useTheme } from "@emotion/react";

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
  return (
    <Box
      flex={1}
      display={"flex"}
      alignItems={"stretch"}
      justifyContent={"space-around"}
      flexDirection={"column"}
      marginTop={2}
      paddingX={2}
      height={"100%"}
    >
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        flexDirection={"column"}
      >
        <Typography variant={"h6"} component={"h4"} width={"100%"}>
          {t("labelDepositThirdPart")}
        </Typography>
        {vendorList.map((item) => (
          <Box key={item.key} marginTop={1.5} width={"100%"}>
            <MenuBtnStyled
              variant={"outlined"}
              size={"large"}
              className={
                vendorForce === item.key ? "selected vendor" : "vendor"
              }
              fullWidth
              endIcon={IconItem({ svgIcon: item.svgIcon })}
              onClick={(e) => {
                if (item.handleSelect) {
                  item.handleSelect(e);
                }
              }}
            >
              {t(item.key)}
            </MenuBtnStyled>
          </Box>
        ))}
      </Box>
    </Box>
  );
  {
    /*</WalletConnectPanelStyled>*/
  }
};
