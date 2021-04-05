let request

require('dotenv-safe').config()

const host = process.env.HOST

beforeEach(() => {
    jest.resetModules()
    const { app } = require('./index')
    const supertest = require('supertest')
    request = supertest(app)
})

describe('POST /inComingCall', () => {
    it('return the percl commands for the into script, pause and redirect', async () => {
        const res = await request.post('/incomingCall')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Play: {
                    file: `${host}/indexAudio?audio=greeting.wav`
                }
            },
            {
                Pause: {
                    length: 100
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

describe('POST /transfer', () => {
    it('return the percl commands for transfer script and redirect', async () => {
        const res = await request.post('/transfer')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Play: {
                    file: `${host}/indexAudio?audio=transfer.wav`
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/endCall`
                }
            }
        ])
    })
})

describe('POST /endCall', () => {
    it('return the percl commands for end call script and hangup', async () => {
        const res = await request.post('/endCall')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Play: {
                    file: `${host}/indexAudio?audio=hangup.wav`
                }
            },
            {
                Hangup: {}
            }
        ])
    })
})
