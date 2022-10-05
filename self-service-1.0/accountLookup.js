require('dotenv-safe').config()
const express = require('express')
const {
  createConfiguration,
  DefaultApi,
  PerclScript,
  Say,
  Pause,
  Redirect,
  GetDigits
} = require('@freeclimb/sdk')
const accounts = require('./accounts')
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const apiKey = process.env.API_KEY
const freeclimb = new DefaultApi(createConfiguration({ accountId, apiKey }))

router = express.Router()
let retries = 0

router.post('/accountLookup', (req, res) => {
  if (!accounts.get(req.param('acct')) && retries < 2) {
    retries++
    res.status(200).json(
      new PerclScript({
        commands: [
          new Say({ text: 'Sorry, we couldnt find that account number.' }),
          new Redirect({ actionUrl: `${host}/accountNumberPrompt` })
        ]
      }).build()
    )
  } else if (retries >= 2) {
    retries = 0
    res.status(200).json(
      new PerclScript({
        commands: [
          new Say({
            text:
              'Max retry limit reached, please wait while we connect you to an operator'
          }),
          new Pause({ length: 100 }),
          new Redirect({ actionUrl: `${host}/transfer` })
        ]
      }).build()
    )
  } else {
    res.status(200).json(
      new PerclScript({
        commands: [
          new Redirect({
            actionUrl: `${host}/accountRead?acct=${req.param('acct')}`
          })
        ]
      }).build()
    )
  }
})

module.exports = router
