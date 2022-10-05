let request

require('dotenv-safe').config()

const host = process.env.HOST

beforeEach(() => {
    jest.resetModules()
    const { app } = require('./index')
    const supertest = require('supertest')
    request = supertest(app)
})

describe('POST /confirmAccountNumberPrompt', () => {
    it('returns the percl commands for the account number confirmation menu getdigits including redirect and prompt', async () => {
        const res = await request.post('/confirmAccountNumberPrompt?acct=111222')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                GetSpeech: {
                    actionUrl: `${host}/confirmAccountNumber?acct=111222`,
                    grammarFile: `${host}/accountNumberConfirmationGrammar`,
                    grammarRule: 'option',
                    grammarType: 'URL',
                    prompts: [
                        {
                            Say: {
                                loop: 1,
                                text:
                                    'You entered 111222 is that correct? Press 1 or say yes to confirm your account number or press 2 or say no to try again'
                            }
                        }
                    ]
                }
            }
        ])
    })
})

describe('POST /confirmAccountNumber', () => {
    it('returns an error when no menu options are selected', async () => {
        const res = await request
            .post('/confirmAccountNumber?acct=111222')
            .type('form')
            .send({ recognitionResult: '', reason: 'digit' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Play: {
                    file: `${host}/accountNumberConfirmationAudio?audio=shortError.wav`
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/confirmAccountNumberPrompt?acct=111222`
                }
            }
        ])
    })

    it('returns transfer to operator if max err limit reached', async () => {
        for (let i = 0; i < 3; i++) {
            await request
                .post('/confirmAccountNumber?acct=111222')
                .type('form')
                .send({ recognitionResult: '', reason: 'digit' })
        }

        const res = await request
            .post('/confirmAccountNumber?acct=111222')
            .type('form')
            .send({ recognitionResult: '', reason: 'digit' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Play: {
                    file: `${host}/accountNumberConfirmationAudio?audio=operator.wav`
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

    it('returns transfer to operator if max retry limit reached', async () => {
        for (let i = 0; i < 2; i++) {
            await request
                .post('/confirmAccountNumber?acct=111222')
                .type('form')
                .send({ recognitionResult: '2', reason: 'digit' })
        }

        const res = await request
            .post('/confirmAccountNumber?acct=111222')
            .type('form')
            .send({ recognitionResult: '2', reason: 'digit' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Play: {
                    file: `${host}/accountNumberConfirmationAudio?audio=operator.wav`
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

    it('returns redirect to account number lookup on dtmf input of number 1', async () => {
        const res = await request
            .post('/confirmAccountNumber?acct=111222')
            .type('form')
            .send({ recognitionResult: '1', reason: 'digit' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Play: {
                    file: `${host}/accountNumberConfirmationAudio?audio=proceed.wav`
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/accountLookup?acct=111222`
                }
            }
        ])
    })

    it('returns redirect to account number lookup on speech input YES', async () => {
        const res = await request
            .post('/confirmAccountNumber?acct=111222')
            .type('form')
            .send({ recognitionResult: 'YES', reason: 'recognition' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Play: {
                    file: `${host}/accountNumberConfirmationAudio?audio=proceed.wav`
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/accountLookup?acct=111222`
                }
            }
        ])
    })

    it('returns redirect to account number entry on dtmf input of number 2', async () => {
        const res = await request
            .post('/confirmAccountNumber?acct=111222')
            .type('form')
            .send({ recognitionResult: '2', reason: 'digit' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Play: {
                    file: `${host}/accountNumberConfirmationAudio?audio=retry.wav`
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/accountNumberPrompt`
                }
            }
        ])
    })

    it('returns redirect to account number entry on speech input NO', async () => {
        const res = await request
            .post('/confirmAccountNumber?acct=111222')
            .type('form')
            .send({ recognitionResult: 'NO', reason: 'recognition' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Play: {
                    file: `${host}/accountNumberConfirmationAudio?audio=retry.wav`
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/accountNumberPrompt`
                }
            }
        ])
    })
})
