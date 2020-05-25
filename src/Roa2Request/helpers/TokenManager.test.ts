import {expect} from 'chai'
import * as sinon from 'sinon'
import TokenPasswordConfig from "../models/TokenPasswordConfig";
import TokenManager from "./TokenManager";
import TokenRefreshConfig from "../models/TokenRefreshConfig";
import TokenCodeConfig from "../models/TokenCodeConfig";
import Roa2Authenticator, {ROA2_TOKEN_TYPES, Roa2Token} from "../../Roa2Authenticator";
import UnknownTokenConfigError from "../errors/UnknownTokenConfigError";

const FAKE_TOKEN = new Roa2Token(
    "some-fake-access-token",
    ROA2_TOKEN_TYPES.BEARER,
    3600,
    ["am_application_scope", "default"],
    "some-fake-refresh-token"
)

const fakeAuthenticatorFactory = function () {
    return {
        getClientCredentialsToken: sinon.spy(async function () {
            return FAKE_TOKEN
        }),
        getPasswordToken: sinon.spy(async function () {
            return FAKE_TOKEN
        }),
        getRefreshToken: sinon.spy(async function () {
            return FAKE_TOKEN
        }),
        getCodeToken: sinon.spy(async function () {
            return FAKE_TOKEN
        }),
    }
}

describe('TokenManager', function () {
    it('should try to get client credentials token', async function () {
        const authenticator: Roa2Authenticator = fakeAuthenticatorFactory() as any
        const tokenManager = new TokenManager(authenticator)

        await tokenManager.getToken()

        // @ts-ignore
        expect(authenticator.getClientCredentialsToken.calledOnce).to.be.equal(true)
    })

    it('should try to get password token', async function () {
        const authenticator: Roa2Authenticator = fakeAuthenticatorFactory() as any
        const tokenManager = new TokenManager(
            authenticator,
            new TokenPasswordConfig('fake', 'fake')
        )

        await tokenManager.getToken()

        // @ts-ignore
        expect(authenticator.getPasswordToken.calledOnce).to.be.equal(true)
    })

    it('should try to get refresh token', async function () {
        const authenticator: Roa2Authenticator = fakeAuthenticatorFactory() as any
        const tokenManager = new TokenManager(
            authenticator,
            new TokenRefreshConfig('fake')
        )

        await tokenManager.getToken()

        // @ts-ignore
        expect(authenticator.getRefreshToken.calledOnce).to.be.equal(true)
    })

    it('should try to get code token', async function () {
        const authenticator: Roa2Authenticator = fakeAuthenticatorFactory() as any
        const tokenManager = new TokenManager(
            authenticator,
            new TokenCodeConfig('fake', 'fake')
        )

        await tokenManager.getToken()

        // @ts-ignore
        expect(authenticator.getCodeToken.calledOnce).to.be.equal(true)
    })

    it('should ask only one times for new token if multiple request ask in same time', async function () {
        const authenticator: Roa2Authenticator = {
            getRefreshToken: sinon.spy(async function () {
                const accessToken = new Date().toISOString() + Math.random()
                return new Roa2Token(
                    accessToken, ROA2_TOKEN_TYPES.BEARER, 3600, []
                )
            })
        } as any

        const tokenManager = new TokenManager(
            authenticator,
            new TokenRefreshConfig('fake')
        )

        const tokens = await Promise.all([
            await tokenManager.getToken(),
            await tokenManager.getToken(),
            await tokenManager.getToken(),
            await tokenManager.getToken(),
            await tokenManager.getToken(),
            await tokenManager.getToken(),
        ])

        expect(tokens.every(token => token === tokens[0])).to.be.equal(true)
    })

    it('should not ask for new token if one is in storage', async function () {
        const authenticator: Roa2Authenticator = fakeAuthenticatorFactory() as any

        const FAKE_STORAGE: any = {
            get: sinon.spy(async function () {
                return FAKE_TOKEN
            })
        }

        const tokenManager = new TokenManager(
            authenticator,
            undefined,
            FAKE_STORAGE
        )

        expect(await tokenManager.getToken()).to.be.eql(FAKE_TOKEN)

        // @ts-ignore
        expect(authenticator.getClientCredentialsToken.notCalled).to.be.equal(true)
    })

    it('should throw error with unknown token configuration', async function () {
        const authenticator: Roa2Authenticator = fakeAuthenticatorFactory() as any

        class DummyClass {

        }

        const tokenManager = new TokenManager(
            authenticator,
            new DummyClass(),
        )

        try {
            await tokenManager.getToken()
        } catch (e) {
            expect(e).to.be.instanceof(UnknownTokenConfigError)
            return
        }

        throw new Error('This should never happen')
    })
})