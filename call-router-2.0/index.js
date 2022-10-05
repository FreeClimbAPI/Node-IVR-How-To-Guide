// import dependencies and set up express server
require('dotenv-safe').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const { createConfiguration, DefaultApi, PerclScript, Say, Pause, Redirect, GetSpeech, Hangup } = require('@freeclimb/sdk')

// global variables
const port = process.env.PORT || 3000
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const apiKey = process.env.API_KEY
const freeclimb = new DefaultApi(createConfiguration({ accountId, apiKey }))

// set error counter to zero
let mainMenuErrCount = 0

// handle an incoming call
app.post('/incomingCall', (req, res) => {
  res
    .status(200)
    .json(
      new PerclScript({
        commands: [
          new Say({ text: 'Welcome to the Node IVR Sample app baseline.' }),
          new Pause({ length: 100 }),
          new Redirect({ actionUrl: `${host}/mainMenuPrompt` })
        ]
      }).build()
    )
})

// collect voice and/or dtmf input from the user to direct them to their next destination
app.post('/mainMenuPrompt', (req, res) => {
  res.status(200).json(
    new PerclScript({
      commands: [
        new GetSpeech({
          actionUrl: `${host}/mainMenu`,
          grammarFile: `${host}/mainMenuGrammar`,
          grammarType: 'URL',
          grammarRule: 'option',
          prompts: [
            new Say({
              text: 'Say existing or press 1 for existing orders. Say new or press 2 for new orders, or Say operator or press 0 to speak to an operator'
            })
          ]
        })
      ]
    }).build()
  )
})

// load grammar file for recognizing speech input
app.get('/mainMenuGrammar', function (req, res) {
  const file = `${__dirname}/mainMenuGrammar.xml`
  res.download(file)
})

// logic for main menu and handling user input
app.post('/mainMenu', (req, res) => {
  let menuOpts
  const getSpeechResponse = req.body
  const response = getSpeechResponse.recognitionResult

  if (req.body.reason === 'digit') {
    menuOpts = new Map([
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
      [
        '0',
        {
          script: 'Redirecting you to an operator',
          redirect: `${host}/transfer`
        }
      ]
    ])
  } else if (req.body.reason === 'recognition') {
    menuOpts = new Map([
      [
        'EXISTING',
        {
          script: 'Redirecting your call to existing orders.',
          redirect: `${host}/endCall`
        }
      ],
      [
        'NEW',
        {
          script: 'Redirecting your call to new orders.',
          redirect: `${host}/endCall`
        }
      ],
      [
        'OPERATOR',
        {
          script: 'Redirecting you to an operator',
          redirect: `${host}/transfer`
        }
      ]
    ])
  }

  if ((!response || !menuOpts.get(response)) && mainMenuErrCount < 3) {
    // error counting keeps bad actors from cycling within your applications
    mainMenuErrCount++
    res
      .status(200)
      .json(
        new PerclScript({
          commands: [
            new Say({ text: 'Error, please try again' }),
            new Redirect({ actionUrl: `${host}/mainMenuPrompt` })
          ]
        }).build()
      )
  } else if (mainMenuErrCount >= 3) {
    // we recommend giving your customers 3 tries before ending the call
    mainMenuErrCount = 0
    res
      .status(200)
      .json(
        new PerclScript({
          commands: [
            new Say({ text: 'Max retry limit reached' }),
            new Pause({ length: 100 }),
            new Redirect({ actionUrl: `${host}/endCall` })
          ]
        }).build()
      )
  } else {
    mainMenuErrCount = 0
    res
      .status(200)
      .json(
        new PerclScript({
          commands: [
            new Say({ text: menuOpts.get(response).script }),
            new Redirect({ actionUrl: menuOpts.get(response).redirect })
          ]
        }).build()
      )
  }
})

// transfer call to an operator or other department
app.post('/transfer', (req, res) => {
  res
    .status(200)
    .json(
      new PerclScript({
        commands: [
          new Say({ text: 'Please wait while we transfer you to an operator' }),
          new Redirect({ actionUrl: `${host}/endCall` })
        ]
      }).build()
    )
})

// end call
app.post('/endCall', (req, res) => {
  res
    .status(200)
    .json(
      new PerclScript({
        commands: [
          new Say({ text: 'Thank you for calling the Node IVR sample app baseline, have a nice day!' }),
          new Hangup({})
        ]
      }).build()
    )
})

// start the server
const server = app.listen(port, () => {
  console.log(`Starting server on port ${port}`)
})

module.exports = { app, server }
