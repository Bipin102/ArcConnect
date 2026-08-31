// Minimal ABI for contracts/src/ArcConnectReceipts.sol — only what the app calls.
export const ARC_CONNECT_RECEIPTS_ABI = [
  {
    type: 'function',
    name: 'recordPayment',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'sourceDomain', type: 'uint32' },
      { name: 'refId', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'isRecorded',
    stateMutability: 'view',
    inputs: [{ name: 'refId', type: 'bytes32' }],
    outputs: [{ type: 'bool' }],
  },
  { type: 'error', name: 'ZeroRecipient', inputs: [] },
  { type: 'error', name: 'ZeroAmount', inputs: [] },
  { type: 'error', name: 'ReferenceAlreadyRecorded', inputs: [] },
] as const
