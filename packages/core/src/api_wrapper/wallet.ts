import { ContractType } from "@loopring-web/loopring-sdk";
import { LoopringAPI } from "./"

export const getContractTypeByNetwork = async ( wallet: string ,network?: string) => {
  const res = await LoopringAPI.walletAPI!.getContractType({
    wallet: wallet
  })
  const data = (res.raw_data as any).data as ContractType[]
  if (network && data?.find(ele => ele.network === network)) {
    return data?.find(ele => ele.network === network);
  } else {
    return data && data[0]
  }
}