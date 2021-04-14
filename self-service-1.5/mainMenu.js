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
                prompts: [
                    freeclimb.percl.say(
                        'Say existing or press 1 for existing orders. Say new or press 2 for new orders, or Say operator or press 0 to speak to an operator'
                    )
                ]
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
            ['0', { script: 'Redirecting you to an operator', redirect: `${host}/transfer` }]
        ])
    } else if (req.body.reason === freeclimb.enums.getSpeechReason.RECOGNITION) {
        menuOpts = new Map([
            [
                'EXISTING',
                {
                    script: 'Redirecting your call to existing orders.',
                    redirect: `${host}/accountNumberPrompt`
                }
            ],
            [
                'NEW',
                {
                    script: 'Redirecting your call to new orders.',
                    redirect: `${host}/transfer`
                }
            ],
            ['OPERATOR', { script: 'Redirecting you to an operator', redirect: `${host}/transfer` }]
        ])
    }

    if ((!response || !menuOpts.get(response)) && mainMenuErrCount < 3) {
        mainMenuErrCount++
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say('Error, please try again'),
                freeclimb.percl.redirect(`${host}/mainMenuPrompt`)
            )
        )
    } else if (mainMenuErrCount >= 3) {
        mainMenuErrCount = 0
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say('Max retry limit reached'),
                freeclimb.percl.pause(100),
                freeclimb.percl.redirect(`${host}/endCall`)
            )
        )
    } else {
        mainMenuErrCount = 0
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say(menuOpts.get(response).script),
                freeclimb.percl.redirect(menuOpts.get(response).redirect)
            )
        )
    }
})

router.get('/mainMenuGrammar', function (req, res) {
    const file = `${__dirname}/mainMenuGrammar.xml`
    res.download(file)
})

module.exports = router
