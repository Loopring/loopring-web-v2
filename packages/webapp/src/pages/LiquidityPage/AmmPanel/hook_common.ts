import React from "react";
import {
    AccountStatus,
    AmmJoinData,
    AmmInData,
    CoinInfo,
    fnType,
    IBData,
    SagaStatus,
} from '@loopring-web/common-resources';
import { AmmPanelType, TradeBtnStatus } from '@loopring-web/component-lib';
import { IdMap, useTokenMap } from '../../../stores/token';
import { useAmmMap } from '../../../stores/Amm/AmmMap';
import {
    accountStaticCallBack,
    ammPairInit,
    btnClickMap,
    btnLabel,
    makeCache,
    makeWalletLayer2
} from '../../../hooks/help';
import * as sdk from 'loopring-sdk';
import {
    AmmPoolRequestPatch,
    AmmPoolSnapshot,
    ChainId,
    dumpError400,
    ExitAmmPoolRequest,
    GetAmmPoolSnapshotRequest,
    getExistedMarket,
    GetNextStorageIdRequest,
    GetOffchainFeeAmtRequest,
    JoinAmmPoolRequest,
    LoopringMap,
    makeExitAmmPoolRequest,
    makeJoinAmmPoolRequest,
    MarketInfo,
    OffchainFeeInfo,
    OffchainFeeReqType,
    TickerData,
    toBig,
    TokenInfo,
    WsTopicType
} from 'loopring-sdk';
import { useAccount } from '../../../stores/account/hook';
import store from "stores";
import { LoopringAPI } from "api_wrapper";
import { deepClone } from '../../../utils/obj_tools';
import { myLog } from "utils/log_tools";
import { useTranslation } from "react-i18next";

import { useWalletLayer2Socket, walletLayer2Service } from 'services/socket';
import { useSocket, } from "stores/socket";
import { useToast } from "hooks/common/useToast";

export const useAmmCommon = ({pair, snapShotData,}: {
    pair: {
        coinAInfo: CoinInfo<string> | undefined,
        coinBInfo: CoinInfo<string> | undefined
    },
    snapShotData: any,
}) => {

    const {toastOpen, setToastOpen, closeToast,} = useToast()

    const {sendSocketTopic, socketEnd} = useSocket()

    const {account} = useAccount()

    const [ammPoolSnapshot, setAmmPoolSnapShot] = React.useState<AmmPoolSnapshot>()

    const {marketArray, marketMap,} = useTokenMap();
    const {ammMap} = useAmmMap();

    const updateAmmPoolSnapshot = React.useCallback(async () => {

        if (!pair?.coinAInfo?.simpleName || !pair?.coinBInfo?.simpleName || !LoopringAPI.ammpoolAPI) {
            return
        }

        const {market, amm} = getExistedMarket(marketArray, pair.coinAInfo.simpleName as string,
            pair.coinBInfo.simpleName as string)

        if (!market || !amm || !marketMap || !ammMap || !ammMap[ amm as string ]) {
            return
        }

        const ammInfo: any = ammMap[ amm as string ]

        const request1: GetAmmPoolSnapshotRequest = {
            poolAddress: ammInfo.address
        }

        const response = await LoopringAPI.ammpoolAPI.getAmmPoolSnapshot(request1)

        if (!response) {
            myLog('err res:', response)
            return
        }

        const {ammPoolSnapshot} = response

        setAmmPoolSnapShot(ammPoolSnapshot)

    }, [pair, marketArray, ammMap, setAmmPoolSnapShot])

    React.useEffect(() => {
        if (account.readyState === AccountStatus.ACTIVATED) {
            sendSocketTopic({[ WsTopicType.account ]: true});
        } else {
            socketEnd()
        }
        return () => {
            socketEnd()
        }
    }, [account.readyState]);

    const refreshRef = React.createRef()

    React.useEffect(() => {
        if (refreshRef.current && pair) {
            // @ts-ignore
            refreshRef.current.firstElementChild.click();
        }

    }, []);

    const walletLayer2Callback = React.useCallback(() => {

        if (snapShotData) {
            setAmmPoolSnapShot(snapShotData.ammPoolSnapshot)
        }

    }, [snapShotData, setAmmPoolSnapShot])

    React.useEffect(() => {
        walletLayer2Callback()
    }, [snapShotData])

    return {
        toastOpen,
        setToastOpen,
        closeToast,
        refreshRef,
        ammPoolSnapshot,
        updateAmmPoolSnapshot,
    }

}
