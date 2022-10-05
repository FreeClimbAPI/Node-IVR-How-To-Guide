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
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const apiKey = process.env.API_KEY
const freeclimb = new DefaultApi(createConfiguration({ accountId, apiKey }))

router = express.Router()

let confirmNumberErrCount = 0
let retries = 0

router.post('/confirmAccountNumberPrompt', (req, res) => {
  res.status(200).json(
    new PerclScript({
      commands: [
        new GetDigits({
          actionUrl: `${host}/confirmAccountNumber?acct=${req.param('acct')}`,
          prompts: [
            new Say({
              text: `You entered ${req.param(
                'acct'
              )} is that correct? Press 1 to confirm your account number or 2 to try again`
            })
          ],
          maxDigits: 1,
          minDigits: 1,
          flushBuffer: true
        })
      ]
    }).build()
  )
})

router.post('/confirmAccountNumber', (req, res) => {
  const getDigitsResponse = req.body
  const digits = getDigitsResponse.digits
  const menuOpts = new Map([
    [
      '1',
      {
        script: 'proceeding to account number lookup.',
        redirect: `${host}/accountLookup?acct=${req.param('acct')}`
      }
    ],
    [
      '2',
      {
        script: 'Ok',
        redirect: `${host}/accountNumberPrompt`
      }
    ],
    [
      '0',
      { script: 'Redirecting you to an operator', redirect: `${host}/transfer` }
    ]
  ])
  if ((!digits || !menuOpts.get(digits)) && confirmNumberErrCount < 3) {
    confirmNumberErrCount++
    res.status(200).json(
      new PerclScript({
        commands: [
          new Say({ text: 'Error' }),
          new Redirect({
            actionUrl: `${host}/confirmAccountNumberPrompt?acct=${req.param(
              'acct'
            )}`
          })
        ]
      }).build()
    )
  } else if (confirmNumberErrCount >= 3 || retries >= 2) {
    confirmNumberErrCount = 0
    res.status(200).json(
      new PerclScript({
        commands: [
          new Say({ text: 'Please wait while we connect you to an operator' }),
          new Pause({ length: 100 }),
          new Redirect({ actionUrl: `${host}/transfer` })
        ]
      }).build()
    )
  } else {
    confirmNumberErrCount = 0
    if (digits === '2') {
      retries++ // retries tracked separately from input errors
    } else if (digits === '1') {
      retries = 0
    }
    res.status(200).json(
      new PerclScript({
        commands: [
          new Say({ text: menuOpts.get(digits).script }),
          new Redirect({ actionUrl: menuOpts.get(digits).redirect })
        ]
      }).build()
    )
  }
})

module.exports = router
