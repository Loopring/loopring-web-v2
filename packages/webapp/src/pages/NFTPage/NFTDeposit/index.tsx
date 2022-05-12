import styled from "@emotion/styled";
import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { DepositNFTWrap, PopoverPure } from "@loopring-web/component-lib";

import { useNFTDeposit } from "@loopring-web/core";
import { HelpIcon } from "@loopring-web/common-resources";
import { bindHover } from "material-ui-popup-state/es";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import { Trans, useTranslation } from "react-i18next";

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

export const DepositNFTPanel = () => {
  const { nftDepositProps } = useNFTDeposit();
  const { t } = useTranslation(["common"]);

  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-nftDeposit`,
  });
  return (
    <>
      <StyledPaper
        flex={1}
        className={"MuiPaper-elevation2"}
        marginTop={0}
        marginBottom={2}
        display={"flex"}
        flexDirection={"column"}
      >
        <Typography
          component={"h3"}
          variant={"h4"}
          paddingX={5 / 2}
          paddingTop={5 / 2}
          display={"inline-flex"}
          alignItems={"center"}
        >
          <Typography variant={"inherit"} component={"span"}>
            {nftDepositProps.title
              ? nftDepositProps.title
              : t("nftDepositTitle")}
          </Typography>
          <HelpIcon
            {...bindHover(popupState)}
            fontSize={"large"}
            htmlColor={"var(--color-text-third)"}
          />

          <PopoverPure
            className={"arrow-center"}
            {...bindPopper(popupState)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <Typography
              padding={2}
              component={"p"}
              variant={"body2"}
              whiteSpace={"pre-line"}
            >
              <Trans
                i18nKey={
                  nftDepositProps.description
                    ? nftDepositProps.description
                    : "nftDepositDescription"
                }
              >
                Creates a smart contract on Ethereum L1, which requires a gas
                fee. NFTs minted here are on L2 only until deployed.
              </Trans>
            </Typography>
          </PopoverPure>
        </Typography>

        <DepositNFTWrap {...nftDepositProps} />
      </StyledPaper>
    </>
  );
};
