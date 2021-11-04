# RISK DISCLOSURE




Loopring Applications (“**Application**” or “**App**”), including but not limited to Loopring Smart Wallets (“**Wallets**”) and Loopring Exchanges (“**Exchanges**”) provide services (“**Services**”) using the cutting-edge technology such as blockchain, smart contracts and zero-knowledge proofs, which involve some risks (“**Risks**”) as described below.  Using our sServices means that you understand and accept these Risks.  Otherwise, please immediately stop using the Loopring App.

## 1. WALLET RELATED RISK

1.1. **Insufficient Guardians**

Loopring Wallet requires you to set up three or more guardians for your Wallet. If your Wallet does not have three or more guardians, your Wallet may become unrecoverable because the guardians are unavailable, or you may lose the tokens in the Wallet due to the actions of individual guardians.

1.2. **Official Guardian**

After your Wallet is created, we will add Loopring Official Guardian service to your Wallet by default.  As a centralized service, Loopring Official Guardian may be attacked and controlled by hackers.

1.3. **Super Administrator**

The Loopring Smart Wallet contract has a super administrator who cannot change any Wallet status or transfer the tokens in the Wallet without user authorization. However, the super administrator has the right to do the following operations:

- (1) Modify the global whitelist so that there is no daily limit for transfers to any address in the whitelist;
- (2) Register new functional modules optional for the users;
- (3) Change the mapping relationship between ENS and address. This operation will cause the assets transferred to the same ENS to actually be transferred to different addresses. Therefore, you need to verify the receiving address when transferring funds through ENS.

1.4. **Operation Not In Time**


The security of your Wallet depends on your timely implementation of specific operations, including but not limited to:

- (1) You should add at least **3 guardians** as soon as possible after the Wallet is created and ensure the security of the guardian's own wallet and the availability of the guardian;
- (2) After the device is lost, you must lock the Wallet with the guardian within **24 hours**;
- (3) After the Wallet is stolen, you must contact the guardian within **72 hours** to complete the Wallet recovery.

## 2. TRANSACTION RELATED RISKS

The following Risks only affect the security of your assets in Loopring's second-tier account.

2.1. **Circuit Trust Setup Incompleted**

Loopring has not yet completed the trusted setup of the circuit with sufficient participants. We expect to invite more participants later.

2.2. **Super Administrator Rights**

Loopring Exchange is still in the testing stage. In order to fix online problems in time, we have super administrator rights for exchange contracts. With this permission, Loopring can change the verification data used for contract deployment and zero-knowledge proof. We have adopted 4/6 multi-signature to manage the super administrator rights, and in the future, we will add a time lock function to further ensure the transparency of the operation.

2.3. **Transaction Rollback**

Transaction rollback is a common risk for all two-layer expansion plans, that is, the return result of back-end interface calls does not have the finality of the basic token network.

2.4. **Untimely Withdrawal**
Untimely deposit of the basic token network is also a Risk shared by all the second-tier expansion plans. Although we support fast withdrawal in the new version of the Loopring Protocol, which has the experience consistent with that of a centralized exchange, there are still many situations where it is impossible to withdraw quickly. In the worst case, the withdrawal time will be measured in hours. Users who arbitrage between different platforms need to withdraw frequently. These users need to evaluate and accept the Risk.

## 3. OTHER RISKS

In addition to the Risks described above, there are other known and unknown Risks associated with the use of the Loopring Applications.  If you have any questions, comments, or suggestions, please [contact us](https://loopring.io/#/report?noheader&nofooter).


---


Last Updated: January 16, 2021.