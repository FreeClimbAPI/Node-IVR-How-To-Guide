require('dotenv-safe').config()
const express = require('express')
const freeclimbSDK = require('@freeclimb/sdk')
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const authToken = process.env.AUTH_TOKEN
const freeclimb = freeclimbSDK(accountId, authToken)

router = express.Router()
let acctMenuErrCount = 0

router.post('/accountNumberPrompt', (req, res) => {
  res.status(200).json(
    freeclimb.percl.build(
      freeclimb.percl.getDigits(`${host}/accountNumber`, {
        prompts: [freeclimb.percl.say('Please Enter your account number')],
        maxDigits: 6,
        minDigits: 1,
        flushBuffer: true
      })
    )
  )
})

router.post('/accountNumber', (req, res) => {
  const getDigitsResponse = req.body
  const digits = getDigitsResponse.digits
  if (!digits && acctMenuErrCount < 3) {
    acctMenuErrCount++
    res
      .status(200)
      .json(
        freeclimb.percl.build(
          freeclimb.percl.say(
            'Error, please enter your six digit account number or press 0 to speak with an operator'
          ),
          freeclimb.percl.pause(100),
          freeclimb.percl.redirect(`${host}/accountNumberPrompt`)
        )
      )
  } else if (acctMenuErrCount >= 2) {
    acctMenuErrCount = 0
    res
      .status(200)
      .json(
        freeclimb.percl.build(
          freeclimb.percl.say(
            'Max retry limit reached, please wait while we connect you to an operator'
          ),
          freeclimb.percl.pause(100),
          freeclimb.percl.redirect(`${host}/transfer`)
        )
      )
  } else {
    acctMenuErrCount = 0
    res
      .status(200)
      .json(
        freeclimb.percl.build(
          freeclimb.percl.redirect(
            `${host}/confirmAccountNumberPrompt?acct=${digits}`
          )
        )
      )
  }
})
module.exports = router
