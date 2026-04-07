# Perform Analysis with TSA tool

The tool is already installed. Refer to `references/tsa-configuration.md`.

To run it:
```
java -jar tsa-cli.jar custom-checker --help
```

Take the exact path to `tsa-cli.jar` from `references/tsa-configuration.md`.

TSA documentation: https://tonsec.dev/docs.

There is an alternative way to use TSA - Blueprint plugin. Do not use it. Use the CLI.

## Some used terminology

**Opcode** is the first 32 bits of a message body.
There is a convention for TON smart contracts that it encodes an action that is triggered by an incoming message.

## Vulnerabilities to check with TSA

Use TSA to find or validate the absence of the following vulnerabilities:

- Anyone can withdraw TONs from a contract
  - Source code of the checker: `scripts/drain-check.fc`
  - Guide on using such checker in Blueprint plugin (just for reference, do not use the plugin): https://tonsec.dev/guides/drain-check

- Contract is vulnerable to a replay attack
  - Source code of the checker: `scripts/replay-attack.fc`
  - This checks for replay attack only for external messages.
    If internal messages rely on signature verification as well, you can check for replay attack there as well.
    In this case, you will have to write your own checker for this situation.
  - Guide on using such checker in Blueprint plugin (just for reference, do not use the plugin): https://tonsec.dev/guides/replay-attack

- Contract doesn't process bounced messages correctly.
  - Source code of the checker: `scripts/bounce-check.fc`
  - This check is inter-contract.
    The first contract is the contract under analysis, the second one is a contract that always throws an exception.
    Source code of this contract: `scripts/throw-contract.fc`.
  - In inter-contract analysis, you always have to give an inter-contract communication scheme.
    Scheme for this analyzer: `scripts/bounce-check-scheme.json`.
    It tells that all messages generated in contract 1 (the analyzed contract) should be sent to contract 2 (the thrower contract) as vice versa.
  - Guide on using such checker in Blueprint plugin (just for reference, do not use the plugin): https://tonsec.dev/guides/bounce-check

Mostly focus on the first vulnerability (anyone can withdraw TONs), since it is the most severe one.
Especially for the contracts that are designed to hold money (line vaults).

TSA can give false-positives due to symbolic engine issues (behavior might not be correctly modeled),
but all listed issues are almost NEVER intended behavior. 
So, if TSA reported them, it is VERY SERIOUS, do not dismiss it!

## Technical details on running TSA

Refer to TSA documentation, CLI `--help` option and `references/tsa-guidelines.md`.

Also, after running TSA, don't forget to follow the instructions in `references/tsa-interpretation.md`.

## Instructions

### Step 1: Choose a vulnerability you want to check for

Get one from the list above or formulate a new one.

To check the property, get a standard checker or write a custom on.
Refer to `references/tsa-custom-checkers.md`.

### Step 2: Make sure the checker is looking for what it is supposed to be looking

Check that the FunC code is valid.

Check that the required properties are encoded correctly, all variables are updated as expected.

Conventions from `references/tsa-custom-checkers.md` should be followed.

### Step 3: Run single-contract analysis

The simplest case is when a vulnerability can be seen by analyzing only one isolated contract.
First, check for this.

#### If TSA found something

Refer to `references/tsa-interpretation.md`

### Step 4: Find interesting inter-contract paths

More complicated vulnerabilities can be found only when analyzing interaction of several contracts.
Analyzing all possible inter-contract paths is too time-consuming, so you need to check only relevant inter-contract paths.

For example, if you are checking whether any user can withdraw money from a contract, you need to analyze paths 
that result in sending messages to arbitrary addresses.
The predicate you need to check is whether the money in the messages sent by analyzed contract exceed the money sent by the user.

Try standard paths. For example, if you are auditing a DEX, perform `swap`. 
Find what the standard operations are and check them with TSA. 
Specify the opcodes in inter-contract scheme and custom checkers.

Do not forget to assert the starting opcode (with `tsa_assert` method) in the checker when inspecting specific inter-contract path.

**Important**: Refer to `references/tsa-inter-contract-paths.md` for guidance on choosing valid entry points. The initial message is sent from a random address, so the entry opcode must not have sender address checks.

### Step 5: Construct checker, inter-contract communication scheme and run inter-contract analysis with TSA.

For reference, see `bounce-check` and https://tonsec.dev/docs/inter-contract.

Before running TSA, make sure that the checker is correct (refer to step 2).

#### If TSA found something

Refer to `references/tsa-interpretation.md`

### Step 6: Validate intesting findings with ordinary tests

Refer to `references/validation`.

Write tests to confirm the findings, but remember that TSA findings are almost never intended behavior.

### Step 7: If the vulnerability was confirmed, report it
