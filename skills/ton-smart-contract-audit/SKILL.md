---
name: "ton-smart-contract-audit"
schemaVersion: "v0.1"
description: "Check TON project with smart contracts for vulnerabilities; perform an audit of TON smart contracts"
used-by:
 - "Agent"
---

# Perform an audit of TON smart contract project

Follow the recommendations in this skill precisely.

## Instructions

### Step 0: Make sure TSA is installed

To check, run the following command:
```
npx tsa-installer install
```

For that to work, `tsa-installer` must already be installed.

To install `tsa-installer`, run:
```
npm install tsa-installer
```

To interpret output of the first command, refer to `references/tsa-configuration.md`

### Step 1: Learn how to run existing tests and add new ones

This will be needed in the next steps.

If you cannot figure this out yourself, ask the user for help BEFORE starting the audit process.

If this is a Blueprint project (most likely), tests should be run with:
```
yarn/npx blueprint test
```

Or:
```
yarn/npx test
```

### Step 2: List the Vulnerabilities To Check For

Refer to `references/vulnerabilities.md`.

### Step 3: Check If the Vulnerability Is Present Manually

Analyze the source code of smart contracts to see if a vulnerability is present.

### Step 4: Validate ALL the Found Vulnerabilities

Refer to `references/validation.md`.

### Step 5: Use TSA to find more complicated vulnerabilities

Refer to `references/tsa-analysis.md`.

Do not forget validating inter-contract paths, those are usually the most interesting findings!

Do not forget to write checkers for verifying custom properties, standard checkers do not cover everything.

### Step 6: Again, before reporting issues, make sure the behavior is real and not intended

Refer to `references/validation.md`.

### Step 7: Report the Result

Report the validated vulnerabilities. Use severity levels.

Standard checkers in TSA find something rarely, and if they do, the severity of the issues is very high.

Do not divide findings from manual analysis and TSA analysis, give one list.

Create a Markdown file with the report. Do not forget to include links to tests with the proofs!

## Notes

Do not stop the audit process and provide an intermediate report before you checked everything.
