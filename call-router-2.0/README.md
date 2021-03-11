# Node IVR Call Router 2.0

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Built Status](https://github.com/FreeClimbAPI/Node-IVR-Sample-Apps/actions/workflows/node-ivr-sample-app-call-router-1.0.yaml/badge.svg)](https://github.com/FreeClimbAPI/Node-IVR-Sample-Apps/actions/workflows/node-ivr-sample-app-call-router-1.0.yaml)
[![Coverage Status](https://coveralls.io/repos/github/FreeClimbAPI/Node-2FA-Tutorial/badge.svg?branch=master)](https://coveralls.io/github/FreeClimbAPI/Node-IVR-Sample-Apps?branch=master)

This project serves as a guide to help you build a basic IVR DTMF and voice-enabled call routing application with FreeClimb.

**View the accompanying IVR Call Routing: DTMF and Voice-Enabled tutorial [here](https://docs.freeclimb.com/docs/ivr-call-routing-10).**

Specifically, the project will:
- Answer an incoming call from the user
- Collect DTMF and/or speech input from the user
- Route the users call based on DTMF and/or speech input

## Requirements
A [FreeClimb account](https://www.freeclimb.com/dashboard/signup/)

A [registered application](https://docs.freeclimb.com/docs/registering-and-configuring-an-application#register-an-app) with a named alias

A [configured FreeClimb number](https://docs.freeclimb.com/docs/getting-and-configuring-a-freeclimb-number) assigned to your application

Tools:
- [Node.js](https://nodejs.org/en/download/) 12.14.0 or later
- [Yarn](https://yarnpkg.com/en/)
- [dotenv-safe](https://www.npmjs.com/package/dotenv-safe)

## Setting up the Sample App

1. Install the required packages

   ```bash
   yarn install
   ```

1. Configure environment variables within the .env file

   | ENV VARIABLE    | DESCRIPTION                                                                                                                                                                                                                               |
   | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | ACCOUNT_ID      | Account ID which can be found under [API Keys](https://www.freeclimb.com/dashboard/portal/account/authentication) in Dashboard                                                                                                            |
    | AUTH_TOKEN      | Authentication Token which can be found under [API Keys](https://www.freeclimb.com/dashboard/portal/account/authentication) in Dashboard                                                                                                  |
    | HOST            | The hostname as defined in your FC application                                                                                                                                                                                            |
    | PORT            | Specifies the port on which the app will run (e.g. PORT=3000 means you would direct your browser to http://localhost:3000).                                                                                                                                                                                              |

## Running the Sample App

```bash
yarn start
```
