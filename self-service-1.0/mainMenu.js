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

let mainMenuErrCount = 0

router.post('/mainMenuPrompt', (req, res) => {
  res.status(200).json(
    new PerclScript({
      commands: [
        new GetDigits({
          actionUrl: `${host}/mainMenu`,
          prompts: [
            new Say({
              text:
                'Press 1 for existing orders, 2 for new orders, or 0 to speak to an operator'
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

router.post('/mainMenu', (req, res) => {
  const getDigitsResponse = req.body
  const digits = getDigitsResponse.digits
  const menuOpts = new Map([
    [
      '1',
      {
        script: 'Redirecting your call to existing orders.',
        redirect: `${host}/accountNumberPrompt`
      }
    ],
    [
      '2',
      {
        script: 'Redirecting your call to new orders.',
        redirect: `${host}/transfer`
      }
    ],
    [
      '0',
      { script: 'Redirecting you to an operator', redirect: `${host}/transfer` }
    ]
  ])
  if ((!digits || !menuOpts.get(digits)) && mainMenuErrCount < 3) {
    mainMenuErrCount++
    res.status(200).json(
      new PerclScript({
        commands: [
          new Say({ text: 'Error, please try again' }),
          new Redirect({ actionUrl: `${host}/mainMenuPrompt` })
        ]
      }).build()
    )
  } else if (mainMenuErrCount >= 3) {
    mainMenuErrCount = 0
    res.status(200).json(
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
