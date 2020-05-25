import {expect} from 'chai'
import MemoryTokenStorage from "./MemoryTokenStorage";
import {ROA2_TOKEN_TYPES, Roa2Token} from "../../Roa2Authenticator";

const FAKE_TOKEN = new Roa2Token(
    "some-fake-access-token",
    ROA2_TOKEN_TYPES.BEARER,
    3600,
    [ "am_application_scope", "default"],
    "some-fake-refresh-token"
)

describe('MemoryTokenStorage', function () {
    it('should store token', async function () {
        const storage = new MemoryTokenStorage()

        await storage.save(FAKE_TOKEN)

        expect(await storage.get()).to.be.eql(FAKE_TOKEN)
    })
})