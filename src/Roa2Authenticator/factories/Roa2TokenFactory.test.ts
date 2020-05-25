import {expect} from 'chai'
import Roa2TokenFactory from "./Roa2TokenFactory";
import Roa2Token, {ROA2_TOKEN_TYPES} from "../models/Roa2Token";

const FAKE_TOKEN_RESPONSE = {
    "access_token": "some-fake-access-token",
    "scope": "am_application_scope default",
    "token_type": "Bearer",
    "expires_in": 3600,
    "refresh_token": "some-fake-refresh-token"
}

const EXPECTED_TOKEN = new Roa2Token(
    "some-fake-access-token",
    ROA2_TOKEN_TYPES.BEARER,
    3600,
    [ "am_application_scope", "default"],
    "some-fake-refresh-token"
)

describe('Roa2TokenFactory', function () {
    it('should generate token from response', function () {
        const factory = new Roa2TokenFactory()

        const token = factory.createFromResponseJson(FAKE_TOKEN_RESPONSE)

        expect(token).to.be.eql(EXPECTED_TOKEN)
    })
})