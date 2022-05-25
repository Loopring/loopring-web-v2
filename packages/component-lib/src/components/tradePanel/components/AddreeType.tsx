import { MenuItem, Radio, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import styled from "@emotion/styled";
import React from "react";
const MenuItemStyle = styled(MenuItem)`` as typeof MenuItem;

export enum WALLET_TYPE {
  EOA = "EOA",
  Loopring = "Loopring",
  OtherSmart = "OtherSmart",
  Exchange = "Exchange",
}

export enum EXCHANGE_TYPE {
  Binance = "Binance",
  Huobi = "Huobi",
  Coinbase = "Coinbase",
  Others = "Others",
}

export const WalletItemOptions = ({
  description,
  label,
  value,
  selected,
  disabled = false,
}: {
  value: WALLET_TYPE;
  label: string;
  selected?: string;
  description: string;
  disabled?: boolean;
}) => {
  return (
    <MenuItemStyle disabled>
      <Typography
        component={"span"}
        display={"inline-flex"}
        justifyContent={"space-between"}
      >
        <Typography>{label}</Typography>
        <Radio
          size={"medium"}
          checked={selected === value}
          disabled={disabled}
        />
      </Typography>
      <Typography
        component={"span"}
        whiteSpace={"pre-line"}
        variant={"body2"}
        color={"var(--color-text-third)"}
        marginTop={1}
        marginBottom={2}
      >
        {description}
      </Typography>
    </MenuItemStyle>
  );
};

export const TransferAddressType = ({
  selected,
  handleSelected,
}: {
  selected: string;
  handleSelected: (value: WALLET_TYPE) => void;
}) => {
  const { t } = useTranslation("common");
  const desMenuItem = React.useMemo(() => {
    return (
      <MenuItemStyle disabled={true} value={-1}>
        <Typography component={"span"} marginY={2}>
          {t("labelTransferAddressTypeDes")}
        </Typography>
      </MenuItemStyle>
    );
  }, []);
  return (
    <TextField
      select
      label={t("labelL2toL2OriginDesc")}
      onChange={(_e) => {
        handleSelected(e.target.value);
      }}
    >
      {desMenuItem}
      <>
        {[
          {
            label: t("labelWalletTypeOptions", {
              type: `labelWalletType${WALLET_TYPE.EOA}`,
            }),
            value: WALLET_TYPE.EOA,
            description: t(`label${WALLET_TYPE.EOA}Des`),
          },
          {
            label: t("labelWalletTypeOptions", {
              type: `labelWalletType${WALLET_TYPE.Loopring}`,
            }),
            value: WALLET_TYPE.Loopring,
            description: t(`label${WALLET_TYPE.Loopring}Des`),
          },
          {
            label: t("labelWalletTypeOptions", {
              type: `labelWalletType${WALLET_TYPE.OtherSmart}`,
            }),
            disabled: true,
            value: WALLET_TYPE.OtherSmart,
            description: t(`label${WALLET_TYPE.OtherSmart}Des`),
          },
          {
            label: t(WALLET_TYPE.Exchange),
            value: WALLET_TYPE.Exchange,
            disabled: true,
            description: t(`label${WALLET_TYPE.Exchange}Des`),
          },
        ].map((option) => (
          <WalletItemOptions selected={selected} {...option} />
        ))}
      </>
    </TextField>
  );
};

const common = {
  labelTransferAddressTypeDes:
    "Please confirm the address origin again to ensure the assets are not mistakenly sent to the exchange address. ",
  labelWalletTypeOptions: "{{type}} Wallet",
  labelWalletTypeOtherSmart: "Other Smart",
  labelWalletTypeLoopring: "Loopring",
  labelWalletTypeEOA: "EOA",
  labelWalletTypeExchange: "Exchange",
  labelEOADes:
    "There is no smart contract binds with this wallet address. (e.g. MetaMask, imtoken, Ledger, Trezor, etc....) ",
  labelLoopringDes:
    "This wallet is created using Loopring Wallet mobile app and binds with Loopring smart contract.",
  labelOtherSmartDes:
    "This wallet binds with smart contract that does not support Loopring Layer 2. You will need to send funds to the L1 account. ",
  labelExchangeDes:
    "The following trading platforms currently do not support Loopring L2 transfers (Binance, Coinbase, FTX, etc...). You will need to send funds to the L1 account. ",
};
