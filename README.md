# n-pa11y-tools [![CircleCI](https://circleci.com/gh/Financial-Times/n-pa11y-tools.svg?style=svg&circle-token=33bcf2eb98fe2e875cc66de93d7e4a50369c952d)](https://circleci.com/gh/Financial-Times/n-pa11y-tools)

This component is a CLI tool for running a pre configured Pa11y CI on your project.

## Requirements

- Node version defined by `engines.node` in `package.json`. Run command `nvm use` to switch your local Node version to the one specified in `.nvmrc`.

## Devlopment

```sh
git clone git@github.com:Financial-Times/n-pa11y-config.git
cd n-pa11y-config
npm install
```

## Installation

### Install from NPM

```sh
npm install --save-dev @financial-times/n-pa11y-tools
```

### Usage

```sh
Usage: n-pa11y-config [command]

Commands:
  run [file] [options]             runs Pa11y CI on the tests specified in the file provided

```

### Run Pa11y

```sh
Usage: run [file] [options]

Runs Pa11y CI on the tests specified in the file provided.

Options:
  -o, --host <host>                              Base RUL to apply to all test routes
  -w, --wait <wait>                              The time to wait before running tests in milliseconds
  -e, --exceptions <exceptions>                  Routes returning 200 that should not be tested
  -i, --hide <hide>                              CSS selector to hide elements from testing, selectors can be comma separated
  -h, --headers <headers>                        Headers to be added to every test route. This is a comma separated key value list (key1=value1,key2=value2)
  -v, --viewports <viewports>                    Set viewports for puppeteer (`w1024h768,w375h667`)
  -s, --screen-capture-path <screenCapturePath>  Path where to store all the screenshots generated by Pa11y (default: `/pa11y_screenCapture`)
```

### Example

For example to deploy to a given project, you would use the following command:

```sh
	n-pa11y-config ./test/smoke.js -h https://(REVIEW_APP_FILE}.herokuapp.com
```
