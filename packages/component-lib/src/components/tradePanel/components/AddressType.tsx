import { Divider, MenuItem, Radio, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import styled from "@emotion/styled";
import React, { ForwardedRef } from "react";
import {
  EXCHANGE_TYPE,
  myLog,
  WALLET_TYPE,
} from "@loopring-web/common-resources";
export type AddressItemType<T> = {
  value: T;
  label: string;
  description: string;
  disabled?: boolean;
};
const MenuItemStyle = styled(MenuItem)`
  display: flex;
  flex-direction: column;
  height: auto;
  justify-content: center;
  align-items: flex-start;
  max-width: fit-content;
  .MuiTypography-root {
    white-space: break-spaces;
  }
  //.MuiMenuItem-root {
  //
  //  display: flex;
  //  flex-direction: ;
  //}
` as typeof MenuItem;

export const WalletItemOptions = React.memo(
  React.forwardRef(
    <T extends WALLET_TYPE | EXCHANGE_TYPE>(
      {
        description,
        label,
        myValue,
        selectedValue,
        disabled = false,
        handleSelected,
      }: {
        myValue: T;
        handleSelected: (value: WALLET_TYPE | EXCHANGE_TYPE) => void;
        selectedValue: T | null;
      } & AddressItemType<T>,
      ref: ForwardedRef<any>
    ) => {
      myLog("render", myValue, selectedValue);
      return (
        <MenuItemStyle
          ref={ref}
          disabled={disabled}
          value={myValue}
          // onClick={}
          onClick={() => {
            handleSelected(myValue);
          }}
        >
          <Typography
            width={"100%"}
            component={"span"}
            display={"inline-flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Typography color={"textPrimary"}>{label}</Typography>
            <Radio
              size={"medium"}
              checked={selectedValue === myValue}
              disabled={disabled}
            />
          </Typography>
          <Typography
            component={"span"}
            whiteSpace={"pre-line"}
            variant={"body2"}
            color={"textSecondary"}
          >
            {description}
          </Typography>
        </MenuItemStyle>
      );
    }
  )
);
export const TransferAddressType = <T extends WALLET_TYPE>({
  selectedValue,
  handleSelected,
}: {
  selectedValue: T | null;
  handleSelected: (value: T) => void;
}) => {
  const { t } = useTranslation("common");
  const walletList: AddressItemType<T>[] = [
    {
      label: t("labelWalletTypeOptions", {
        type: t(`labelWalletType${WALLET_TYPE.EOA}`),
      }),
      value: WALLET_TYPE.EOA as T,
      description: t(`label${WALLET_TYPE.EOA}Des`),
    },
    {
      label: t("labelWalletTypeOptions", {
        type: t(`labelWalletType${WALLET_TYPE.Loopring}`),
      }),
      value: WALLET_TYPE.Loopring as T,
      description: t(`label${WALLET_TYPE.Loopring}Des`),
    },
    {
      label: t("labelWalletTypeOptions", {
        type: t(`labelWalletType${WALLET_TYPE.OtherSmart}`),
      }),
      disabled: true,
      value: WALLET_TYPE.OtherSmart as T,
      description: t(`label${WALLET_TYPE.OtherSmart}Des`),
    },
    {
      label: t(WALLET_TYPE.Exchange),
      value: WALLET_TYPE.Exchange as T,
      disabled: true,
      description: t(`label${WALLET_TYPE.Exchange}Des`),
    },
  ];
  const desMenuItem = React.useMemo(() => {
    return (
      <MenuItemStyle disabled={true} value={-1}>
        <Typography component={"span"}>{t("labelWalletTypeDes")}</Typography>
      </MenuItemStyle>
    );
  }, [t]);
  // const ref = React.createRef();
  // debugger;
  const [open, setOpen] = React.useState(false);
  const onClose = () => {
    setOpen(false);
  };

  const onOpen = () => {
    setOpen(true);
  };
  return (
    <TextField
      select
      fullWidth
      variant="outlined"
      value={selectedValue}
      SelectProps={{
        open,
        onClose,
        onOpen,
        autoWidth: false,
        renderValue: (selectedValue) =>
          walletList.find((item) => item.value === selectedValue)?.label ?? "",
      }}
      label={t("labelL2toL2AddressType")}
      // inputProps={{}}
    >
      {desMenuItem}
      {walletList.map(({ value, label, description, disabled }) => (
        <WalletItemOptions
          key={value}
          value={value}
          myValue={value}
          handleSelected={(value) => {
            handleSelected(value as T);
            onClose();
          }}
          selectedValue={selectedValue}
          label={label}
          description={description}
          disabled={disabled}
        />
      ))}
    </TextField>
    // <FormControl fullWidth sx={{ minWidth: 300 }}>
    //   <InputLabel>{t("labelL2toL2AddressType")}</InputLabel>
    //   <OutlineSelect
    //     open={open}
    //     onClose={handleClose}
    //     onOpen={handleOpen}
    //     value={selectedValue}
    //     variant={"outlined"}
    //     onChange={(e) => {
    //       debugger;
    //       handleSelected(e.target.value as T);
    //     }}
    //     input={<OutlinedInput value={t(`labelExchange${selectedValue}`)} />}
    //   >
    //
    //   </OutlineSelect>
    // </FormControl>
  );
};

export const WithdrawAddressType = <T extends EXCHANGE_TYPE>({
  selectedValue,
  handleSelected,
}: {
  selectedValue: T | null;
  handleSelected: (value: T | any) => void;
}) => {
  const { t } = useTranslation("common");
  const nonExchangeList: [] = [
    {
      label: t(`labelNonExchangeType`),
      value: EXCHANGE_TYPE.NonExchange as T,
      disabled: false,
      description: t(`labelNonExchangeTypeDes`),
    },
  ];
  const exchangeList: AddressItemType<T>[] = [
    {
      label: t(`labelExchange${EXCHANGE_TYPE.Binance}`),
      value: EXCHANGE_TYPE.Binance as T,
      disabled: false,
      description: t(`labelExchange${EXCHANGE_TYPE.Binance}Des`),
    },
    {
      label: t(`labelExchange${EXCHANGE_TYPE.Huobi}`),
      value: EXCHANGE_TYPE.Huobi as T,
      disabled: false,
      description: t(`labelExchange${EXCHANGE_TYPE.Huobi}Des`),
    },
    {
      label: t(`labelExchange${EXCHANGE_TYPE.Others}`),
      value: EXCHANGE_TYPE.Others as T,
      disabled: false,
      description: t(`labelExchange${EXCHANGE_TYPE.Others}Des`),
    },
  ];
  const [open, setOpen] = React.useState(false);
  const onClose = () => {
    setOpen(false);
  };

  const onOpen = () => {
    setOpen(true);
  };
  const desMenuItem = React.useMemo(() => {
    return (
      <>
        <MenuItemStyle disabled={true} value={-1}>
          <Typography component={"span"}>
            {t("labelExchangeTypeDes")}
          </Typography>
        </MenuItemStyle>
        {
          <WalletItemOptions
            selectedValue={selectedValue}
            value={nonExchangeList[0].value}
            handleSelected={(value) => {
              handleSelected(value as T);
              onClose();
            }}
            label={nonExchangeList[0].label}
            myValue={nonExchangeList[0].value}
            disabled={nonExchangeList[0].disabled}
            description={nonExchangeList[0].description}
          />
        }
      </>
    );
  }, [handleSelected, nonExchangeList, selectedValue, t]);

  return (
    <TextField
      select
      fullWidth
      variant="outlined"
      value={selectedValue}
      SelectProps={{
        open,
        onClose,
        onOpen,
        autoWidth: false,
        renderValue: (selectedValue) =>
          [...nonExchangeList, ...exchangeList].find(
            (item) => item.value === selectedValue
          )?.label ?? "",
      }}
      label={t("labelL2toL2AddressType")}
      // inputProps={{}}
    >
      {desMenuItem}
      <Divider />
      {exchangeList.map(({ value, label, description, disabled }) => (
        <WalletItemOptions
          key={value}
          value={value}
          myValue={value}
          handleSelected={(value) => {
            handleSelected(value as T);
            onClose();
          }}
          selectedValue={selectedValue}
          label={label}
          description={description}
          disabled={disabled}
        />
      ))}
    </TextField>
  );
};
