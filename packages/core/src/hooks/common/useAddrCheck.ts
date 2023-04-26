import React from "react";

import { connectProvides } from "@loopring-web/web3-provider";
import { AddressError, globalSetup } from "@loopring-web/common-resources";
import _ from "lodash";
import * as sdk from "@loopring-web/loopring-sdk";
import { checkAddr } from "../../utils";
import { LoopringAPI, useAccount, useSystem } from "../../index";

export const useAddressCheck = () => {
  const [address, setAddress] = React.useState<string>("");
  const _address = React.useRef<string>("");
  const { chainId } = useSystem();
  const [realAddr, setRealAddr] = React.useState<string>("");
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);

  const [addrStatus, setAddrStatus] = React.useState<AddressError>(
    AddressError.NoError
  );
  const [checkAddAccountId, setCheckAddaccountId] =
    React.useState<number | undefined>();

  const [isAddressCheckLoading, setIsAddressCheckLoading] =
    React.useState(false);
  const [isLoopringAddress, setIsLoopringAddress] = React.useState(false);
  const [isActiveAccount, setIsActiveAccount] = React.useState(false);
  const [isActiveAccountFee, setIsActiveAccountFee] = React.useState(false);
  const [isSameAddress, setIsSameAddress] = React.useState(false);
  const [isCFAddress, setIsCFAddress] = React.useState(false);
  const [isContractAddress, setIsContractAddress] = React.useState(false);
  const [isContract1XAddress, setIsContract1XAddress] = React.useState(false);
  const [loopringSmartWalletVersion, setLoopringSmartWalletVersion] =
    React.useState(
      undefined as
        | { isLoopringSmartWallet: boolean; version?: string }
        | undefined
    );

  const {
    account: { accAddress },
  } = useAccount();

  const check = React.useCallback(
    async (address: any, web3: any) => {
      // if( address.math)
      try {
        if (LoopringAPI.walletAPI && LoopringAPI.exchangeAPI) {
          if (
            /^0x[a-fA-F0-9]{40}$/g.test(address) ||
            /.*\.eth$/gi.test(address) ||
            (/^\d{5,8}$/g.test(address) && Number(address) > 10000)
          ) {
            if (nodeTimer.current !== -1) {
              clearTimeout(nodeTimer.current);
            }
            setIsAddressCheckLoading(true);
            const { realAddr, addressErr, isContract } = await checkAddr(
              address,
              web3
            );
            nodeTimer.current = setTimeout(() => {
              _address.current = "";
              setAddrStatus(AddressError.TimeOut);
              setRealAddr("");
              setIsAddressCheckLoading(false);
            }, 6000);

            setRealAddr(realAddr);
            setAddrStatus(addressErr);
            if (isContract) {
              setIsContractAddress(isContract);
            }
            //realAddr !== "" || (address !== "" && address.startsWith("0x"))
            if (addressErr === AddressError.NoError) {
              const [{ walletType }, response] = await Promise.all([
                LoopringAPI.walletAPI.getWalletType({
                  wallet: realAddr, //realAddr != "" ? realAddr : address,
                }),
                LoopringAPI.exchangeAPI.getAccount({
                  owner: realAddr, //realAddr != "" ? realAddr : address,
                }),
              ]);

              if (walletType && walletType?.isInCounterFactualStatus) {
                setIsCFAddress(true);
              } else {
                setIsCFAddress(false);
              }
              if (walletType && walletType.isContract) {
                setIsContractAddress(true);
              } else {
                setIsContractAddress(false);
              }
              if (
                walletType &&
                walletType.loopringWalletContractVersion !== ""
              ) {
                setLoopringSmartWalletVersion({
                  isLoopringSmartWallet: true,
                  version: walletType.loopringWalletContractVersion,
                });
              } else {
                setLoopringSmartWalletVersion({
                  isLoopringSmartWallet: false,
                });
              }
              if (
                walletType &&
                walletType.loopringWalletContractVersion?.startsWith("V1_")
              ) {
                setIsContract1XAddress(true);
              } else {
                setIsContract1XAddress(false);
              }
              if (
                response &&
                ((response as sdk.RESULT_INFO).code ||
                  (response as sdk.RESULT_INFO).message)
              ) {
                setIsLoopringAddress(false);
                setIsActiveAccount(false);
                setIsActiveAccountFee(false);
              } else {
                setIsLoopringAddress(true);
                setIsActiveAccount(response.accInfo.nonce !== 0);
                setIsActiveAccountFee(
                  response.accInfo.nonce === 0 &&
                    /FirstUpdateAccountPaid/gi.test(response.accInfo.tags ?? "")
                );
                setCheckAddaccountId(response.accInfo.accountId);
              }
            }
            clearTimeout(nodeTimer.current);
            nodeTimer.current = -1;
            setIsAddressCheckLoading(false);
          } else {
            throw Error("wrong address format");
          }
        } else {
          throw Error("No API address");
        }
      } catch (error) {
        if (nodeTimer.current !== -1) {
          clearTimeout(nodeTimer.current);
          nodeTimer.current = -1;
        }
        setAddrStatus(
          address === "" ? AddressError.EmptyAddr : AddressError.InvalidAddr
        );
        setRealAddr("");
        setIsLoopringAddress(false);
      }
    },
    [setRealAddr, setAddrStatus]
  );

  const debounceCheck = _.debounce(
    (address) => {
      check(address, connectProvides.usedWeb3);
    },
    globalSetup.wait,
    { maxWait: 1000, leading: false, trailing: true }
  );

  React.useEffect(() => {
    // myLog("checkAddress", address, _address.current, isAddressCheckLoading);
    if (_address.current !== address && isAddressCheckLoading === false) {
      debounceCheck(address);
    }
    _address.current = address;
    return () => {
      debounceCheck.cancel();
    };
  }, [address, isAddressCheckLoading, chainId]);

  React.useEffect(() => {
    setIsSameAddress(realAddr.toLowerCase() === accAddress.toLowerCase());
  }, [realAddr, accAddress]);
  return {
    address,
    realAddr,
    checkAddAccountId,
    setAddress,
    addrStatus,
    isAddressCheckLoading,
    isLoopringAddress,
    isActiveAccount,
    isCFAddress,
    isSameAddress,
    isContract1XAddress,
    isContractAddress,
    isActiveAccountFee,
    loopringSmartWalletVersion,
  };
};
