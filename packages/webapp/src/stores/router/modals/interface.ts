import {   } from '../../../api_wrapper';
import { UserNFTBalanceInfo } from '@loopring-web/loopring-sdk';
import { NFTTokenInfo } from '@loopring-web/loopring-sdk';
import { NFTWholeINFO } from '@loopring-web/common-resources';

export type WithdrawData = {
    belong: string | undefined,
    tradeValue: number | undefined,
    balance: number | undefined,
    address: string | undefined,
}

export type TransferData = {
    belong: string | undefined,
    tradeValue: number | undefined,
    balance: number | undefined,
    address: string | undefined,
    memo: string | undefined,
}

export type DepositData = {
    belong: string | undefined,
    tradeValue: number | undefined,
    balance: number | undefined,
    reffer: string | undefined,
}

export type ModalDataStatus = {
    withdrawValue: WithdrawData,
    transferValue: TransferData,
    depositValue: DepositData,
    nftWithdrawValue: WithdrawData & Partial<NFTTokenInfo & UserNFTBalanceInfo & NFTWholeINFO>,
    nftTransferValue: TransferData & Partial<NFTTokenInfo & UserNFTBalanceInfo & NFTWholeINFO>,
    nftDepositValue: DepositData & Partial<NFTTokenInfo & UserNFTBalanceInfo  & NFTWholeINFO>,
}
