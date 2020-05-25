import express from 'express'
import {expect} from 'chai'
import * as http from 'http'
import * as net from 'net'
import Roa2Token, {ROA2_TOKEN_TYPES} from "./models/Roa2Token";
import Roa2Authenticator from "./Roa2Authenticator";
import ClientConfig from "./models/ClientConfig";
import AuthenticationError from "./errors/AuthenticationError";
import {URL} from 'url'

const FAKE_TOKEN_RESPONSE = {
    "access_token": "some-fake-access-token",
    "token_type": "Bearer",
    "expires_in": 3600,
    "refresh_token": "some-fake-refresh-token"
}

const EXPECTED_TOKEN = new Roa2Token(
    "some-fake-access-token",
    ROA2_TOKEN_TYPES.BEARER,
    3600,
    [],
    "some-fake-refresh-token"
)

const UNAUTHORIZED_RESPONSE = {
    "error_description": "Client Authentication failed.",
    "error": "invalid_client"
}

describe('Roa2Authenticator', function () {
    let server: http.Server
    let port: number

    before(function (done) {
        const app = express()

        app.post('/oauth/token', (req: express.Request, res: express.Response) => {
            res.json(FAKE_TOKEN_RESPONSE)
        })

        app.post('/custom-oauth/token', (req: express.Request, res: express.Response) => {
            res.json(FAKE_TOKEN_RESPONSE)
        })

        app.post('/error-oauth/token', (req: express.Request, res: express.Response) => {
            res.status(401)
            res.json(UNAUTHORIZED_RESPONSE)
        })

        app.post('/error-oauth/token', (req: express.Request, res: express.Response) => {
            res.status(401)
            res.json(UNAUTHORIZED_RESPONSE)
        })

        server = app.listen(() => {
            port = (server.address() as net.AddressInfo).port
            done()
        })
    })

    it('should return token for client credentials grant without token path', async function () {
        const authenticator = new Roa2Authenticator({
            tokenHost: `http://127.0.0.1:${port}`
        }, new ClientConfig('', ''))

        const token = await authenticator.getClientCredentialsToken()

        expect(token).to.be.eql(EXPECTED_TOKEN)
    })

    it('should return token for client credentials grant with token path', async function () {
        const authenticator = new Roa2Authenticator({
            tokenHost: `http://127.0.0.1:${port}`,
            tokenPath: `/custom-oauth/token`
        }, new ClientConfig('', ''))

        const token = await authenticator.getClientCredentialsToken()

        expect(token).to.be.eql(EXPECTED_TOKEN)
    })

    it('should return token for client credentials grant with token path with scopes', async function () {
        const authenticator = new Roa2Authenticator({
            tokenHost: `http://127.0.0.1:${port}`,
            tokenPath: `/custom-oauth/token`
        }, new ClientConfig('', ''))

        const token = await authenticator.getClientCredentialsToken([])

        expect(token).to.be.eql(EXPECTED_TOKEN)
    })

    it('should return token for client password grant', async function () {
        const authenticator = new Roa2Authenticator({
            tokenHost: `http://127.0.0.1:${port}`,
            tokenPath: `/custom-oauth/token`
        }, new ClientConfig('', ''))

        const token = await authenticator.getPasswordToken('', '')

        expect(token).to.be.eql(EXPECTED_TOKEN)
    })

    it('should return token for client password grant with scopes', async function () {
        const authenticator = new Roa2Authenticator({
            tokenHost: `http://127.0.0.1:${port}`,
            tokenPath: `/custom-oauth/token`
        }, new ClientConfig('', ''))

        const token = await authenticator.getPasswordToken('', '', [])

        expect(token).to.be.eql(EXPECTED_TOKEN)
    })

    it('should return token for refresh token grant', async function () {
        const authenticator = new Roa2Authenticator({
            tokenHost: `http://127.0.0.1:${port}`,
            tokenPath: `/custom-oauth/token`
        }, new ClientConfig('', ''))

        const token = await authenticator.getRefreshToken('fake-refresh-token')

        expect(token).to.be.eql(EXPECTED_TOKEN)
    })

    it('should throw authentication error with refresh token', async function () {
        const authenticator = new Roa2Authenticator({
            tokenHost: `http://127.0.0.1:${port}`,
            tokenPath: `/error-oauth/token`
        }, new ClientConfig('', ''))

        try {
            const token = await authenticator.getRefreshToken('fake-refresh-token')
        } catch (e) {
            expect(e).to.be.instanceOf(AuthenticationError)
        }
    })

    it('should return token for code token grant', async function () {
        const authenticator = new Roa2Authenticator({
            tokenHost: `http://127.0.0.1:${port}`,
            tokenPath: `/custom-oauth/token`
        }, new ClientConfig('', ''))

        const token = await authenticator.getCodeToken('fake-code', 'http://127.0.0.1')

        expect(token).to.be.eql(EXPECTED_TOKEN)
    })

    it('should return token for code token grant with verifier', async function () {
        const authenticator = new Roa2Authenticator({
            tokenHost: `http://127.0.0.1:${port}`,
            tokenPath: `/custom-oauth/token`
        }, new ClientConfig('', ''))

        const token = await authenticator.getCodeToken('fake-code', 'http://127.0.0.1', 'customCodeVerifier')

        expect(token).to.be.eql(EXPECTED_TOKEN)
    })

    it('should throw authentication error with code token', async function () {
        const authenticator = new Roa2Authenticator({
            tokenHost: `http://127.0.0.1:${port}`,
            tokenPath: `/error-oauth/token`
        }, new ClientConfig('', ''))

        try {
            const token = await authenticator.getCodeToken('fake-code', 'http://127.0.0.1')
        } catch (e) {
            expect(e).to.be.instanceOf(AuthenticationError)
        }
    })

    it('should throw authentication error', async function () {
        const authenticator = new Roa2Authenticator({
            tokenHost: `http://127.0.0.1:${port}`,
            tokenPath: `/error-oauth/token`
        }, new ClientConfig('', ''))

        try {
            const token = await authenticator.getPasswordToken('', '')
        } catch (e) {
            expect(e).to.be.instanceOf(AuthenticationError)
        }
    })

    it('should generate right authorization bases', function () {
        const clientId = 'fake-client-id'
        const redirectUrl = 'http://fake-redirect-url.com'

        const authenticator = new Roa2Authenticator({tokenHost: `http://127.0.0.1:${port}`}, new ClientConfig(clientId, ''))

        const authorizationCodeBases = authenticator.generateAuthorizationCodeBases(redirectUrl)

        const authorizationUrl = new URL(authorizationCodeBases.authorizationUrl)

        expect(authorizationUrl.searchParams.get('client_id')).to.be.eql(clientId)
        expect(authorizationUrl.searchParams.get('redirect_uri')).to.be.eql(redirectUrl)

        if (authorizationCodeBases.codeVerifier) {
            expect(authorizationUrl.searchParams.get('code_challenge')).to.be.eql(authorizationCodeBases.codeVerifier.codeChallenge)
        }
    })

    after(function (done) {
        server.close(() => {
            done()
        })
    })
})