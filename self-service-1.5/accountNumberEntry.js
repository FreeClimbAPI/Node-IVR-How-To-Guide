require('dotenv-safe').config()
const express = require('express')
const {
    createConfiguration,
    DefaultApi,
    PerclScript,
    GetSpeech,
    Say,
    Redirect,
    Pause
} = require('@freeclimb/sdk')
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
                new GetSpeech({
                    actionUrl: `${host}/accountNumber`,
                    grammarFile: 'ANY_DIG',
                    grammarType: 'BUILTIN',
                    prompts: [
                        new Say({ text: 'Please enter or say your six digit account number' })
                    ]
                })
            ]
        }).build()
    )
})

router.post('/accountNumber', (req, res) => {
    const getSpeechResponse = req.body
    const input = getSpeechResponse.recognitionResult
    const response = input ? input.replace(/\s+/g, '') : null
    if ((!response || response.length < 6) && acctMenuErrCount < 2) {
        acctMenuErrCount++
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Say({ text: 'Error' }),
                    new Pause({ length: 100 }),
                    new Redirect({ actionUrl: `${host}/accountNumberPrompt` })
                ]
            }).build()
        )
    } else if (acctMenuErrCount >= 2) {
        acctMenuErrCount = 0
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
        acctMenuErrCount = 0
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Redirect({
                        actionUrl: `${host}/confirmAccountNumberPrompt?acct=${response}`
                    })
                ]
            }).build()
        )
    }
})
module.exports = router
