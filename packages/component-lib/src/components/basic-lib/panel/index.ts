import styled from '@emotion/styled';
import { Card } from '@mui/material';

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

  img {
    object-fit: contain;
  }
` as typeof Card;