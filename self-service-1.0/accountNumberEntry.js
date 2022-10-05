require('dotenv-safe').config()
const express = require('express')
const { createConfiguration, DefaultApi, PerclScript, Say, Pause, Redirect, GetDigits } = require('@freeclimb/sdk')
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const apiKey = process.env.API_KEY
const freeclimb = new DefaultApi(createConfiguration({ accountId, apiKey }))

router = express.Router()
let acctMenuErrCount = 0

router.post('/accountNumberPrompt', (req, res) => {
  res.status(200).json(
    new PerclScript({
      commands: [

        new GetDigits({
          actionUrl: `${host}/accountNumber`,
          prompts: [
            new Say({ text: 'Please Enter your account number' })
          ],
          maxDigits: 6,
          minDigits: 1,
          flushBuffer: true
        })
      ]
    }).build()
  )
})

router.post('/accountNumber', (req, res) => {
  const getDigitsResponse = req.body
  const digits = getDigitsResponse.digits
  if ((!digits || digits.length < 6) && acctMenuErrCount < 2) {
    acctMenuErrCount++
    res
      .status(200)
      .json(
        new PerclScript({
          commands: [
            new Say({ text: 'Error, please enter your six digit account number or press 0 to speak with an operator' }),
            new Pause({ length: 100 }),
            new Redirect({ actionUrl: `${host}/accountNumberPrompt` })
          ]
        }).build()
      )
  } else if (acctMenuErrCount >= 2) {
    acctMenuErrCount = 0
    res
      .status(200)
      .json(
        new PerclScript({
          commands: [
            new Say({ text: 'Max retry limit reached, please wait while we connect you to an operator' }),
            new Pause({ length: 100 }),
            new Redirect({ actionUrl: `${host}/transfer` })
          ]
        }).build()
      )
  } else {
    acctMenuErrCount = 0
    res
      .status(200)
      .json(
        new PerclScript({
          commands: [
            new Redirect({ actionUrl: `${host}/confirmAccountNumberPrompt?acct=${digits}` })
          ]
        }).build()
      )
  }
})
module.exports = router
