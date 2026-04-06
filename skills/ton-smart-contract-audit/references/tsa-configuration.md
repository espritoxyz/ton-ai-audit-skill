# TSA configuration

A TSA CLI tool should already be installed.

To get the needed paths, run:
```
npx tsa-installer location
```

You will get JSON with the required paths:
```
{
  "location": "<PATH TO tsa-cli.jar>",
  "java": "<PATH TO JAVA FOR TSA>",
  "fiftstdlib": "<PATH TO FIFTSTDLIB",
  "func_imports": "<PATH TO FUNC HEADERS>",
  "installed": true
}
```

You will need `fiftstdlib` path for TSA CLI option `--fift-std`.

To write custom checkers, you are going to need FunC header with TSA functions. It is here:
```
<PATH TO FUNC HEADERS>/tsa_functions.fc
```

There is also a FunC header with FunC standard library:
```
<PATH TO FUNC HEADERS>/stdlib.fc
```

Place all your custom checkers in a directory `tsa-analysis` in the project.

To run TSA:
```
<JAVA FOR TSA> -jar <PATH TO tsa-cli.jar> custom-checker
```
