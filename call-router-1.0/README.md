# Node IVR Call Router 1.0

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Built Status](https://github.com/FreeClimbAPI/Node-IVR-Sample-Apps/actions/workflows/node-ivr-sample-app-call-router-1.0.yaml/badge.svg)](https://github.com/FreeClimbAPI/Node-IVR-Sample-Apps/actions/workflows/node-ivr-sample-app-call-router-1.0.yaml)
[![Coverage Status](https://coveralls.io/repos/github/FreeClimbAPI/Node-2FA-Tutorial/badge.svg?branch=master)](https://coveralls.io/github/FreeClimbAPI/Node-IVR-Sample-Apps?branch=master)

This project serves as a guide to help you build an application with FreeClimb. View this tutorial on (tutorial coming soon).  
Specifically, the project will:

-   Answer An incoming call from the user
-   Collect DTMF input from the user
-   Route the users call to based in DTMF input

## Setting up your new app within your FreeClimb account

To get started using a FreeClimb account, follow the instructions [here](https://docs.freeclimb.com/docs/getting-started-with-freeclimb).

## Setting up the Tutorial

1. Install the required packages

    ```bash
    yarn install
    ```

1. Configure environment variables within the .env file

    | ENV VARIABLE    | DESCRIPTION                                                                                                                                                                                                                               |
    | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | HOST            | The hostname as defined in your FC application                                                                                                                                                                                            |
    | PORT            | The port your application is running on                                                                                                                                                                                                   |
    | ACCOUNT_ID      | Account ID which can be found under [API Keys](https://www.freeclimb.com/dashboard/portal/account/authentication) in Dashboard                                                                                                            |
    | AUTH_TOKEN      | Authentication Token which can be found under [API Keys](https://www.freeclimb.com/dashboard/portal/account/authentication) in Dashboard                                                                                                  |
    | APPLICATION_ID  | The application id as defined in the FC dashboard                                                                                                                                                                                         |

## Running the Tutorial

```bash
yarn start
```
