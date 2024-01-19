import Web3 from 'web3'
export const waitForTx = (web3: Web3, hash: string) => {
  return new Promise((res, rej) => {
    let subscription = web3.eth.subscribe('newBlockHeaders', async (error, event) => {
      if (error) {
        subscription.unsubscribe()
        rej(error)
      }
      const blockTxHashes = (await web3.eth.getBlock(event.hash)).transactions
      if (blockTxHashes.includes(hash)) {
        res(await web3.eth.getTransactionReceipt(hash))
        subscription.unsubscribe()
      }
    })
  })
}
