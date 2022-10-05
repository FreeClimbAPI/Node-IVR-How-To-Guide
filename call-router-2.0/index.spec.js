const { app, server } = require('./index')
const supertest = require('supertest')
const request = supertest(app)

require('dotenv-safe').config()

const host = process.env.HOST

afterAll(() => {
  server.close()
})

describe('POST /inComingCall', () => {
  it('return the percl commands for the into script, pause and redirect', async () => {
    const res = await request.post('/incomingCall')
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          text: 'Welcome to the Node IVR Sample app baseline.',
          loop: 1
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

describe('POST /mainMenuPrompt', () => {
  it('returns the percl commands for the main manu getdigits including redirect and prompt', async () => {
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
                loop: 1,
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
          loop: 1,
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

  it('returns the percl command for redirect to /transfer when sent with speech recognition input "OPERATOR ', async () => {
    const res = await request
      .post('/mainMenu')
      .type('form')
      .send({ recognitionResult: 'OPERATOR', reason: 'recognition' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
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

  it('returns the percl command for redirect to /endCall when sent with digit "1" ', async () => {
    const res = await request
      .post('/mainMenu')
      .type('form')
      .send({ recognitionResult: '1', reason: 'digit' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
          text: 'Redirecting your call to existing orders.'
        }
      },
      {
        Redirect: {
          actionUrl: `${host}/endCall`
        }
      }
    ])
  })

  it('returns the percl command for redirect to /endCall when sent with speech recognition input "EXISTING" ', async () => {
    const res = await request
      .post('/mainMenu')
      .type('form')
      .send({ recognitionResult: 'EXISTING', reason: 'recognition' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
          text: 'Redirecting your call to existing orders.'
        }
      },
      {
        Redirect: {
          actionUrl: `${host}/endCall`
        }
      }
    ])
  })

  it('returns the percl command for redirect to /endCall when sent with digit "2" ', async () => {
    const res = await request
      .post('/mainMenu')
      .type('form')
      .send({ recognitionResult: '2', reason: 'digit' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
          text: 'Redirecting your call to new orders.'
        }
      },
      {
        Redirect: {
          actionUrl: `${host}/endCall`
        }
      }
    ])
  })

  it('returns the percl command for redirect to /endCall when sent with speech recognition input "NEW" ', async () => {
    const res = await request
      .post('/mainMenu')
      .type('form')
      .send({ recognitionResult: 'NEW', reason: 'recognition' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
          text: 'Redirecting your call to new orders.'
        }
      },
      {
        Redirect: {
          actionUrl: `${host}/endCall`
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
          loop: 1,
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

  it('returns the percl command for redirect back to mainMenuPrompt when sent with invalid speech recognition', async () => {
    const res = await request
      .post('/mainMenu')
      .type('form')
      .send({ recognitionResult: 'INVALID', reason: 'recognition' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
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

describe('POST /transfer', () => {
  it('return the percl commands for transfer script and redirect', async () => {
    const res = await request.post('/transfer')
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          loop: 1,
          text: 'Please wait while we transfer you to an operator'
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
        Say: {
          loop: 1,
          text:
            'Thank you for calling the Node IVR sample app baseline, have a nice day!'
        }
      },
      {
        Hangup: {}
      }
    ])
  })
})
