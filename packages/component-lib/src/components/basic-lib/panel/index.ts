import styled from "@emotion/styled";
import { Box, Card } from "@mui/material";

export * from "./SwitchPanel";
export * from "./SubMenu";
export * from "./Interface";
export * from "./IPFSSourceUpload";

export const CardNFTStyled = styled(Card)`
  display: flex;
  padding: 0;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  width: var(--nft-card);
`;

export const CardStyleItem = styled(Card)`
  background: var(--color-global-bg);
  width: 100%;
  cursor: pointer;
  height: 0;
  padding: 0 0 calc(100% + 80px);
  position: relative;

  &.collection {
    padding: 0 0 calc(140%);
  }

  img {
    object-fit: contain;
  }
` as typeof Card;

export const ImageUploadWrapper = styled(Box)`
  position: relative;
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;

  .MuiFormControlLabel-root {
    align-items: flex-start;

    .MuiFormControlLabel-label {
      color: var(--color-text-secondary);
    }
  }
` as typeof Box;
