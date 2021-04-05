# Node IVR Call Router: DTMF

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/FreeClimbAPI/Node-IVR-Sample-Apps/actions/workflows/node-ivr-sample-app-call-router-1.0.yaml/badge.svg)](https://github.com/FreeClimbAPI/Node-IVR-Sample-Apps/actions/workflows/node-ivr-sample-app-call-router-1.0.yaml)
[![Coverage Status](https://coveralls.io/repos/github/FreeClimbAPI/Node-2FA-Tutorial/badge.svg?branch=master)](https://coveralls.io/github/FreeClimbAPI/Node-IVR-Sample-Apps?branch=master)

This project serves as a guide to help you build a basic IVR [DTMF](https://en.wikipedia.org/wiki/Dual-tone_multi-frequency_signaling) (e.g. keypad-based) call routing application with [FreeClimb](https://docs.freeclimb.com/docs/how-freeclimb-works).

Specifically, the project will:
-   Answer an incoming call from the user
-   Collect DTMF input from the user
-   Route the users call based on DTMF input

## Tutorial
We offer an [Interactive Voice Response (IVR) tutorial](https://docs.freeclimb.com/docs/two-factor-authentication-tutorial) for more detailed set-up instructions and explanation of how the code in each IVR sample app variation works.

## Requirements
A [FreeClimb account](https://www.freeclimb.com/dashboard/signup/)

A [registered application](https://docs.freeclimb.com/docs/registering-and-configuring-an-application#register-an-app) with a named alias

A [configured FreeClimb number](https://docs.freeclimb.com/docs/getting-and-configuring-a-freeclimb-number) assigned to your application

Tools:
- [Node.js](https://nodejs.org/en/download/) 12.14.0 or higher
- [Yarn](https://yarnpkg.com/en/)
- [ngrok](https://ngrok.com/download) (optional for hosting)

## Setting up the Sample App

1. Install the required packages

    ```bash
    yarn install
    ```

1. Create a .env file and configure the following environment variables within it:

    | ENV VARIABLE    | DESCRIPTION                                                                                                                                                                                                                               |
    | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | ACCOUNT_ID      | Account ID which can be found under [API Keys](https://www.freeclimb.com/dashboard/portal/account/authentication) in dashboard.                                                                                                         |
    | AUTH_TOKEN      | Authentication Token which can be found under [API Keys](https://www.freeclimb.com/dashboard/portal/account/authentication) in dashboard.                                                                                                  |
    | HOST            | The hostname as defined in your FC application. We recommend [ngrok](https://ngrok.com/download) as an option to get up and running quickly.                                                                                                                                                                                            |
    | PORT            | Specifies the port on which the app will run (e.g. PORT=3000 means you would direct your browser to http://localhost:3000).                                                                                                                                                                                              |
    
## Running the Sample App

```bash
yarn start
```

## Feedback & Issues
If you would like to give the team feedback or you encounter a problem, please [contact support](https://www.freeclimb.com/support/) or [submit a ticket](https://freeclimb.com/dashboard/portal/support) in the dashboard.
