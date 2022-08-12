import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import React from "react";
import {
  Button,
  CreateCollectionWrap
} from "@loopring-web/component-lib";
import { useHistory } from 'react-router-dom';
import { useCollectionPanel } from './hook';
import { BackIcon } from '@loopring-web/common-resources';

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`;

export const CreateCollectionPanel = () => {
  const {t} = useTranslation("common");
  // const [banner,setBanner] = React.useState('');
  // const [banner,setBanner] = React.useState('')
  const createCollectionViewProps = useCollectionPanel({isEdit: false});


  const history = useHistory();

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        marginBottom={2}
      >
        <Button
          startIcon={<BackIcon fontSize={"small"}/>}
          variant={"text"}
          size={"medium"}
          sx={{color: "var(--color-text-secondary)"}}
          color={"inherit"}
          onClick={history.goBack}
        >
          {t("labelCollectionCreateERC1155")}
          {/*<Typography color={"textPrimary"}></Typography>*/}
        </Button>
      </Box>
      <StyledPaper flex={1} display={'flex'}>
        <CreateCollectionWrap {...{...createCollectionViewProps}}/>
      </StyledPaper>

    </>
  );
};
