let request

require('dotenv-safe').config()

const host = process.env.HOST

beforeEach(() => {
    jest.resetModules()
    const { app } = require('./index')
    const supertest = require('supertest')
    request = supertest(app)
})

describe('POST /mainMenuPrompt', () => {
    it('returns the percl commands for the main menu getSpeech including redirect and prompt', async () => {
        const res = await request.post('/mainMenuPrompt')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                GetSpeech: {
                    actionUrl: `${host}/mainMenu`,
                    grammarFile: `${host}/mainMenuGrammar`,
                    grammarRule: 'option',
                    grammarType: 'URL',
                    prompts: [
                        {
                            Say: {
                                text:
                                    'Say existing or press 1 for existing orders. Say new or press 2 for new orders, or Say operator or press 0 to speak to an operator'
                            }
                        }
                    ]
                }
            }
        ])
    })
})

describe('POST /mainMenu', () => {
    it('returns the percl command for redirect to /transfer when sent with digit "0" ', async () => {
        const res = await request
            .post('/mainMenu')
            .type('form')
            .send({ recognitionResult: '0', reason: 'digit' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text: 'Redirecting you to an operator'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/transfer`
                }
            }
        ])
    })

    it('returns the percl command for redirect to /transfer when sent with speech regognition OPERATOR ', async () => {
        const res = await request
            .post('/mainMenu')
            .type('form')
            .send({ recognitionResult: 'OPERATOR', reason: 'recognition' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text: 'Redirecting you to an operator'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/transfer`
                }
            }
        ])
    })

    it('returns the percl command for redirect to /accountNumberPrompt when sent with digit "1" ', async () => {
        const res = await request
            .post('/mainMenu')
            .type('form')
            .send({ recognitionResult: '1', reason: 'digit' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text: 'Redirecting your call to existing orders.'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/accountNumberPrompt`
                }
            }
        ])
    })

    it('returns the percl command for redirect to /accountNumberPrompt when sent with speech recognition EXISTING ', async () => {
        const res = await request
            .post('/mainMenu')
            .type('form')
            .send({ recognitionResult: 'EXISTING', reason: 'recognition' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text: 'Redirecting your call to existing orders.'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/accountNumberPrompt`
                }
            }
        ])
    })

    it('returns the percl command for redirect to /transfer when sent with digit "2" ', async () => {
        const res = await request
            .post('/mainMenu')
            .type('form')
            .send({ recognitionResult: '2', reason: 'digit' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text: 'Redirecting your call to new orders.'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/transfer`
                }
            }
        ])
    })

    it('returns the percl command for redirect to /transfer when sent with speech recognition NEW ', async () => {
        const res = await request
            .post('/mainMenu')
            .type('form')
            .send({ recognitionResult: 'NEW', reason: 'recognition' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text: 'Redirecting your call to new orders.'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/transfer`
                }
            }
        ])
    })

    it('returns the percl command for redirect back to mainMenuPrompt when sent with invalid digits', async () => {
        const res = await request
            .post('/mainMenu')
            .type('form')
            .send({ recognitionResult: '7', reason: 'digit' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text: 'Error, please try again'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/mainMenuPrompt`
                }
            }
        ])
    })

    it('returns the percl command for redirect back to mainMenuPrompt when sent with invalid speech input', async () => {
        const res = await request
            .post('/mainMenu')
            .type('form')
            .send({ recognitionResult: 'INVALID', reason: 'recognition' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text: 'Error, please try again'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/mainMenuPrompt`
                }
            }
        ])
    })
})
