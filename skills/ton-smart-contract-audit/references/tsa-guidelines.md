# Guidelines for using TSA

## Use option `--continue-on-conract-exception`.

Without this option, the analysis will be stopped if some analyzed contract throws an exception.
We are usually interested only in exceptions that the checker contract throws.
With this flag, those are the only exceptions that terminate analysis.

## Use `--timeout` option

If you are running an inter-contract analysis (except `bounce-check`, you can treat it as single-contract),
use `--timeout 300` (this way, the analysis will be run for 5 minutes at most).

If you are running single-contract analysis, use the following formula for the timeout:
```
min((number_of_opcode_in_contract + 1) * 60 seconds, 300 seconds)
```

If you are checking one specific opcode in single-contract analysis, use 60 seconds.

## Use `--solver-timeout 3` option for inter-contract analysis

In inter-contract analysis constraints are much harder than for single-contract analysis, so default 1 second is not enough.

Use 3 seconds instead.

If you are running bounce-check, you can treat it as a single-contract analysis (since the second contract is trivial).

## Use `--stop-when-exit-codes-found` option

This option tells TSA to stop the analysis once a path with the given exit code is found. 

Use the exit code from custom TSA checker (either standard or your own). 
For standard checkers you usually need `--stop-when-exit-codes-found 1000`.

## Use `--exported-inputs` option (for ALL runs, so that you don't have to re-run analysis)

With this option you get more information about inputs that reproduce the found vulnerability.

This option accepts a directory where to put the inputs. For each run, create a separate directory.

The most informative generated files are `cell-types.yaml`.
They are given for message bodies and persistent contract data (or C4 register).

To see how TSA results should be processed, you can take a look at how Blueprint plugin does this:
https://github.com/espritoxyz/blueprint-tsa/blob/main/src/common/result-parsing.ts, 
https://github.com/espritoxyz/blueprint-tsa/blob/main/src/common/analyzer-wrapper.ts.

## Don't run several TSA instances in parallel

TSA analysis is heavy. Running several TSA instances in parallel will result in poor performance in all of them.

## Running inter-contract analysis

Refer to https://tonsec.dev/docs/inter-contract.

Checking for all possible paths will probably result in path explosion and finding nothing.

A more efficient approach is to find suspicious inter-contract paths and check only them.

In inter-contract analysis, you always have to give an inter-contract communication scheme.
A sample scheme is `bounce-check-schema.json`.

Follow the format. If you run an analysis of N contracts, they have IDs from 1 to N 
(in the order they were passed to the CLI tool). DO NOT use 0 or negative numbers.

The opcodes in inter-contract scheme must me HEX integers, but without "0x" prefix.
Their length must always by 8 digits (that corresponds to 32 bits).

If some messages shouldn't be passed to the analyzed contracts, just don't mention them in communication scheme.

The contract can participate in a chain of contract calls for several times.
If some contract code is supposed to be in a single instance, don't create several contracts with the same code in analysis.

### Sanity check

Check that all opcodes from the message flow are present in the inter-contract communication scheme.

### Don't send messages that do not participate in your inter-contract chain call.

#### Bad

```
[
  {
    "id": 1,
    "inOpcodeToDestination": {
      "00000001": {
        "type": "out_opcodes",
        "outOpcodeToDestination": {
          "00000002": [2]
        }
      }
    }
    "other": {  // this is sending all other messages to contract 2. Don't do this!
      "type": "out_opcodes",
      "outOpcodeToDestination": {},
      "other": [2]
    }
  },
  {
    "id": 2,
    "inOpcodeToDestination": {}
  }
]
```

#### Good

```
[
  {
    "id": 1,
    "inOpcodeToDestination": {
      "00000001": {
        "type": "out_opcodes",
        "outOpcodeToDestination": {
          "00000002": [2]
        }
      }
    }
  },
  {
    "id": 2,
    "inOpcodeToDestination": {}
  }
```

## If analysis was long and nothing was found

Refer to `references/tsa-custom-checkers.md` for suggestions.
