import styled from "@emotion/styled";
import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";
import { withTranslation } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { Button, Grid } from "@mui/material";
import {
  AccountFull,
  AccountStatus,
  ConnectProviders,
  gatewayList,
} from "@loopring-web/common-resources";
import {
  ModalWalletConnect,
  ProviderMenu,
  WalletConnectQRCode,
  WalletConnectStep,
} from "./WalletConnect";
import { ModalQRCode, QRCodePanel } from "./QRCode";

import { account } from "../../static";
import { WalletConnectBtn } from "../header";
import { Box } from "@mui/material";

import {
  MetaMaskConnectInProgress,
  WalletConnectConnectInProgress,
  ConnectSuccess,
  ConnectFailed,
} from "index";

const Style = styled.div`
  flex: 1;
  height: 100%;
  flex: 1;
`;

const accountState: AccountFull = {
  account: {
    ...account,
    _chainId: 1,
  },
  status: "DONE",
  resetAccount: () => undefined,
  updateAccount: () => undefined,
};
const ConnectButtonWrap = withTranslation("common")((_rest: any) => {
  return (
    <>
      <Grid item xs={3}>
        <WalletConnectBtn
          accountState={accountState}
          handleClick={() => undefined}
        ></WalletConnectBtn>
      </Grid>
      <Grid item xs={3}>
        <WalletConnectBtn
          accountState={{
            ...accountState,
            account: { ...account, readyState: AccountStatus.NO_ACCOUNT },
          }}
          handleClick={() => undefined}
        ></WalletConnectBtn>
      </Grid>
      <Grid item xs={3}>
        <WalletConnectBtn
          accountState={{
            ...accountState,
            account: { ...account, readyState: AccountStatus.DEPOSITING },
          }}
          handleClick={() => undefined}
        ></WalletConnectBtn>
      </Grid>
      <Grid item xs={3}>
        <WalletConnectBtn
          accountState={{
            ...accountState,
            account: { ...account, readyState: AccountStatus.NOT_ACTIVE },
          }}
          handleClick={() => undefined}
        ></WalletConnectBtn>
      </Grid>
      <Grid item xs={3}>
        <WalletConnectBtn
          accountState={{
            ...accountState,
            account: { ...account, readyState: AccountStatus.ACTIVATED },
          }}
          handleClick={() => undefined}
        ></WalletConnectBtn>
      </Grid>
      <Grid item xs={3}>
        <WalletConnectBtn
          accountState={{
            ...accountState,
            account: { ...account, readyState: AccountStatus.ERROR_NETWORK },
          }}
          handleClick={() => undefined}
        ></WalletConnectBtn>
      </Grid>
      <Grid item xs={3}>
        <WalletConnectBtn
          accountState={{
            ...accountState,
            account: { ...account, readyState: AccountStatus.LOCKED },
          }}
          handleClick={() => undefined}
        ></WalletConnectBtn>
      </Grid>
      <Grid item xs={3}>
        <WalletConnectBtn
          accountState={{
            ...accountState,
            account: {
              ...account,
              readyState: AccountStatus.LOCKED,
              _chainId: 5,
            },
          }}
          handleClick={() => undefined}
        ></WalletConnectBtn>
      </Grid>
    </>
  );
});

const Template: Story<any> = withTranslation()(({ ...rest }: any) => {
  const [openWallet, setOpenWallet] = React.useState(false);
  const [openQRCode, setOpenQRCode] = React.useState(false);
  gatewayList[0] = {
    ...gatewayList[0],
    handleSelect: () => console.log("metaMask 11"),
  };
  const url: string = "xxxxxx";
  const walletList = React.useMemo(() => {
    return Object.values({
      [WalletConnectStep.Provider]: {
        view: (
          <ProviderMenu
            gatewayList={gatewayList}
            {...{ providerName: ConnectProviders.MetaMask, ...rest }}
          />
        ),
      },
      [WalletConnectStep.MetaMaskProcessing]: {
        view: <MetaMaskConnectInProgress {...rest} />,
      },
      [WalletConnectStep.WalletConnectProcessing]: {
        view: <WalletConnectConnectInProgress {...rest} />,
      },
      [WalletConnectStep.WalletConnectQRCode]: {
        view: <WalletConnectQRCode {...rest} url={url} />,
      },
      [WalletConnectStep.SuccessConnect]: {
        view: (
          <ConnectSuccess
            {...{ providerName: ConnectProviders.MetaMask, ...rest }}
          />
        ),
      },
      [WalletConnectStep.FailedConnect]: {
        view: <ConnectFailed {...rest} onRetry={() => {}} />,
      },
    });
  }, [url]);

  // const accountList = React.useMemo(() => {
  //     return Object.values({
  //         [ AccountStep.NoAccount ]: <NoAccount {...{
  //             ...accountInfoProps, goDeposit: () => {
  //             }
  //         }}/>,
  //         [ AccountStep.Deposit ]: <DepositWrap _height={480} _width={400}  {...{...rest, ...depositProps}} />,
  //         [ AccountStep.Depositing ]: <Depositing {...{
  //             providerName: ConnectProviders.MetaMask,
  //             etherscanLink: accountInfoProps.etherscanUrl, ...rest
  //         }}/>,
  //         [ AccountStep.FailedDeposit ]: <FailedDeposit {...rest} label={'depositTitleAndActive'}
  //                                                       onRetry={() => undefined}
  //                                                       etherscanLink={accountInfoProps.etherscanUrl}/>,
  //         [ AccountStep.SignAccount ]: <ApproveAccount  {...{...accountInfoProps, ...rest}}
  //                                                       goActiveAccount={() => undefined}/>,
  //         [ AccountStep.ProcessUnlock ]: <ProcessUnlock {...{providerName: ConnectProviders.MetaMask, ...rest}}/>,
  //         [ AccountStep.SuccessUnlock ]: <SuccessUnlock {...rest}/>,
  //         [ AccountStep.FailedUnlock ]: <FailedUnlock {...rest} onRetry={() => undefined}/>,
  //         [ AccountStep.HadAccount ]: <HadAccount mainBtn={mainBtn} {...accountInfoProps}/>,
  //         [ AccountStep.TokenAccessProcess ]: <TokenAccessProcess {...{
  //             ...rest,
  //             coinInfo,
  //             providerName: ConnectProviders.MetaMask
  //         }}/>,
  //         [ AccountStep.DepositApproveProcess ]: <DepositApproveProcess {...{
  //             ...rest,
  //             providerName: ConnectProviders.MetaMask
  //         }}/>,
  //         [ AccountStep.ActiveAccountProcess ]: <ActiveAccountProcess {...{
  //             ...rest,
  //             providerName: ConnectProviders.MetaMask
  //         }}/>,
  //         [ AccountStep.FailedTokenAccess ]: <FailedTokenAccess {...{...rest, coinInfo}}/>,
  //     })
  //
  // }, [])

  return (
    <>
      <Style>
        <MemoryRouter initialEntries={["/"]}>
          <h4>Connect Button status</h4>
          <Grid
            container
            spacing={2}
            alignContent={"center"}
            justifyContent={"space-around"}
            marginBottom={2}
          >
            <ConnectButtonWrap />
          </Grid>
          <Grid container spacing={2}>
            {walletList.map((panel, index) => {
              return (
                <Box
                  key={index}
                  display={"flex"}
                  flexDirection={"column"}
                  width={480}
                  height={400}
                  padding={2}
                  justifyContent={"center"}
                  alignItems={"stretch"}
                >
                  {panel.view}
                </Box>
              );
            })}
          </Grid>
          -----------------------------
          <Button
            variant={"outlined"}
            size={"small"}
            color={"primary"}
            style={{ marginRight: 8 }}
            onClick={() => setOpenWallet(true)}
          >
            Connect wallet
          </Button>
          <ModalWalletConnect
            open={openWallet}
            onClose={() => setOpenWallet(false)}
            onBack={() => {
              setOpenWallet(false);
            }}
            panelList={walletList}
            step={WalletConnectStep.WalletConnectQRCode}
          />
          -----------------------------
          <Button
            variant={"outlined"}
            size={"medium"}
            color={"primary"}
            onClick={() => setOpenQRCode(true)}
          >
            QR Code
          </Button>
          <ModalQRCode
            open={openQRCode}
            onClose={() => setOpenQRCode(false)}
            title={"title"}
            description={"my description"}
            url="http://www.163.com"
          />
          <QRCodePanel
            {...{ ...rest }}
            description="Ox123213123123"
            url="http://www.163.com"
            handleClick={() => {
              console.log("click");
            }}
          />
          {/*<WrapTransferPanel/>*/}
          {/*<WrapDepositPanel/>*/}
          {/*<WrapWithdrawPanel />*/}
        </MemoryRouter>
      </Style>
    </>
  );
}) as Story<any>;

// @ts-ignore
export const ModalListStory = Template.bind({});

export default {
  title: "components/wallet_list",
  component: ModalWalletConnect,
  argTypes: {},
} as Meta;
