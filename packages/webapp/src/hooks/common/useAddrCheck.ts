import React from "react";

import { connectProvides } from "@loopring-web/web3-provider";
import { AddressError } from "defs/common_defs";
import { checkAddr } from "utils/web3_tools";
import { LoopringAPI } from "api_wrapper";
import { useAccount } from "stores/account";
import { globalSetup } from "@loopring-web/common-resources";
import _ from "lodash";
import { WalletType } from "@loopring-web/loopring-sdk";

export const useAddressCheck = () => {
  const [address, setAddress] = React.useState<string>("");

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

  const {
    account: { accAddress },
  } = useAccount();

  const check = React.useCallback(
    async (address: any, web3: any) => {
      if (LoopringAPI.walletAPI) {
        const { realAddr, addressErr } = await checkAddr(address, web3);
        setRealAddr(realAddr);
        setAddrStatus(addressErr);
        let walletType: WalletType | undefined = undefined;
        if (realAddr !== "" || address !== "") {
          walletType = (
            await LoopringAPI.walletAPI.getWalletType({
              wallet: realAddr != "" ? realAddr : address,
            })
          ).walletType;
        }

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

        return {
          lastAddress: realAddr || address,
          addressErr,
        };
      } else {
        return {
          lastAddress: address,
          addressErr: undefined,
        };
      }
    },
    [setRealAddr, setAddrStatus]
  );

  const debounceCheck = _.debounce(async () => {
    setIsAddressCheckLoading(true);
    const { addressErr, lastAddress } = await check(
      address,
      connectProvides.usedWeb3
    );
    // check whether the address belongs to loopring layer2
    if (
      LoopringAPI &&
      LoopringAPI.exchangeAPI &&
      addressErr === AddressError.NoError &&
      lastAddress
    ) {
      const res = await LoopringAPI.exchangeAPI?.getAccount({
        owner: lastAddress,
      }); // ENS or address
      if (res && !res.error) {
        setIsLoopringAddress(true);
      } else {
        setIsLoopringAddress(false);
      }
    }
    setIsAddressCheckLoading(false);
  }, globalSetup.wait);

  React.useEffect(() => {
    if (address !== "" && isAddressCheckLoading === false) {
      debounceCheck();
    }
  }, [address, isAddressCheckLoading]);

  React.useEffect(() => {
    setIsSameAddress(
      address.toLowerCase() === accAddress.toLowerCase() ||
        realAddr.toLowerCase() === accAddress.toLowerCase()
    );
  }, [accAddress, address]);

  return {
    address,
    realAddr,
    setAddress,
    addrStatus,
    isAddressCheckLoading,
    isLoopringAddress,
    isCFAddress,
    isSameAddress,
    isContractAddress,
  };
};
