# Structure of the files generated in the directory specified with `--exported-inputs` TSA CLI option

TSA can export inputs in a more human-readable format with `--exported-inputs` option. Is should be investigated together with the generated SARIF report.

Structure of the inputs directory:
```
execution_N/
  c4_0/
     ...
     cell-types.yaml
  c4_1/
     ...
     cell-types.yaml
  msgBody_0/
     ...
     cell-types.yaml
  fetched_0/
     ...
     cell-types.html
```

## What this structure means

### Directories `execution_*`

In a SARIF report you get information about several executions. Those are the contents of `results` array in SARIF report.

If an execution has index 0 in `results` array, then the corresponding directory is `execution_0`.

Most of the times you will be intested in `execution_N`, where `N` is the biggest available value.

### Directories `c4_*`

When you run TSA analysis, each analysed contract gets an ID.

If you are running TSA in custom-checker mode, then the checker has ID `0`.

The first listed in CLI arguments argument has ID `1`, the second - `2` and so on.

Directory `c4_N` contains found persistent data of a contract with ID `N`. Most of the times you will be interested in `c4_1`.

### Directories `msgBody_*`

In checker, when you use functions `tsa_send_internal_message` or `tsa_send_external_message` you must specify ID of the generated contract input.
This the last arguments of these functions, most of the times it is 0.

Direcory `msgBody_N` contains message body of the generated message with id `N`.
Most of the times you will be interested in `msgBosy_0`.

### Directories `fetched_*`

Those are values that you fetched with `tsa_fetch_value` function in the checker. They can also be found in SARIF report.

In `tsa_fetch_value` you specify is of the fetched value (the last argument). This is the number in directory name.

Directories `fetched_N` are generated only for fetched cells and some slices 
(whether directory for a slice is generated or not depends on its internal representation in TSA).

If you want to fetch integers, you can look them up directly in the SARIF report.
