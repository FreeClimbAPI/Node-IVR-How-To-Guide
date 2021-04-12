require('dotenv-safe').config()
const express = require('express')
const freeclimbSDK = require('@freeclimb/sdk')
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const apiKey = process.env.API_KEY
const freeclimb = freeclimbSDK(accountId, apiKey)

router = express.Router()

let mainMenuErrCount = 0

router.post('/mainMenuPrompt', (req, res) => {
    res.status(200).json(
        freeclimb.percl.build(
            freeclimb.percl.getSpeech(`${host}/mainMenu`, `${host}/mainMenuGrammar`, {
                grammarType: freeclimb.enums.grammarType.URL,
                grammarRule: 'option',
                prompts: [freeclimb.percl.play(`${host}/mainMenuAudio?audio=mainMenuPrompt.wav`)]
            })
        )
    )
})

router.post('/mainMenu', (req, res) => {
    let menuOpts
    const getSpeechResponse = req.body
    const response = getSpeechResponse.recognitionResult
    if (req.body.reason === freeclimb.enums.getSpeechReason.DIGIT) {
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
    } else if (req.body.reason === freeclimb.enums.getSpeechReason.RECOGNITION) {
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
            freeclimb.percl.build(
                freeclimb.percl.play(`${host}/mainMenuAudio?audio=error.wav`),
                freeclimb.percl.redirect(`${host}/mainMenuPrompt`)
            )
        )
    } else if (mainMenuErrCount >= 3) {
        mainMenuErrCount = 0
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.play(`${host}/mainMenuAudio?audio=maxRetry.wav`),
                freeclimb.percl.pause(100),
                freeclimb.percl.redirect(`${host}/endCall`)
            )
        )
    } else {
        mainMenuErrCount = 0
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.play(menuOpts.get(response).audioUrl),
                freeclimb.percl.redirect(menuOpts.get(response).redirect)
            )
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
