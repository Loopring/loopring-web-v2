# Security Specs

This describes how the Loopring Wallet smart contracts work in terms of guardians, locks, limits, and security in general. Your Loopring Wallet is not a 'normal' Ethereum address (not an EOA), it is a smart contract. As such, it is much more flexible, and it has rules and logic baked in, which makes it much more user-friendly, secure, and extensible in the future. You will see that all rules below err on the side of caution. Security is at the core of Loopring Wallet design decisions.

## Definitions

- **Guardians**: Ethereum addresses that you name as part of your wallet's 'security team'. A guardian can be an address on a hardware wallet you own, a software wallet you own, or an address that a friend or family member controls, or even an institution that exists to provide this service for you. You can name many guardians, and together, according to the below rules, they become your safety net - no more seed phrases that can be misplaced or stolen. If you ever lose your wallet, your guardians - collectively - can help you recover it. Read on for details. You setup your guardians within your Loopring Wallet, and on https://loopring.io/#/guardian.
- **More than half of the guardians needed for approval** means that if the wallet has N guardians, the transaction needs to be approved by at least N/2+1 guardians.
- **More than half of the guardians plus Owner needed for approval** means that if the wallet has N guardians, the transaction needs at least (N+1)/2+1 guardians to approve. In these cases, the Owner must be among those that approve the transaction.

## Rules

### Creation
- When the wallet is created, the ENS domain name (such as daniel.loopring.eth) will be permanently bound to the wallet address. The wallet address and ENS cannot be changed.
- The official Loopring guardian is automatically added when the wallet is created. The official guardian can be deleted, and also added again by the user in future.

### Basics
- Loopring Wallet uses Meta Transactions to send transactions by default, and supports multiple currencies used for fees, not just ETH.
- Loopring Wallet can expand functionality in future (including upgrades) through contract modules. The contract module needs Loopring certification and registration, and can be added to the user's wallet only after the user's signature authorizes it. That is, Loopring cannot add new features to a user's wallet without a user's explicit permission.
- Loopring Wallet supports signature verification and follows the ERC1271 specification. The verification will fail after the wallet is locked (see below).

### Safety
- Owners can add the first 2 guardians, which will take effect immediately; adding further guardians (and removing guardians) will take effect after 72 hours (unless approved by more than half of the existing guardians plus the owner, in which case it also takes effect immediately).
- The addition and removal of guardians requires more than half of the guardians plus the owner. The operation takes effect immediately.
- The Owner, or any guardian, can lock the wallet, and this operation takes effect immediately. After the wallet is locked, it must be unlocked to resume functionality.
- More than half of the guardians are needed to unlock the wallet. Unlocking then takes effect immediately.
- In case you lose access to your wallet, more than half of the guardians are needed to recover the wallet (i.e. "social recovery"), and this operation will take effect immediately. After the wallet is successfully restored, the wait time for the addition & deletion of guardian operations will be invalidated, so you can add guardians immediately (like the first time).

### Transfers
- Users can impose a limit on daily transfer amounts. By default, transfers have no daily limit. The increase of the daily limit takes effect within 24 hours. The decrease of the daily limit will take effect immediately.
- Users can whitelist addresses, which are then exempt from daily limits. Interacting with whitelisted addresses is not subject to daily limit. Adding a whitelist address takes effect 24 hours; deleting a whitelist address takes effect immediately.
- More than half of the guardians plus the owner are required for the addition and deletion of whitelisted addresses. The operation takes effect immediately.
- There is the ability for a global DApp whitelist address list. Transferring or interacting with a DApp on the whitelist address is not restricted by daily limit. The global DApp whitelist is managed by Loopring. (This means you can interact with some yield protocol, for example, without it affecting your limit).
