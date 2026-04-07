# Choosing the correct entry point for inter-contract analysis

**Critical rule**: The initial message in the checker is sent from a **random, non-privileged address**. This means the entry contract must accept the entry opcode **from arbitrary senders** -- i.e., the handler for that opcode must NOT check `sender_address` against any stored or computed address.

Before writing a checker:

1. **For each contract, classify its opcodes** into two categories:
   - **Open**: No sender address check before processing (anyone can call)
   - **Restricted**: Checks sender against a stored/computed address (e.g., `equal_slice_bits(sender_address, storage::some_address)` or verifying sender matches `calc_address(calc_*_state_init(...))`)

2. **Only open opcodes can be entry points** for inter-contract analysis. Restricted opcodes will just fail the auth check when called from TSA's random sender.

3. **For routed messages between analyzed contracts** (hop 1+), TSA correctly sets the sender to the sending contract's address. So restricted opcodes CAN appear as intermediate hops -- the address-based auth between contracts in the scheme will be satisfied.

## Common mistake: confusing user action with contract entry point

Users often interact with a system through a chain of contracts (e.g., user -> contract A -> contract B -> contract C). The message that reaches contract B comes from contract A, not from the user. If contract B checks that the sender is contract A, you cannot use that message as the entry point. Instead, start from the contract the user actually sends to directly, and only if that contract accepts the message without sender auth.
