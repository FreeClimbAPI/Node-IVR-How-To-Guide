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
    Hangup
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
                new GetSpeech({
                    actionUrl: `${host}/mainMenu`,
                    grammarFile: `${host}/mainMenuGrammar`,
                    grammarType: 'URL',
                    grammarRule: 'option',
                    prompts: [new Play({ file: `${host}/mainMenuAudio?audio=mainMenuPrompt.wav` })]
                })
            ]
        }).build()
    )
})

router.post('/mainMenu', (req, res) => {
    let menuOpts
    const getSpeechResponse = req.body
    const response = getSpeechResponse.recognitionResult
    if (req.body.reason === 'digit') {
        menuOpts = new Map([
            [
                '1',
                {
                    audioUrl: `${host}/mainMenuAudio?audio=existingOrder.wav`,
                    redirect: `${host}/accountNumberPrompt`
                }
            ],
            [
                '2',
                {
                    audioUrl: `${host}/mainMenuAudio?audio=newOrder.wav`,
                    redirect: `${host}/transfer`
                }
            ],
            [
                '0',
                {
                    audioUrl: `${host}/mainMenuAudio?audio=operator.wav`,
                    redirect: `${host}/transfer`
                }
            ]
        ])
    } else if (req.body.reason === 'recognition') {
        menuOpts = new Map([
            [
                'EXISTING',
                {
                    audioUrl: `${host}/mainMenuAudio?audio=existingOrder.wav`,
                    redirect: `${host}/accountNumberPrompt`
                }
            ],
            [
                'NEW',
                {
                    audioUrl: `${host}/mainMenuAudio?audio=newOrder.wav`,
                    redirect: `${host}/transfer`
                }
            ],
            [
                'OPERATOR',
                {
                    audioUrl: `${host}/mainMenuAudio?audio=operator.wav`,
                    redirect: `${host}/transfer`
                }
            ]
        ])
    }

    if ((!response || !menuOpts.get(response)) && mainMenuErrCount < 3) {
        mainMenuErrCount++
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Play({ file: `${host}/mainMenuAudio?audio=error.wav` }),
                    new Redirect({ actionUrl: `${host}/mainMenuPrompt` })
                ]
            }).build()
        )
    } else if (mainMenuErrCount >= 3) {
        mainMenuErrCount = 0
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Play({ file: `${host}/mainMenuAudio?audio=maxRetry.wav` }),
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
                    new Play({ file: menuOpts.get(response).audioUrl }),
                    new Redirect({ actionUrl: menuOpts.get(response).redirect })
                ]
            }).build()
        )
    }
})

router.get('/mainMenuGrammar', function (req, res) {
    const file = `${__dirname}/mainMenuGrammar.xml`
    res.download(file)
})

router.get('/mainMenuAudio', function (req, res) {
    const file = `${__dirname}/audioFiles/mainMenu/${req.param('audio')}`
    res.download(file)
})

module.exports = router
