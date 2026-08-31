// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title ArcConnect Payment Receipts
/// @notice Lightweight on-chain receipt log for ArcConnect cross-chain USDC
/// payments settled via Circle's CCTP bridge or a direct same-chain USDC
/// transfer. This contract never custodies funds — it only records a
/// tamper-evident receipt after the real transfer has already settled, for
/// transparency and lookups on Arcscan.
contract ArcConnectReceipts {
    struct Receipt {
        address sender;
        address recipient;
        uint256 amount;
        uint32 sourceDomain;
        uint64 timestamp;
    }

    /// @notice refId => receipt. `refId` is caller-chosen (e.g. the
    /// settlement tx hash) and must be unique.
    mapping(bytes32 => Receipt) public receipts;

    event PaymentRecorded(
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint32 sourceDomain,
        bytes32 indexed refId
    );

    error ZeroRecipient();
    error ZeroAmount();
    error ReferenceAlreadyRecorded();

    /// @notice Record a receipt for a payment that already settled elsewhere.
    /// @param recipient Address that received the funds.
    /// @param amount Amount transferred, in the token's smallest unit.
    /// @param sourceDomain Origin chain's CCTP domain id (0 for a same-chain send).
    /// @param refId Caller-chosen unique id for this payment (e.g. the
    /// settlement transaction hash cast to bytes32).
    function recordPayment(address recipient, uint256 amount, uint32 sourceDomain, bytes32 refId) external {
        if (recipient == address(0)) revert ZeroRecipient();
        if (amount == 0) revert ZeroAmount();
        if (receipts[refId].timestamp != 0) revert ReferenceAlreadyRecorded();

        receipts[refId] =
            Receipt({sender: msg.sender, recipient: recipient, amount: amount, sourceDomain: sourceDomain, timestamp: uint64(block.timestamp)});

        emit PaymentRecorded(msg.sender, recipient, amount, sourceDomain, refId);
    }

    /// @notice Whether a refId has already been recorded.
    function isRecorded(bytes32 refId) external view returns (bool) {
        return receipts[refId].timestamp != 0;
    }
}
