# Writing custom checkers

Guide on writing custom checkers: https://tonsec.dev/guides/checkers-2.

Documentation for TSA checker functions: https://tonsec.dev/docs/custom-checkers.

## Using global variables

ALWAYS assign initial values to global variables in `main` method.
Otherwise, they are going to be NULL (which may lead to type errors).

## Sending messages

The first argument of `tsa_send_internal_message` and `tsa_send_external_message` is the contract to send the message to.

If you are running inter-contract analysis, 
make sure this parameter is consistent with the given inter-contract communication scheme.

## What are random addresses

Here is a common pattern for checkers that are run on symbolic contract data:
```
cell c4 = tsa_get_c4(1);
tsa_make_address_random(initial_sender);
tsa_make_slice_independent_from_random_addresses(c4.begin_parse());
tsa_make_slice_independent_from_random_addresses(contract_address);
```

What does this mean?

`tsa_make_address_random` makes the given address a fixed random address that is independent from slices that were annotated with `tsa_make_slice_independent_from_random_addresses`.

Since privileged users are either hard-coded into contract or stored in C4, that means that random addresses are actually always non-privileged users.

For example, in `drain-check` we don't want to report behavior when a contract's owner can withdraw money from it.
This pattern is used to exclude such executions.

## Fetching inter-contract messages

If you are performing inter-contract analysis, you must add the following code:
```
global int message_count;

() on_out_message(cell msg_full, slice msg_body, int receiver_contract_id, int sender_contract_id) {
   tsa_fetch_value(msg_full, message_count * 2);
   tsa_fetch_value(msg_body, message_count * 2 + 1);
   message_count += 1;

   ...
}
```

This way you fetch messages that were passed between analyzed contracts. That allows you to get a better understanding of what was going on.
Especially when this is used with `--exported-inputs` CLI option.

## Avoiding path explosion

If the checker is too general, there are going to be too many paths to explore and TSA won't find anything.

There are several ways to avoid this:
1. Specify opcodes you are analyzing with `tsa_assert`.

2. Avoid unnecessary branching. Especially in handlers that are called several times (like `on_out_message`).
   Keep in mind that if you add some `if` statement in the very beginning of the statement,
   the number of symbolic states doubles.
   For example, instead of:
   ```
   ;; bad
   if (condition1) {
       throw_if(exit_code, condition2);
   }
   ```
   Use:
   ```
   ;; good
   throw_if(exit_code, (condition1) & (condition2));
   ```
   The first variant doubles the number of states, the second doesn't.

3. Get rid of uninteresting states as early as possible.
   Here is an issue that illustrates this approach: https://github.com/espritoxyz/tsa/issues/67.

## Use `tsa_forbid_failures` where possible

If you don't need to analyze bounced messages (that are created as a result of a failure),
call `tsa_send_internal_message` between `tsa_forbid_failures` and `tsa_forbid_failures`.

This way TSA will not fork on runtime exceptions (like integer overflows) which result in better performance.

Make sure when you call checker's `throw_if`, the failures are allowed. 
Otherwise, TSA will throw away executions that reproduce vulnerabilities!
