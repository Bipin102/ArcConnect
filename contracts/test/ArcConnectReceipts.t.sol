// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {ArcConnectReceipts} from "../src/ArcConnectReceipts.sol";

contract ArcConnectReceiptsTest is Test {
    ArcConnectReceipts receipts;
    address recipient = address(0xBEEF);

    function setUp() public {
        receipts = new ArcConnectReceipts();
    }

    function test_recordPayment_storesReceiptAndEmitsEvent() public {
        bytes32 refId = keccak256("tx-1");

        vm.expectEmit(true, true, true, true);
        emit ArcConnectReceipts.PaymentRecorded(address(this), recipient, 1_000_000, 26, refId);

        receipts.recordPayment(recipient, 1_000_000, 26, refId);

        (address sender, address r, uint256 amount, uint32 domain, uint64 timestamp) = receipts.receipts(refId);
        assertEq(sender, address(this));
        assertEq(r, recipient);
        assertEq(amount, 1_000_000);
        assertEq(domain, 26);
        assertEq(timestamp, block.timestamp);
        assertTrue(receipts.isRecorded(refId));
    }

    function test_recordPayment_revertsOnZeroRecipient() public {
        vm.expectRevert(ArcConnectReceipts.ZeroRecipient.selector);
        receipts.recordPayment(address(0), 1, 0, keccak256("a"));
    }

    function test_recordPayment_revertsOnZeroAmount() public {
        vm.expectRevert(ArcConnectReceipts.ZeroAmount.selector);
        receipts.recordPayment(recipient, 0, 0, keccak256("b"));
    }

    function test_recordPayment_revertsOnDuplicateReference() public {
        bytes32 refId = keccak256("dup");
        receipts.recordPayment(recipient, 1, 0, refId);

        vm.expectRevert(ArcConnectReceipts.ReferenceAlreadyRecorded.selector);
        receipts.recordPayment(recipient, 2, 0, refId);
    }

    function test_isRecorded_falseForUnknownReference() public view {
        assertFalse(receipts.isRecorded(keccak256("unknown")));
    }
}
