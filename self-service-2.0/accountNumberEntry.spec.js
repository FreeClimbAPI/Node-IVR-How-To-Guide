let request

require('dotenv-safe').config()

const host = process.env.HOST

beforeEach(() => {
    jest.resetModules()
    const { app } = require('./index')
    const supertest = require('supertest')
    request = supertest(app)
})

describe('POST /accountNumberPrompt', () => {
    it('returns the percl commands for the account number entry menu getdigits including redirect and prompt', async () => {
        const res = await request.post('/accountNumberPrompt')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                GetSpeech: {
                    actionUrl: `${host}/accountNumber`,
                    grammarFile: 'ANY_DIG',
                    prompts: [
                        {
                            Play: {
                                file:  `${host}/accountNumberEntryAudio?audio=accountNumberPrompt.wav`
                            }
                        }
                    ]
                }
            }
        ])
    })
})

describe('POST /accountNumber', () => {
    it('returns an error when the number of digits input for the account number is incorrect', async () => {
        const res = await request
            .post('/accountNumber')
            .type('form')
            .send({ recognitionResult: '0', reason: 'digit' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Play: {
                    file:  `${host}/accountNumberEntryAudio?audio=shortError.wav`
                }
            },
            {
                Pause: {
                    length: 100
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/accountNumberPrompt`
                }
            }
        ])
    })

    it('returns an error when no digits have been input', async () => {
        const res = await request
            .post('/accountNumber')
            .type('form')
            .send({ recognitionResult: '', reason: 'digit' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Play: {
                    file: `${host}/accountNumberEntryAudio?audio=shortError.wav`
                },
            },
            {
                Pause: {
                    length: 100
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/accountNumberPrompt`
                }
            }
        ])
    })

    it('returns a redirect to /transfer when the max number of retries has been reached', async () => {
        for (let i = 0; i < 2; i++) {
            await request
                .post('/accountNumber')
                .type('form')
                .send({ recognitionResult: '', reason: 'digit' })
        }

        const res = await request
            .post('/accountNumber')
            .type('form')
            .send({ recognitionResult: '111222', reason: 'digit' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Play: {
                    file: `${host}/accountNumberEntryAudio?audio=maxRetry.wav`
                }
            },
            {
                Pause: {
                    length: 100
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/transfer`
                }
            }
        ])
    })

    it('returns a redirect to /accountNumberConfirmation on successful input of account number using dtmf input', async () => {
        const res = await request
            .post('/accountNumber')
            .type('form')
            .send({ recognitionResult: '111222', reason: 'digit' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Redirect: {
                    actionUrl: `${host}/confirmAccountNumberPrompt?acct=111222`
                }
            }
        ])
    })

    it('returns a redirect to /accountNumberConfirmation on successful input of account number using speech input', async () => {
        const res = await request
            .post('/accountNumber')
            .type('form')
            .send({ recognitionResult: '1 1 1 2 2 2', reason: 'recognition' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Redirect: {
                    actionUrl: `${host}/confirmAccountNumberPrompt?acct=111222`
                }
            }
        ])
    })
})
