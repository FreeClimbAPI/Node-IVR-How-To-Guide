// import dependencies and set up express server
require('dotenv-safe').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const { createConfiguration, DefaultApi, Say, Pause, Redirect, PerclScript, GetDigits, Hangup } = require('@freeclimb/sdk')

// global variables
const port = process.env.PORT || 3000
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const apiKey = process.env.API_KEY
const freeclimbAPI = new DefaultApi(createConfiguration({
    accountId,
    apiKey
}))

// set error counter to zero
let mainMenuErrCount = 0

// handle an incoming call
app.post('/incomingCall', (req, res) => {
    const percl = new PerclScript({
        commands: [
            new Say({ text: 'Welcome to the Node IVR Sample app baseline.' }),
            new Pause({ length: 100 }),
            new Redirect({ actionUrl: `${host}/mainMenuPrompt` })
        ]
    })
    res.status(200).json(percl.build())
})

// collect digits via a main menu
app.post('/mainMenuPrompt', (req, res) => {
    const percl = new PerclScript({
        commands: [
            new GetDigits({
                actionUrl: `${host}/mainMenu`,
                prompts: [
                    new Say({
                        text: 'Press 1 for existing orders, 2 for new orders, or 0 to speak to an operator'
                    })
                ],

                maxDigits: 1,
                minDigits: 1,
                flushBuffer: true
            })
        ]
    })
    res.status(200).json(percl.build())
})

// logic for main menu and handling user input
app.post('/mainMenu', (req, res) => {
    const getDigitsResponse = req.body
    const digits = getDigitsResponse.digits
    const menuOpts = new Map([
        [
            '1',
            {
                script: 'Redirecting your call to existing orders.',
                redirect: `${host}/endCall`
            }
        ],
        [
            '2',
            {
                script: 'Redirecting your call to new orders.',
                redirect: `${host}/endCall`
            }
        ],
        ['0', { script: 'Redirecting you to an operator', redirect: `${host}/transfer` }]
    ])
    if ((!digits || !menuOpts.get(digits)) && mainMenuErrCount < 3) {
        // error counting keeps bad actors from cycling within your applications
        mainMenuErrCount++
        const percl = new PerclScript({
            commands: [
                new Say({ text: 'Error, please try again' }),
                new Redirect({ actionUrl: `${host}/mainMenuPrompt` })
            ]
        })
        res.status(200).json(percl.build())
    } else if (mainMenuErrCount >= 3) {
        // we recommend giving your customers 3 tries before ending the call
        mainMenuErrCount = 0
        const percl = new PerclScript({
            commands: [
                new Say({ text: 'Max retry limit reached' }),
                new Pause({ length: 100 }),
                new Redirect({ actionUrl: `${host}/endCall` })
            ]
        })
        res.status(200).json(percl.build())
    } else {
        mainMenuErrCount = 0
        const percl = new PerclScript({
            commands: [
                new Say({ text: menuOpts.get(digits).script }),
                new Redirect({ actionUrl: menuOpts.get(digits).redirect })
            ]
        })
        res.status(200).json(percl.build())
    }
})

// transfer call to an operator or other department
app.post('/transfer', (req, res) => {
    const percl = new PerclScript({
        commands: [
            new Say({ text: 'Please wait while we transfer you to an operator' }),
            new Redirect({ actionUrl: `${host}/endCall` })
        ]
    })
    res.status(200).json(percl.build())
})

// end call
app.post('/endCall', (req, res) => {
    const percl = new PerclScript({
        commands: [
            new Say({ text: 'Thank you for calling the Node IVR sample app baseline, have a nice day!' }),
            new Hangup({})
        ]
    })
    res.status(200).json(percl.build())
})

// start the server
const server = app.listen(port, () => {
    console.log(`Starting server on port ${port}`)
})

module.exports = { app, server }
