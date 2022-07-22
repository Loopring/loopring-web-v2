import { useHistory } from "react-router-dom";
import { useOpenModals } from "@loopring-web/component-lib";
import { Trans, useTranslation } from "react-i18next";
import { Box, Button, TextField } from "@mui/material";
import React from "react";
import styled from "@emotion/styled/";
import { OverviewPanel } from "../../InvestPage/OverviewPanel";
import { PoolsPanel } from "../../InvestPage/PoolsPanel";
import { DeFiPanel } from "../../InvestPage/DeFiPanel";
import { ViewAccountTemplate } from "@loopring-web/core";
import MyLiquidityPanel from "../../InvestPage/MyLiquidityPanel";
import { InvestType } from "../../InvestPage";

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;
enum CreateCollectionStep {
  CreateUrl,
  AdvancePanel,
  CommonPanel,
}

const CreateUrlPanel = ({
  setStep,
}: {
  setStep: (props: CreateCollectionStep) => void;
}) => {
  const { t } = useTranslation();
  const [vaule, setValue] = React.useState();
  return (
    <>
      <TextField
        value={""}
        inputProps={{ maxLength: 10 }}
        fullWidth
        label={<Trans i18nKey={"labelCollectionName"}>Collection Name</Trans>}
        type={"text"}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button
        onClick={() => setStep(CreateCollectionStep.AdvancePanel)}
        variant={"outlined"}
        color={"primary"}
      >
        {t("labelCreateCollection")}
      </Button>
    </>
  );
};
const CommonPanel = () => {
  return <></>;
};
export const NFTCollectPanel = () => {
  const history = useHistory();
  const { setShowCollectionAdvance } = useOpenModals();
  const { t } = useTranslation(["common"]);
  const [step, setStep] = React.useState<CreateCollectionStep>(
    CreateCollectionStep.CreateUrl
  );
  return (
    <Box
      flex={1}
      alignItems={"center"}
      display={"flex"}
      justifyContent={"center"}
    >
      <Box flex={1} component={"section"} marginTop={1} display={"flex"}>
        {step === CreateCollectionStep.CreateUrl && (
          <CreateUrlPanel setStep={setStep} />
        )}
        {step === CreateCollectionStep.AdvancePanel && <PoolsPanel />}
        {step === CreateCollectionStep.CommonPanel && <PoolsPanel />}
      </Box>
    </Box>
  );
};
