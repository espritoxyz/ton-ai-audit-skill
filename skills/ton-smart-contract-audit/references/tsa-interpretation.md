# How to interpret TSA findings

First, read [this tutorial](https://tonsec.dev/guides/checkers-1) to get familiar with the format.

## Step 1: Find execution in SARIF report with an interesting error description

In most cases, this is `"TvmFailure(exit=TVM user defined error with exit code 1000, phase=COMPUTE_PHASE)"`.

That means that this execution found inputs that reproduce behavior that was asserted with exit code 1000 in the checker.

## Step 2: Look into reproducing inputs

There 2 ways to get the exact input:

1. In SARIF: Look under `"properties" → "additionalInputs"` of the interesting execution. Usually the needed input has id "0". This is specified in `tsa_send_internal_message` call (the last argument).

2. Use `--exported-inputs` CLI option. This way contract persistent data, message body and explicitly fetched values are extracted in several formats.
   The most useful one is `cell-types.yaml`.
   Raw data is just a bunch of bits that is hard to understand. In `cell-types.yaml` you are given the parsed variant.
   The types there are inferred based on operations that were performed on the data.
   To undersand better the structure of the generated directory, refer to `references/tsa-exported-inputs-structure.md`.

IMPORTANT: for each element in `cell-typed.yaml`, find out what they mean. For example, the first 32 bits of the message body is probably the performed operation opcode. Addresses might be owner addresses, transfer destinations, token addresses and so on. DON'T LEAVE ANY FIELDS UNINSPECTED, UNDERSTAND THEM ALL.

**To prove that you did this**: modify ALL `cell-types.yaml` files. Add comments for each element with information about what they mean in terms of contract sources.

Find patterns in these inputs that led to the problem. Which part is the most important one? What unusual patterns do you see?

**If you fetched messages that were sent between analyzed contract, find where exactly everything went wrong (on which contract, which opcode handler).**

TSA finds SOME data that reproduces the input, not the most realistic one. That doesn't mean that no realistic input reproduces this behavior.

Once you confirmed the finding in an ordinary sandbox test, you can try to modify the inputs to be more realistic. Or, alternatively, add assrtions in the checker to find more realistic input. Or run the analysis with concrete persistent data (which is actually faster than the analysis with symbolic persistent data).

And remember, a user can send ANY message to a contract.

Many contracts assume that the message is "correct": it has all the fields, in some special ranges and so on. But the contract MUST CHECK for these things and correctly reject bad messages. Otherwise, a user can send an unexpected message and hack the contract.

## Step 3 - Find the exploit trace in the source code

Use the found by TSA input and follow the execution of the contract on this input line-by-line.

Why following this trace have led to marking it as interesting by TSA?

## Step 4 - THE MOST IMPORTANT ONE: Formulate, what exactly caused TSA to be triggered.

DO NOT DISMISS THE FINDING!!!

Where does this finding come from? Can this be reproduced on a blockchain? Before making any more conlusions, dig deep here and make sure you found the right reason.

So, before declaring the finding false-positive, ask yourself again: are you sure about that?

**Bad reasoning**: The generated data is unrealistic, this is why this is false-positive.

**Good reasoning**: Before concluding the finding is not reproducable on more realistic data, actually check it. If this is unclear just by manual inspection, add contraints in the checker to make data more realistic. Mark the finding as false-positive only when you are 100% sure.
