require('dotenv-safe').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
const freeclimbSDK = require('@freeclimb/sdk')

const port = process.env.PORT || 3000
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const authToken = process.env.AUTH_TOKEN
const applicationId = process.env.APPLICATION_ID
const freeclimb = freeclimbSDK(accountId, authToken)


let mainMenuErrCount = 0

app.post('/incomingCall', (req, res) => {
  //  freeclimb.api.calls.create(req.body.from, req.body.to, applicationId).catch(err => {console.log(err) })
  res
    .status(200)
    .json(
      freeclimb.percl.build(
        freeclimb.percl.say('Welcome to the Node IVR Sample app baseline.'),
        freeclimb.percl.pause(100),
        freeclimb.percl.redirect(`${host}/mainMenuPrompt`)
      )
    )
})

app.post('/mainMenuPrompt', (req, res) => {
  res.status(200).json(
    freeclimb.percl.build(
      freeclimb.percl.getSpeech(`${host}/mainMenu`, `${host}/mainMenuGrammar`, {
        grammarType: freeclimb.enums.grammarType.URL,
        grammarRule: "option",
        prompts: [
          freeclimb.percl.say(
            'Say existing or press 1 for existing orders. Say new or press 2 for new orders, or Say operator or press 0 to speak to an operator'
          )
        ]
      })
    )
  )
})

app.get('/mainMenuGrammar', function (req, res) {
  const file = `${__dirname}/mainMenuGrammar.xml`
  res.download(file)
})


app.post('/mainMenu', (req, res) => {
  let menuOpts
  const getSpeechResponse = req.body
  const response = getSpeechResponse.recognitionResult

  if (req.body.reason === freeclimb.enums.getSpeechReason.DIGIT) {
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
        { script: 'Redirecting you to an operator', redirect: `${host}/transfer` }
      ]
    ])
  } else if (req.body.reason === freeclimb.enums.getSpeechReason.RECOGNITION) {
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
        { script: 'Redirecting you to an operator', redirect: `${host}/transfer` }
      ]
    ])
  }

  if ((!response || !menuOpts.get(response)) && mainMenuErrCount < 3) {
    mainMenuErrCount++
    res
      .status(200)
      .json(
        freeclimb.percl.build(
          freeclimb.percl.say('Error, please try again'),
          freeclimb.percl.redirect(`${host}/mainMenuPrompt`)
        )
      )
  } else if (mainMenuErrCount >= 3) {
    mainMenuErrCount = 0
    res
      .status(200)
      .json(
        freeclimb.percl.build(
          freeclimb.percl.say('Max retry limit reached'),
          freeclimb.percl.pause(100),
          freeclimb.percl.redirect(`${host}/endCall`)
        )
      )
  } else {
    mainMenuErrCount = 0
    res
      .status(200)
      .json(
        freeclimb.percl.build(
          freeclimb.percl.say(menuOpts.get(response).script),
          freeclimb.percl.redirect(menuOpts.get(response).redirect)
        )
      )
  }
})

app.post('/transfer', (req, res) => {
  res
    .status(200)
    .json(
      freeclimb.percl.build(
        freeclimb.percl.say('Please wait while we transfer you to an operator'),
        freeclimb.percl.redirect(`${host}/endCall`)
      )
    )
})

app.post('/endCall', (req, res) => {
  res
    .status(200)
    .json(
      freeclimb.percl.build(
        freeclimb.percl.say(
          'Thank you for calling the Node IVR sample app baseline, have a nice day!'
        ),
        freeclimb.percl.hangup()
      )
    )
})

const server = app.listen(port, () => {
  console.log(`Starting server on port ${port}`)
})

module.exports = { app, server }
