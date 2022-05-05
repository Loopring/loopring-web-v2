import React from "react";

import { connectProvides } from "@loopring-web/web3-provider";
import { AddressError } from "defs/common_defs";
import { checkAddr } from "utils/web3_tools";
import { LoopringAPI } from "api_wrapper";
import { useAccount } from "stores/account";
import { globalSetup, myLog } from "@loopring-web/common-resources";
import _ from "lodash";
import * as sdk from "@loopring-web/loopring-sdk";

export const useAddressCheck = () => {
  const [address, setAddress] = React.useState<string>("");
  const _address = React.useRef<string>("");

  const [realAddr, setRealAddr] = React.useState<string>("");

  const [addrStatus, setAddrStatus] = React.useState<AddressError>(
    AddressError.NoError
  );

  const [isAddressCheckLoading, setIsAddressCheckLoading] =
    React.useState(false);

  const [isLoopringAddress, setIsLoopringAddress] = React.useState(true);

  const [isSameAddress, setIsSameAddress] = React.useState(false);

  const [isCFAddress, setIsCFAddress] = React.useState(false);
  const [isContractAddress, setIsContractAddress] = React.useState(false);
  const [isContract1XAddress, setIsContract1XAddress] = React.useState(false);

  const {
    account: { accAddress },
  } = useAccount();

  const check = React.useCallback(
    async (address: any, web3: any) => {
      // if( address.math)
      if (LoopringAPI.walletAPI && LoopringAPI.exchangeAPI) {
        if (
          /^0x[a-fA-F0-9]{40}$/g.test(address) ||
          /.*\.eth$/gi.test(address) ||
          (/^\d{5}$/g.test(address) && Number(address) > 10000)
        ) {
          setIsAddressCheckLoading(true);
          const { realAddr, addressErr } = await checkAddr(address, web3);

          setRealAddr(realAddr);
          setAddrStatus(addressErr);
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
            } else {
              setIsLoopringAddress(true);
            }
          }
          setIsAddressCheckLoading(false);
        } else {
          setAddrStatus(
            address === "" ? AddressError.EmptyAddr : AddressError.InvalidAddr
          );
        }
      } else {
        return {
          lastAddress: address,
          addressErr: undefined,
        };
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
    if (
      address !== "" &&
      _address.current !== address &&
      isAddressCheckLoading === false
    ) {
      _address.current = address;
      debounceCheck(address);
    } else if (address === "") {
      _address.current = "";
    }
  }, [address, isAddressCheckLoading]);

  React.useEffect(() => {
    setIsSameAddress(
      address.toLowerCase() === accAddress.toLowerCase() ||
        realAddr.toLowerCase() === accAddress.toLowerCase()
    );
  }, [realAddr, accAddress, address]);
  return {
    address,
    realAddr,
    setAddress,
    addrStatus,
    isAddressCheckLoading,
    isLoopringAddress,
    isCFAddress,
    isSameAddress,
    isContract1XAddress,
    isContractAddress,
  };
};
