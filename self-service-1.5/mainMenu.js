require('dotenv-safe').config()
const express = require('express')
const { createConfiguration, DefaultApi, PerclScript, GetSpeech, Say, Redirect, Pause } = require('@freeclimb/sdk')
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
                    prompts: [
                        new Say({ text: 'Say existing or press 1 for existing orders. Say new or press 2 for new orders, or Say operator or press 0 to speak to an operator' })
                    ]
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
    } else if (req.body.reason === 'recognition') {
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
                    new Say({ text: menuOpts.get(response).script }),
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

module.exports = router
