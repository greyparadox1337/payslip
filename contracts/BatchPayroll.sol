// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BatchPayroll {
    event PayrollDisbursed(
        address indexed employer,
        address indexed employee,
        uint256 amount,
        string memo
    );

    /**
     * @dev Disburse native tokens to multiple recipients in a single transaction.
     * @param recipients Array of employee wallet addresses.
     * @param amounts Array of amounts (in wei) to send to each employee.
     * @param memos Array of memos for each payment (optional, can be empty strings).
     */
    function bulkDisburse(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string[] calldata memos
    ) external payable {
        require(recipients.length == amounts.length, "Mismatched array lengths");
        require(recipients.length == memos.length, "Mismatched memos length");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        require(msg.value == totalAmount, "Incorrect total native token amount");

        for (uint256 i = 0; i < recipients.length; i++) {
            (bool success, ) = recipients[i].call{value: amounts[i]}("");
            require(success, "Transfer to employee failed");

            emit PayrollDisbursed(msg.sender, recipients[i], amounts[i], memos[i]);
        }
    }
}
