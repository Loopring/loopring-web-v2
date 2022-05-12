import {
  AnimationArrow,
  AssetTitleMobileProps,
  Button,
  DropdownIconStyled,
  useSettings,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { useRouteMatch } from "react-router-dom";
import {
  getValuePrecisionThousand,
  HeaderMenuItemInterface,
  HideIcon,
  subMenuLayer2,
  ViewIcon,
} from "@loopring-web/common-resources";
import { Box, Grid, IconButton, Typography } from "@mui/material";

export const TitleNFTMobile = () => {
  const { hideL2Action, setHideL2Action } = useSettings();
  const { t } = useTranslation(["common", "layout"]);
  let match: any = useRouteMatch("/layer2/:item");
  const label = Reflect.ownKeys(subMenuLayer2)
    .reduce(
      (pre, item) => [...pre, ...subMenuLayer2[item]],
      [] as HeaderMenuItemInterface[]
    )
    .find((item) => RegExp(item?.router?.path ?? "").test(match?.url ?? ""))
    ?.label?.i18nKey;
  return (
    <Box display={"flex"} flexDirection={"column"} marginBottom={2}>
      <Box
        component={"span"}
        display={"flex"}
        alignItems={"center"}
        style={{ cursor: "pointer" }}
        justifyContent={"center"}
        onClick={() => setHideL2Action(!hideL2Action)}
        marginBottom={1}
      >
        {!hideL2Action ? (
          <DropdownIconStyled
            status={hideL2Action ? "down" : "up"}
            fontSize={"medium"}
          />
        ) : (
          <AnimationArrow className={"arrowCta"} />
        )}
      </Box>
      {!hideL2Action && (
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant={"outlined"}
              size={"medium"}
              color={"primary"}
              href={"/#/nft/mintNFT"}
            >
              {t("labelNFTMint")}
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant={"outlined"}
              size={"medium"}
              color={"primary"}
              href={"/#/nft/depositNFT"}
            >
              {t("labelNFTDeposit")}
            </Button>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
