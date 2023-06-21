import { AccountBasePanel } from "./AccountBase";
import { AccountBaseProps } from "./Interface";
import { Box, Typography } from "@mui/material";
import { AnimationArrow, Button, useSettings } from "../../../index";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  AccountHashInfo,
  L1L2_NAME_DEFINED,
  MapChainId,
} from "@loopring-web/common-resources";
import { DepositRecorder } from "./DepositRecorder";
import { useTheme } from "@emotion/react";

export const NoAccount = withTranslation("common")(
  ({
    goActiveAccount,
    className,
    noButton = false,
    t,
    onClose,
    ...props
  }: WithTranslation &
    AccountBaseProps & {
      noButton?: boolean;
      className?: string;
      goActiveAccount: () => void;
      onClose: (e?: any) => void;
      chainInfos: AccountHashInfo;
      clearDepositHash: () => void;
    }) => {
      const theme = useTheme();
      const { defaultNetwork } = useSettings();
      const network = MapChainId[defaultNetwork] ?? MapChainId[1];
      return (
        <Box
          flex={1}
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"space-between"}
          alignItems={"center"}
          className={className}
          // style={{ transform: "translateY(-40px)" }}
        >
          <Box
            display={"flex"}
            flex={1}
            marginBottom={5}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <AccountBasePanel {...props} t={t} />
          </Box>
          {noButton ? (
            <Box
              display={"flex"}
              marginX={0}
              marginTop={3}
              marginBottom={0}
              alignSelf={"stretch"}
              paddingX={5}
              padding={0}
              sx={{
                overflow: "hidden",
                borderBottomLeftRadius: theme.unit,
                borderBottomRightRadius: theme.unit,
              }}
            >
              <DepositRecorder
                {...props}
                clear={props.clearDepositHash}
                t={t}
              />
            </Box>
          ) : (
            <>
              <Box
                display={"flex"}
                marginTop={2}
                alignSelf={"stretch"}
                paddingX={5}
                flexDirection={"column"}
                alignItems={"center"}
              >
                <Typography variant={"body2"}>
                  {t("labelActivatedAccountDeposit", {
                    layer2: L1L2_NAME_DEFINED[network].layer2,
                  })}
                </Typography>
                <AnimationArrow className={"arrowCta"} />
                <Button
                  variant={"contained"}
                  fullWidth
                  size={"medium"}
                  onClick={() => {
                    goActiveAccount();
                  }}
                >
                  {t("labelActiveL2Btn", {
                    loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  })}
                </Button>
              </Box>
              <Box
                display={"flex"}
                marginX={0}
                marginTop={3}
                alignSelf={"stretch"}
                paddingX={5}
                padding={0}
              >
                <DepositRecorder
                  {...props}
                  clear={props.clearDepositHash}
                  t={t}
                />
              </Box>
            </>
          )}
        </Box>
      );
    }
);
