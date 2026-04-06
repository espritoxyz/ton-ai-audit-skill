# Vulnerability Validation

## Instructions

### Step 1: Write a test

To prove that the found vulnerability is real, ALWAYS write a test that reproduces it.

If there is no tests that confirms a vulnerability, do not report it.

Do not modify the existing tests! Put reproduction tests in a separate location.

### Step 2: Ensure that the behavior can be reproduced on an actual blockchain

Sandbox that is used to write tests for smart contracts allows you to perform some actions that are impossible on a blockchain.

For example, when you write tests, you can deploy an arbitrary smart contract on an arbitrary address.
On an actual TON blockchain that is not possible. 
The smart contract's address is a hash of its initial code and initial persistent data.
A common pattern for authorization check relies on that. 

For example, jetton-wallet checks that `internal_transfer` came from another jetton wallet by calculating
the expected address of the sender's jetton-wallet and comparing it with the sender.

Do not report such authorization checks as a lack of authorization, even though you can write such a test.

Always check that the contracts with the given code and states may actually appear on the TON blockchain.

## Result

Report a potential vulnerability only if it passes all the checks above! But make sure you don't miss the real ones.

If you are unsure, report.
