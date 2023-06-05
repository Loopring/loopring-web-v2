import { WalletConnectBtnProps } from "./Interface";
import { useTranslation } from "react-i18next";
import React from "react";
import {
  AccountStatus,
  ChainIdExtends,
  CircleIcon,
  DropDownIcon,
  gatewayList,
  getShortAddr,
  LoadingIcon,
  LockIcon,
  myLog,
  SagaStatus,
  UnConnectIcon,
} from "@loopring-web/common-resources";
import { Typography, Box } from "@mui/material";
import { Button, ButtonProps } from "../../basic-lib";
import { bindHover, usePopupState } from "material-ui-popup-state/hooks";
import styled from "@emotion/styled";
import { useSettings } from "../../../stores";
import * as sdk from "@loopring-web/loopring-sdk";

// type ChainId = sdk.ChainId | ChainIdExtends;
const WalletConnectBtnStyled = styled(Button)`
  text-transform: none;
  min-width: 120px;

  &.wallet-btn {
    //width:;
    justify-content: center;
    width: var(--walletconnect-width);
  }

  i {
    padding-right: ${({ theme }) => theme.unit / 2}px;
    display: flex;
    justify-content: center;
    align-content: space-between;

    svg {
      height: auto;
      font-size: ${({ theme }) => theme.fontDefault.h5};
    }
  }

  &.no-account {
  }
  &.not-active {
  }

  &.unlocked {
  }

  &.wrong-network {
    background: var(--color-error);
    color: var(--color-text-primary);
  }
`;
const ProviderBox = styled(Box)<ButtonProps & { account?: any }>`
  display: none;
  background-image: none;
  height: 100%;
  width: 48px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  ${({ account }) => {
    if (account && account.connectName) {
      const item = gatewayList.find(({ key }) => key === account.connectName);
      // connectName: keyof typeof ConnectProviders;
      return item?.imgSrc
        ? `
         display: flex;
         background-image:url(${item.imgSrc});
        `
        : "";
    }
  }};
` as (props: ButtonProps & { account: any }) => JSX.Element;
// const TestNetworkStyle = styled(Typography)`
//   // display: inline-flex;
//   position: relative;
//   cursor: initial;
//   height: 3rem;
//
//   &:after {
//     content: "";
//     position: absolute;
//     z-index: -1;
//     top: 0;
//     left: 0;
//     right: 0;
//     bottom: 0;
//     background: var(--network-bg);
//     ${({ theme }) =>
//       theme.border.defaultFrame({
//         d_W: 0,
//         d_R: 1 / 2,
//         c_key: "var(--opacity)",
//       })};
//   }
//
//   ${({ theme }) =>
//     theme.border.defaultFrame({ d_W: 0, d_R: 1 / 2, c_key: "var(--opacity)" })};
// ` as typeof Typography;

export const WalletConnectBtn = ({
  accountState,
  handleClick,
}: WalletConnectBtnProps) => {
  const { t, i18n } = useTranslation(["layout", "common"]);
  const { isMobile } = useSettings();
  const [label, setLabel] = React.useState<string>(t("labelConnectWallet"));

  const [btnClassname, setBtnClassname] =
    React.useState<string | undefined>("");
  const [icon, setIcon] = React.useState<JSX.Element | undefined>();

  React.useEffect(() => {
    const account = accountState?.account;
    if (account) {
      const addressShort = account.accAddress
        ? getShortAddr(account?.accAddress)
        : undefined;
      if (addressShort) {
        setLabel(addressShort);
      }
      setIcon(undefined);

      myLog("wallet connect account.readyState:", account.readyState);

      switch (account.readyState) {
        case AccountStatus.UN_CONNECT:
          setBtnClassname("un-connect");
          setLabel("labelConnectWallet");
          break;
        case AccountStatus.LOCKED:
          setBtnClassname("locked");
          setIcon(
            <LockIcon color={"error"} style={{ width: 16, height: 16 }} />
          );
          break;
        case AccountStatus.ACTIVATED:
          setBtnClassname("unlocked");
          setIcon(
            <CircleIcon fontSize={"large"} htmlColor={"var(--color-success)"} />
          );
          break;
        case AccountStatus.NO_ACCOUNT:
          setBtnClassname("no-account");
          setIcon(<CircleIcon fontSize={"large"} color={"error"} />);
          break;
        case AccountStatus.DEPOSITING:
          setBtnClassname("depositing");
          setIcon(
            <LoadingIcon color={"primary"} style={{ width: 18, height: 18 }} />
          );
          break;
        case AccountStatus.NOT_ACTIVE:
          setBtnClassname("not-active");
          setIcon(
            <CircleIcon fontSize={"large"} htmlColor={"var(--color-warning)"} />
          );
          break;
        case AccountStatus.ERROR_NETWORK:
          setBtnClassname("wrong-network");
          setLabel("labelWrongNetwork");
          setIcon(<UnConnectIcon style={{ width: 16, height: 16 }} />);
          break;
        default:
      }

      if (account && account._chainId === sdk.ChainId.GOERLI) {
        setNetworkLabel(isMobile ? "G ö" : "Görli");
      } else {
        setNetworkLabel("");
      }
    } else {
      setLabel("labelConnectWallet");
    }
  }, [accountState?.account?.readyState, i18n]);

  const _handleClick = (event: React.MouseEvent) => {
    // debounceCount(event)
    if (handleClick) {
      handleClick(event);
    }
  };

  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId: 'wallet-connect-notification'`,
  });
  return (
    <>
      {networkLabel ? (
        <TestNetworkStyle
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"center"}
          paddingX={1}
          component={"span"}
          color={"var(--vip-text)"}
          marginRight={1 / 2}
        >
          {networkLabel}
        </TestNetworkStyle>
      ) : (
        <></>
      )}
      {!isMobile && <ProviderBox account={accountState?.account} />}
      <WalletConnectBtnStyled
        variant={
          ["un-connect", "wrong-network"].findIndex(
            (ele) => btnClassname === ele
          ) !== -1
            ? "contained"
            : "outlined"
        }
        size={
          ["un-connect", "wrong-network"].findIndex(
            (ele) => btnClassname === ele
          ) !== -1
            ? "small"
            : "medium"
        }
        color={"primary"}
        className={`wallet-btn ${btnClassname}`}
        onClick={_handleClick}
        {...bindHover(popupState)}
      >
        {icon ? (
          <Typography component={"i"} marginLeft={-1}>
            {icon}
          </Typography>
        ) : (
          <></>
        )}
        <Typography
          component={"span"}
          variant={"body1"}
          lineHeight={1}
          color={"inherit"}
        >
          {t(label)}
        </Typography>
      </WalletConnectBtnStyled>
    </>
  );
};

// export const WalletConnectUI = ({
//   accountState,
//   handleClick,
// }: WalletConnectBtnProps) => {
//   const { t } = useTranslation(["layout", "common"]);
//   const { isMobile } = useSettings();
//   const { chainId } = useSystem();
//   const [label, setLabel] = React.useState<string>(t("labelConnectWallet"));
//   const [networkSelected, setNetworkSelected] = React.useState<
//     string | undefined
//   >(chainId ?? ChainId.MAINNET);
//   const hanleOnNetworkSwitch = (value) => {
//     //TODO before
//     setNetworkSelected(value);
//   };
//   const NetWorkItems = React.useMemo(() => {
//     return (
//       <OutlineSelect
//         aria-label={t(label)}
//         IconComponent={DropDownIcon}
//         labelId="language-selected"
//         id="language-selected"
//         value={networkSelected}
//         autoWidth
//         onChange={() => {
//           //TODO:
//         }}
//       >
//         {AvaiableNetwork.map((id) => {
//           if (NetworkMap[id]) {
//             return (
//               <OutlineSelectItem key="id" value={NetworkMap[id].id}>
//                 $ {t(NetworkMap[id].label)}
//               </OutlineSelectItem>
//             );
//           } else {
//             return {
//               chainId: id.toString(),
//               name: "Network Unknown:" + id,
//             };
//           }
//         })}
//       </OutlineSelect>
//     );
//   }, []);
//   // const
//
//   const [btnClassname, setBtnClassname] =
//     React.useState<string | undefined>("");
//   const [icon, setIcon] = React.useState<JSX.Element | undefined>();
//   const update = React.useCallback(() => {
//     const { account } = accountState;
//     const addressShort = account.accAddress
//       ? getShortAddr(account?.accAddress)
//       : undefined;
//     if (addressShort) {
//       setLabel(addressShort);
//     }
//     setIcon(undefined);
//
//     myLog("wallet connect account.readyState:", account.readyState);
//
//     switch (account.readyState) {
//       case AccountStatus.UN_CONNECT:
//         setBtnClassname("un-connect");
//         setLabel("labelConnectWallet");
//         break;
//       case AccountStatus.LOCKED:
//       case AccountStatus.ACTIVATED:
//       case AccountStatus.NO_ACCOUNT:
//       case AccountStatus.DEPOSITING:
//       case AccountStatus.NOT_ACTIVE:
//         setBtnClassname("unlocked");
//         setIcon(
//           <CircleIcon fontSize={"large"} htmlColor={"var(--color-success)"} />
//         );
//         break;
//       case AccountStatus.ERROR_NETWORK:
//         setBtnClassname("wrong-network");
//         setLabel("labelWrongNetwork");
//         setIcon(<UnConnectIcon style={{ width: 16, height: 16 }} />);
//         break;
//       default:
//     }
//
//     if (account && account._chainId !== networkSelected) {
//       // netWorkItems
//       hanleOnNetworkSwitch(account._chainId);
//     }
//   }, [accountState]);
//   React.useEffect(() => {
//     if (accountState.status === SagaStatus.UNSET) {
//       update();
//     }
//   }, [accountState.status]);
//
//   const _handleClick = (event: React.MouseEvent) => {
//     // debounceCount(event)
//     if (handleClick) {
//       handleClick(event);
//     }
//   };
//
//   const popupState = usePopupState({
//     variant: "popover",
//     popupId: `popupId: 'wallet-connect-notification'`,
//   });
//   return (
//     <>
//       {NetWorkItems}
//
//       {!isMobile && <ProviderBox account={accountState?.account} />}
//       <WalletConnectBtnStyled
//         variant={
//           ["un-connect", "wrong-network"].findIndex(
//             (ele) => btnClassname === ele
//           ) !== -1
//             ? "contained"
//             : "outlined"
//         }
//         size={
//           ["un-connect", "wrong-network"].findIndex(
//             (ele) => btnClassname === ele
//           ) !== -1
//             ? "small"
//             : "medium"
//         }
//         color={"primary"}
//         className={`wallet-btn ${btnClassname}`}
//         onClick={_handleClick}
//         {...bindHover(popupState)}
//       >
//         {icon ? (
//           <Typography component={"i"} marginLeft={-1}>
//             {icon}
//           </Typography>
//         ) : (
//           <></>
//         )}
//         <Typography
//           component={"span"}
//           variant={"body1"}
//           lineHeight={1}
//           color={"inherit"}
//         >
//           {t(label)}
//         </Typography>
//       </WalletConnectBtnStyled>
//     </>
//   );
// };

export const WalletConnectL1Btn = ({
  accountState,
  handleClick,
}: WalletConnectBtnProps) => {
  const {t, i18n} = useTranslation(["layout", "common"]);
  // const { isMobile } = useSettings();
  const { chainId } = useSystem();
  const [label, setLabel] = React.useState<string>(t("labelConnectWallet"));
  const [networkSelected, setNetworkSelected] = React.useState<
    string | number | undefined
  >(chainId ?? ChainId.MAINNET);
  const hanleOnNetworkSwitch = (value: string) => {
    //TODO before
    setNetworkSelected(value);
  };

  const NetWorkItems = React.useMemo(() => {
    return (
      <OutlineSelect
        aria-label={t(label)}
        IconComponent={DropDownIcon}
        labelId="language-selected"
        id="language-selected"
        value={networkSelected}
        autoWidth
        onChange={(event: SelectChangeEvent<any>) =>
          hanleOnNetworkSwitch(event.target.value)
        }
      >
        {AvaiableNetwork.map((id) => {
          if (NetworkMap[id]) {
            return (
              <OutlineSelectItem key="id" value={NetworkMap[id].chainId}>
                $ {t(NetworkMap[id].label)}
              </OutlineSelectItem>
            );
          } else {
            return {
              chainId: id.toString(),
              name: "Network Unknown:" + id,
            };
          }
        })}
      </OutlineSelect>
    );
  }, []);
  const [btnClassname, setBtnClassname] =
    React.useState<string | undefined>("");
  const [icon, setIcon] = React.useState<JSX.Element | undefined>();

  React.useEffect(() => {
    const account = accountState?.account;
    if (account) {
      const addressShort = account.accAddress
        ? getShortAddr(account?.accAddress)
        : undefined;
      if (addressShort) {
        setLabel(addressShort);
      }
      setIcon(undefined);

      myLog("wallet connect account.readyState:", account.readyState);

      switch (account.readyState) {
        case AccountStatus.UN_CONNECT:
          setBtnClassname("un-connect");
          setLabel("labelConnectWallet");
          break;
        case AccountStatus.LOCKED:
        case AccountStatus.ACTIVATED:
        case AccountStatus.NO_ACCOUNT:
        case AccountStatus.DEPOSITING:
        case AccountStatus.NOT_ACTIVE:
          setBtnClassname("unlocked");
          const chainId = account._chainId as any;
          switch (chainId) {
            case sdk.ChainId.MAINNET:
              setIcon(
                <Typography
                  paddingRight={1}
                  color={"var(--color-text-third)"}
                  display={"inline-flex"}
                  alignItems={"center"}
                >
                  <CircleIcon
                    fontSize={"large"}
                    htmlColor={"var(--color-success)"}
                  />
                  L1
                </Typography>
                // <CircleIcon fontSize={"large"} ChainIdhtmlColor={"var(--color-success)"} />
              );
              break;
            case sdk.ChainId.GOERLI:
            case ChainIdExtends.TAIKO_A2:
              setIcon(
                <Typography paddingRight={1} color={"var(--color-text-third)"}>
                  Test
                </Typography>
                // <CircleIcon fontSize={"large"} htmlColor={"var(--color-success)"} />
              );
              break;
            // setIcon(
            //   <Typography color={'--color-text-third'>{ChainIdExtends[account._chainId]}</Typography>
            //   // <CircleIcon fontSize={"large"} htmlColor={"var(--color-success)"} />
            // );
          }
          break;
        case AccountStatus.ERROR_NETWORK:
          setBtnClassname("wrong-network");
          setLabel("labelWrongNetwork");
          setIcon(<UnConnectIcon style={{ width: 16, height: 16 }} />);
          break;
        default:
      }

      // if (account && account._chainId === sdk.ChainId.GOERLI) {
      //   setNetworkLabel(isMobile ? "G ö" : "Görli");
      // } else if (
      //   account &&
      //   (account._chainId as any) == ChainIdExtends.TAIKO_A2
      // ) {
      //   setNetworkLabel(isMobile ? "Taiko" : "Taiko");
      // } else {
      //   setNetworkLabel("");
      // }
    } else {
      setLabel("labelConnectWallet");
    }
  }, [accountState?.account?.readyState, i18n]);

  const _handleClick = (event: React.MouseEvent) => {
    // debounceCount(event)
    if (handleClick) {
      handleClick(event);
    }
  };

  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId: 'wallet-connect-notification'`,
  });
  return (
    <>
      {NetWorkItems}
      <WalletConnectBtnStyled
        variant={
          ["un-connect", "wrong-network"].findIndex(
            (ele) => btnClassname === ele
          ) !== -1
            ? "contained"
            : "outlined"
        }
        size={
          ["un-connect", "wrong-network"].findIndex(
            (ele) => btnClassname === ele
          ) !== -1
            ? "small"
            : "medium"
        }
        color={"primary"}
        className={`wallet-btn ${btnClassname}`}
        onClick={_handleClick}
        {...bindHover(popupState)}
      >
        {icon ? (
          <Typography component={"i"} marginLeft={-1}>
            {icon}
          </Typography>
        ) : (
          <></>
        )}
        <Typography
          component={"span"}
          variant={"body1"}
          lineHeight={1}
          color={"inherit"}
        >
          {t(label)}
        </Typography>
      </WalletConnectBtnStyled>
    </>
  );
};
