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

And remember, a user can send ANY message to a contract. Many contracts assume that the message is "correct": it has all the fields, in some special ranges and so on. But the contract MUST CHECK for these things and correctly reject bad messages. Otherwise, a user can send an unexpected message and hack the contract.

## Step 3 - Find the exploit trace in the source code

Use the found by TSA input and follow the execution of the contract on this input line-by-line.

Why following this trace have led to marking it as interesting by TSA?

You MUST complete this step fully before moving to Step 4. Do not skip ahead.

## Step 4 - THE MOST IMPORTANT ONE: Formulate, what exactly caused TSA to be triggered.

DO NOT DISMISS THE FINDING!!!

Where does this finding come from? Can this be reproduced on a blockchain? Before making any more conlusions, dig deep here and make sure you found the right reason.

So, before declaring the finding false-positive, ask yourself again: are you sure about that?

### Mandatory procedure before any false-positive conclusion

You MUST follow these steps in order. Do not skip any.

1. **Identify the root cause in the source code.** Trace the execution line-by-line using the TSA inputs. Find the exact line(s) where the problematic behavior originates (e.g., a missing check, an arithmetic issue, a caught exception that leads to bad state). Write down this root cause explicitly.

2. **Determine which parts of the TSA-generated data are essential to the root cause, and which are incidental.** TSA generates SOME data that triggers the behavior, not the simplest or most realistic. Many fields in the generated C4/message data may be irrelevant to the root cause. For example, if the root cause is a missing validation on a message field, the fact that C4 has unrealistic values elsewhere does not matter.

3. **Only AFTER completing steps 1-2, ask: does the root cause require unrealistic data?** Check whether the specific fields that are essential to the root cause can have realistic values. If the root cause works with any value of a field that happens to be unrealistic in the TSA output, the finding is NOT a false positive.

A common mistake: seeing that some C4 value is unrealistic and immediately concluding false-positive, without checking whether that value is actually relevant to the exploit. The unrealistic value might be a side effect of TSA's symbolic engine, while the real vulnerability works with completely normal data.

## Checklist

### Deciding whether the finding is false positive

#### Bad reasoning

The generated data cannot be achieved on the Blockchain, it is unrealistic (values are too big, C4 is not full, some values are invalid...). This is why this is false-positive.

This is bad because you have not identified whether those unrealistic values are actually necessary for the exploit. TSA picks SOME satisfying input, not the most realistic one. The same bug might be triggerable with completely realistic inputs.

#### Good reasoning

1. I traced the execution line-by-line and identified the root cause at [specific location in source code].
2. The root cause depends on [specific conditions].
3. I verified that ALL of those specific conditions require data that cannot exist on the blockchain because [concrete reason].
4. I also tried adding constraints in the checker to force more realistic data and TSA found nothing.

Only then can you mark a finding as false-positive.
