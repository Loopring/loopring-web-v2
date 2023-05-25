import React from "react";

import { connectProvides } from "@loopring-web/web3-provider";
import { AddressError, globalSetup } from "@loopring-web/common-resources";
import _ from "lodash";
import * as sdk from "@loopring-web/loopring-sdk";
import { checkAddr } from "../../utils";
import { LoopringAPI, RootState, useAccount, useSystem } from "../../index";
import { useSelector } from "react-redux";

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
  const [loopringSmartWalletVersion, setLoopringSmartWalletVersion] = React.useState(undefined as {isLoopringSmartWallet: boolean, version?: string} | undefined);

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
              if (walletType && walletType.loopringWalletContractVersion !== "") {
                setLoopringSmartWalletVersion({
                  isLoopringSmartWallet: true,
                  version: walletType.loopringWalletContractVersion
                });
              } else {
                setLoopringSmartWalletVersion({
                  isLoopringSmartWallet: false
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
    loopringSmartWalletVersion
  };
};

export const useAddressCheckWithContacts = (checkEOA: boolean) => {
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
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
  const [loopringSmartWalletVersion, setLoopringSmartWalletVersion] = React.useState(undefined as {isLoopringSmartWallet: boolean, version?: string} | undefined);

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
              if (walletType && walletType.loopringWalletContractVersion !== "") {
                setLoopringSmartWalletVersion({
                  isLoopringSmartWallet: true,
                  version: walletType.loopringWalletContractVersion
                });
              } else {
                setLoopringSmartWalletVersion({
                  isLoopringSmartWallet: false
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
    async (address) => {
      const found = contacts?.find(contact => contact.address === address)
      const listNoCheckRequired = [
        sdk.AddressType.LOOPRING_HEBAO_CF,
        sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_1_6,
        sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_2_0,
        sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_0_0,
        sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_1_0,
        sdk.AddressType.EXCHANGE_OTHER,
        sdk.AddressType.EXCHANGE_BINANCE,
        sdk.AddressType.EXCHANGE_OKX,
        sdk.AddressType.EXCHANGE_HUOBI,
        sdk.AddressType.EXCHANGE_COINBASE,
        sdk.AddressType.CONTRACT,
      ].concat(checkEOA ? [] : [sdk.AddressType.EOA])
      if (found && listNoCheckRequired.includes(found.addressType)) {
        setRealAddr(address) 
        switch (found.addressType) {
          case sdk.AddressType.LOOPRING_HEBAO_CF:
          case sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_1_6:
          case sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_2_0:
          case sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_0_0:
          case sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_1_0:{
            setIsLoopringAddress(true)
            setIsActiveAccount(true)
            setIsCFAddress(found.addressType === sdk.AddressType.LOOPRING_HEBAO_CF)
            setIsContractAddress(true)
            setIsContract1XAddress(
              found.addressType === sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_1_6 || 
              found.addressType === sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_2_0
            )
            setLoopringSmartWalletVersion({
              isLoopringSmartWallet: true,
              version: undefined
            })
            setAddrStatus(AddressError.NoError)
            break
          }
          case sdk.AddressType.EXCHANGE_OTHER:
          case sdk.AddressType.EXCHANGE_BINANCE:
          case sdk.AddressType.EXCHANGE_OKX:
          case sdk.AddressType.EXCHANGE_HUOBI:
          case sdk.AddressType.EXCHANGE_COINBASE:{
            setIsLoopringAddress(false)
            setIsActiveAccount(false)
            setIsActiveAccountFee(false)
            setIsCFAddress(false)
            setIsContractAddress(false)
            setIsContract1XAddress(false)
            setLoopringSmartWalletVersion({
              isLoopringSmartWallet: false
            })
            setAddrStatus(AddressError.NoError)
            break
          }
          case sdk.AddressType.CONTRACT: {
            setIsLoopringAddress(false)
            setIsActiveAccount(false)
            setIsActiveAccountFee(false)
            setIsCFAddress(false)
            setIsContractAddress(true)
            setIsContract1XAddress(false)
            setLoopringSmartWalletVersion({
              isLoopringSmartWallet: false
            })
            setAddrStatus(AddressError.IsNotLoopringContract)
            break
          }
          case sdk.AddressType.EOA: {
            setIsLoopringAddress(false)
            setIsCFAddress(false)
            setIsContractAddress(false)
            setIsContract1XAddress(false)
            setLoopringSmartWalletVersion({
              isLoopringSmartWallet: false
            })
            setAddrStatus(AddressError.NoError)
            if (checkEOA) {
              setIsAddressCheckLoading(true)
              const response = await LoopringAPI.exchangeAPI?.getAccount({
                owner: address, //realAddr != "" ? realAddr : address,
              })
              if (
                (response && ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message))
                || !response
              ) {
                setIsActiveAccount(false);
                setIsActiveAccountFee(false);
              } else {
                setIsActiveAccount(response.accInfo.nonce !== 0);
                setIsActiveAccountFee(
                  response.accInfo.nonce === 0 &&
                    /FirstUpdateAccountPaid/gi.test(response.accInfo.tags ?? "")
                );
              }
              setIsAddressCheckLoading(false)
            }
            break
          }
        }        
      } else {
        check(address, connectProvides.usedWeb3);
      }
    },
    globalSetup.wait,
    { maxWait: 1000, leading: false, trailing: true }
  );

  React.useEffect(() => {
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
    loopringSmartWalletVersion
  };
};
