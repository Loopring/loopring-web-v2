export default [
  {
    inputs: [{ internalType: 'address', name: '_exchange', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'from', type: 'address' },
      { indexed: false, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'address', name: 'token', type: 'address' },
      { indexed: false, internalType: 'uint96', name: 'amount', type: 'uint96' },
      { indexed: false, internalType: 'uint256', name: 'duration', type: 'uint256' },
    ],
    name: 'Deposited',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'address', name: 'tokenAddress', type: 'address' },
      { internalType: 'uint96', name: 'amount', type: 'uint96' },
      { internalType: 'uint256', name: 'duration', type: 'uint256' },
      { internalType: 'bytes', name: 'extraData', type: 'bytes' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'exchange',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
]