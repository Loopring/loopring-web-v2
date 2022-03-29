export type ToggleState = {
  order: { enable: boolean; reason?: string };
  joinAmm: { enable: boolean; reason?: string };
  exitAmm: { enable: boolean; reason?: string };
  transfer: { enable: boolean; reason?: string };
  transferNFT: { enable: boolean; reason?: string };
  deposit: { enable: boolean; reason?: string };
  depositNFT: { enable: boolean; reason?: string };
  withdraw: { enable: boolean; reason?: string };
  withdrawNFT: { enable: boolean; reason?: string };
  mintNFT: { enable: boolean; reason?: string };
  deployNFT: { enable: boolean; reason?: string };
  updateAccount: { enable: boolean; reason?: string };
};
