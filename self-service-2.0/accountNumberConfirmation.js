require('dotenv-safe').config()
const express = require('express')
const {
    createConfiguration,
    DefaultApi,
    PerclScript,
    GetSpeech,
    Redirect,
    Pause,
    Play,
    Say,
    Hangup
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
                new GetSpeech({
                    actionUrl: `${host}/confirmAccountNumber?acct=${req.param('acct')}`,
                    grammarFile: `${host}/accountNumberConfirmationGrammar`,
                    grammarType: 'URL',
                    grammarRule: 'option',
                    prompts: [
                        new Say({
                            text: `You entered ${req.param(
                                'acct'
                            )} is that correct? Press 1 or say yes to confirm your account number or press 2 or say no to try again`
                        })
                    ]
                })
            ]
        }).build()
    )
})

router.post('/confirmAccountNumber', (req, res) => {
    const getSpeechResponse = req.body
    const response = getSpeechResponse.recognitionResult
    let menuOpts
    if (req.body.reason === 'digit') {
        menuOpts = new Map([
            [
                '1',
                {
                    audioUrl: `${host}/accountNumberConfirmationAudio?audio=proceed.wav`,
                    redirect: `${host}/accountLookup?acct=${req.param('acct')}`
                }
            ],
            [
                '2',
                {
                    audioUrl: `${host}/accountNumberConfirmationAudio?audio=retry.wav`,
                    redirect: `${host}/accountNumberPrompt`
                }
            ],
            [
                '0',
                {
                    audioUrl: `${host}/accountNumberConfirmationAudio?audio=operator.wav`,
                    redirect: `${host}/transfer`
                }
            ]
        ])
    } else if (req.body.reason === 'recognition') {
        menuOpts = new Map([
            [
                'YES',
                {
                    audioUrl: `${host}/accountNumberConfirmationAudio?audio=proceed.wav`,
                    redirect: `${host}/accountLookup?acct=${req.param('acct')}`
                }
            ],
            [
                'NO',
                {
                    audioUrl: `${host}/accountNumberConfirmationAudio?audio=retry.wav`,
                    redirect: `${host}/accountNumberPrompt`
                }
            ],
            [
                'OPERATOR',
                {
                    audioUrl: `${host}/accountNumberConfirmationAudio?audio=operator.wav`,
                    redirect: `${host}/transfer`
                }
            ]
        ])
    }

    if ((!response || !menuOpts.get(response)) && confirmNumberErrCount < 3) {
        confirmNumberErrCount++
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Play({
                        file: `${host}/accountNumberConfirmationAudio?audio=shortError.wav`
                    }),
                    new Redirect({
                        actionUrl: `${host}/confirmAccountNumberPrompt?acct=${req.param('acct')}`
                    })
                ]
            }).build()
        )
    } else if (confirmNumberErrCount >= 3 || retries >= 2) {
        confirmNumberErrCount = 0
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Play({ file: `${host}/accountNumberConfirmationAudio?audio=operator.wav` }),
                    new Pause({ length: 100 }),
                    new Redirect({ actionUrl: `${host}/transfer` })
                ]
            }).build()
        )
    } else {
        confirmNumberErrCount = 0
        if (response === '2' || response === 'NO') {
            retries++ // retries tracked separately from input errors
        } else if (response === '1' || response === 'YES') {
            retries = 0
        }
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Play({ file: menuOpts.get(response).audioUrl }),
                    new Redirect({ actionUrl: menuOpts.get(response).redirect })
                ]
            }).build()
        )
    }
})

router.get('/accountNumberConfirmationGrammar', function (req, res) {
    const file = `${__dirname}/accountNumberConfirmationGrammar.xml`
    res.download(file)
})

router.get('/accountNumberConfirmationAudio', function (req, res) {
    const file = `${__dirname}/audioFiles/accountNumberConfirmation/${req.param('audio')}`
    res.download(file)
})

module.exports = router
