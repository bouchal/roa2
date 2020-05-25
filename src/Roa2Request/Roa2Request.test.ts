import Roa2Request from "./Roa2Request"
import {expect} from 'chai'
import * as sinon from 'sinon'
import * as http from "http"
import express from "express"
import * as net from "net"
import MemoryTokenStorage from "./storages/MemoryTokenStorage"
import InvalidTokenError from "./errors/InvalidTokenError"
import * as bodyParser from 'body-parser'
import TokenManager from "./helpers/TokenManager";
import {ROA2_TOKEN_TYPES, Roa2Token} from "../Roa2Authenticator";

const FAKE_TOKEN = new Roa2Token(
    "some-fake-access-token",
    ROA2_TOKEN_TYPES.BEARER,
    3600,
    ["am_application_scope", "default"],
    "some-fake-refresh-token"
)

describe('Roa2Request', function () {
    let server: http.Server
    let port: number

    before(function (done) {
        const app = express()

        app.use(bodyParser.json())

        app.get('/test', (req: express.Request, res: express.Response) => {
            res.sendStatus(200)
        })

        app.all('/method-test', (req: express.Request, res: express.Response) => {
            res.json({
                method: req.method,
                query: req.query,
                body: req.body,
                headers: req.headers,
            })
        })

        server = app.listen(() => {
            port = (server.address() as net.AddressInfo).port
            done()
        })
    })

    it('should work with async/await', async () => {
        const FAKE_WORKING_AUTHENTICATOR = {
            getClientCredentialsToken: sinon.spy(async function () {
                return FAKE_TOKEN
            }),
        }

        const FAKE_TOKEN_MANAGER = new TokenManager(
            FAKE_WORKING_AUTHENTICATOR as any
        )

        const request = new Roa2Request(
            `http://127.0.0.1:${port}`,
            FAKE_TOKEN_MANAGER
        )

        const result = await request.get('/method-test')

        expect(result.data.method).to.be.equal('GET')
    })

    it('should work with promise', (done) => {
        const FAKE_WORKING_AUTHENTICATOR = {
            getClientCredentialsToken: sinon.spy(async function () {
                return FAKE_TOKEN
            }),
        }

        const FAKE_TOKEN_MANAGER = new TokenManager(
            FAKE_WORKING_AUTHENTICATOR as any
        )

        const request = new Roa2Request(
            `http://127.0.0.1:${port}`,
            FAKE_TOKEN_MANAGER
        )

        request.get('/method-test').then((result: any) => {
            expect(result.data.method).to.be.equal('GET')
            done()
        }, (err: string) => {
            done(err)
        })
    })

    it('should work send right query and body', async () => {
        const FAKE_WORKING_AUTHENTICATOR = {
            getClientCredentialsToken: sinon.spy(async function () {
                return FAKE_TOKEN
            }),
        }

        const FAKE_TOKEN_MANAGER = new TokenManager(
            FAKE_WORKING_AUTHENTICATOR as any
        )

        const request = new Roa2Request(
            `http://127.0.0.1:${port}`,
            FAKE_TOKEN_MANAGER
        )

        const QUERY = {
            query1: 'fake-param'
        }

        const BODY = {
            fakeJson: 'This is fake json'
        }

        const result = await request.post('/method-test', QUERY, BODY)

        expect(result.data.method).to.be.equal('POST')
        expect(result.data.query).to.be.eql(QUERY)
        expect(result.data.body).to.be.eql(BODY)
    })

    it('should work with path prefix', async () => {
        const FAKE_WORKING_AUTHENTICATOR = {
            getClientCredentialsToken: sinon.spy(async function () {
                return FAKE_TOKEN
            }),
        }

        const FAKE_TOKEN_MANAGER = new TokenManager(
            FAKE_WORKING_AUTHENTICATOR as any
        )

        const request = new Roa2Request(
            `http://127.0.0.1:${port}`,
            FAKE_TOKEN_MANAGER,
            {pathPrefix: '/method-'}
        )

        const QUERY = {
            query1: 'fake-param'
        }

        const BODY = {
            fakeJson: 'This is fake json'
        }

        const result = await request.post('test', QUERY, BODY)

        expect(result.data.method).to.be.equal('POST')
        expect(result.data.query).to.be.eql(QUERY)
        expect(result.data.body).to.be.eql(BODY)
    })

    it('should work with optional options', async () => {
        const FAKE_WORKING_AUTHENTICATOR = {
            getClientCredentialsToken: sinon.spy(async function () {
                return FAKE_TOKEN
            }),
        }

        const FAKE_TOKEN_MANAGER = new TokenManager(
            FAKE_WORKING_AUTHENTICATOR as any
        )

        const request = new Roa2Request(
            `http://127.0.0.1:${port}`,
            FAKE_TOKEN_MANAGER
        )

        const QUERY = {
            query1: 'fake-param'
        }

        const BODY = {
            fakeJson: 'This is fake json'
        }

        const result = await request.post('test', QUERY, BODY, {pathPrefix: '/method-'})
        expect(result.data.method).to.be.equal('POST')
        expect(result.data.query).to.be.eql(QUERY)
        expect(result.data.body).to.be.eql(BODY)
    })

    it('should get access token only one time', async function () {
        const FAKE_WORKING_AUTHENTICATOR = {
            getClientCredentialsToken: sinon.spy(async function () {
                return FAKE_TOKEN
            }),
        }

        const FAKE_TOKEN_MANAGER = new TokenManager(
            FAKE_WORKING_AUTHENTICATOR as any
        )

        const request = new Roa2Request(
            `http://127.0.0.1:${port}`,
            FAKE_TOKEN_MANAGER
        )

        await request.get('/test')
        await request.get('/test')

        expect(FAKE_WORKING_AUTHENTICATOR.getClientCredentialsToken.calledOnce).to.be.equal(true)
    })

    it('should call for new token, when current is invalid', async function () {
        const FAKE_WORKING_AUTHENTICATOR = {
            getClientCredentialsToken: sinon.spy(async function () {
                return FAKE_TOKEN
            }),
        }

        const FAKE_RESPONSE_VALIDATOR = {
            validate() {
                throw new InvalidTokenError()
            }
        }

        const tokenStorage = new MemoryTokenStorage()

        await tokenStorage.save(FAKE_TOKEN)

        const FAKE_TOKEN_MANAGER = new TokenManager(
            FAKE_WORKING_AUTHENTICATOR as any,
            undefined,
            tokenStorage
        )

        const request = new Roa2Request(
            `http://127.0.0.1:${port}`,
            FAKE_TOKEN_MANAGER,
            undefined,
            {
                responseValidator: FAKE_RESPONSE_VALIDATOR
            }
        )

        try {
            await request.get('/test')
        } catch (e) {
            expect(e).to.be.instanceof(InvalidTokenError)
        }

        expect(FAKE_WORKING_AUTHENTICATOR.getClientCredentialsToken.calledOnce).to.be.equal(true)
    })

    it('should send request with Authorization header', (done) => {
        const FAKE_WORKING_AUTHENTICATOR = {
            getClientCredentialsToken: sinon.spy(async function () {
                return FAKE_TOKEN
            }),
        }

        const FAKE_TOKEN_MANAGER = new TokenManager(
            FAKE_WORKING_AUTHENTICATOR as any
        )

        const request = new Roa2Request(
            `http://127.0.0.1:${port}`,
            FAKE_TOKEN_MANAGER
        )

        request.get('/method-test').then((result: any) => {
            expect(result.data.headers.authorization).to.be.eql(`Bearer ${FAKE_TOKEN.accessToken}`)
            done()
        }, (err: string) => {
            done(err)
        })
    })

    it('should send request without authorization header', (done) => {
        const request = new Roa2Request(
            `http://127.0.0.1:${port}`
        )

        request.get('/method-test').then((result: any) => {
            expect(result.data.headers).to.not.have.any.keys('Authorization', 'authorization')
            done()
        }, (err: string) => {
            done(err)
        })
    })

    it('should use interceptors with request', (done) => {
        const request = new Roa2Request(
            `http://127.0.0.1:${port}`,
        )

        const TEST_HEADER_VALUE = String(Date.now())

        const testTrigger = sinon.spy((response) => {
            return response
        })

        request.interceptors.request.use((config) => {
            config.headers['x-test-header'] = TEST_HEADER_VALUE
            return config
        })

        request.interceptors.response.use(testTrigger)

        request.get('/method-test').then((result: any) => {
            expect(result.data.headers['x-test-header']).to.be.eql(TEST_HEADER_VALUE)
            expect(testTrigger.calledOnce).to.be.equal(true)
            done()
        }, (err: string) => {
            done(err)
        })
    })

    it('should work with all methods', async function () {
        const methods = [
            'get',
            'post',
            'put',
            'head',
            'delete',
            'options',
            'trace',
            'copy',
            'lock',
            'mkcol',
            'move',
            'purge',
            'propfind',
            'proppatch',
            'unlock',
            'report',
            'mkactivity',
            'checkout',
            'merge',
            'm-search',
            'notify',
            'subscribe',
            'unsubscribe',
            'patch',
            'search',
        ]

        const FAKE_WORKING_AUTHENTICATOR = {
            getClientCredentialsToken: sinon.spy(async function () {
                return FAKE_TOKEN
            }),
        }

        const FAKE_TOKEN_MANAGER = new TokenManager(
            FAKE_WORKING_AUTHENTICATOR as any
        )

        const request = new Roa2Request(
            `http://127.0.0.1:${port}`,
            FAKE_TOKEN_MANAGER
        )

        await Promise.all(methods.map(async (method) => {
            // @ts-ignore
            const result = await request[method]('/method-test')

            expect(result.request.method).to.be.equal(method.toUpperCase())
        }))
    })

    it('should wrap request with additional options', async function () {
        const FAKE_WORKING_AUTHENTICATOR = {
            getClientCredentialsToken: sinon.spy(async function () {
                return FAKE_TOKEN
            }),
        }

        const FAKE_TOKEN_MANAGER = new TokenManager(
            FAKE_WORKING_AUTHENTICATOR as any
        )

        const request = new Roa2Request(
            `http://127.0.0.1:${port}`,
            FAKE_TOKEN_MANAGER
        )

        const newRequest = request.wrap({pathPrefix: '/method-'})

        const result = await newRequest.get('test')

        expect(result.request.method).to.be.equal('GET')
    })



    after(function (done) {
        server.close(() => {
            done()
        })
    })
})





