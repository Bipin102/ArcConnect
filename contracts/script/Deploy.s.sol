// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {ArcConnectReceipts} from "../src/ArcConnectReceipts.sol";

contract Deploy is Script {
    function run() external returns (ArcConnectReceipts) {
        vm.startBroadcast();
        ArcConnectReceipts receipts = new ArcConnectReceipts();
        vm.stopBroadcast();

        console.log("ArcConnectReceipts deployed at:", address(receipts));
        return receipts;
    }
}
