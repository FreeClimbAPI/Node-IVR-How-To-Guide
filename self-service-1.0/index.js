require('dotenv-safe').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const freeclimbSDK = require('@freeclimb/sdk')

const port = process.env.PORT || 3000
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const apiKey = process.env.API_KEY
const freeclimb = freeclimbSDK(accountId, apiKey)
const mainMenuRoutes = require('./mainMenu')
const accountNumberEntryRoutes = require('./accountNumberEntry')
const accountNumberConfirmationRoutes = require('./accountNumberConfirmation')
const accountLookupRoutes = require('./accountLookup')
const accountReadRoutes = require('./accountRead')

app.use('/', mainMenuRoutes)
app.use('/', accountNumberEntryRoutes)
app.use('/', accountNumberConfirmationRoutes)
app.use('/', accountLookupRoutes)
app.use('/', accountReadRoutes)

app.post('/incomingCall', (req, res) => {
  res
    .status(200)
    .json(
      freeclimb.percl.build(
        freeclimb.percl.say('Welcome to the Node self service IVR.'),
        freeclimb.percl.pause(100),
        freeclimb.percl.redirect(`${host}/mainMenuPrompt`)
      )
    )
})

app.post('/transfer', (req, res) => {
  res
    .status(200)
    .json(
      freeclimb.percl.build(
        freeclimb.percl.say('there are no operators available at this time'),
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
          'Thank you for calling the Node self service IVR , have a nice day!'
        ),
        freeclimb.percl.hangup()
      )
    )
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Starting server on port ${port}`)
  })
}

module.exports = { app }
