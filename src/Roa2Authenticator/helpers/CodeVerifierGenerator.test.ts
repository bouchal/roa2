import {expect} from 'chai'
import CodeVerifierGenerator, {CHALLENGE_METHODS} from "./CodeVerifierGenerator";

const CODE_VERIFIER = "83KlbJa2Jn62xrVe48IJgvuYVVwQ6irGBRQhAUaik9fpM9J1jR2aH7gg8AjDqEsJgGgKE15huLQfEtRrBbw6v5WTwBfH7eLXxCqnQo226SjpRIF2g9m7TzQEEFXbRSyp"
const EXPECTED_CODE_CHALLENGE = "aCMrQJaaj9_Wz6D2wJbcy5kPALIP5azJiy6wYHcM6wQ"

describe('CodeVerifierGenerator', function () {
    it('should generate right S256 code challenge', function () {
        const generator = new CodeVerifierGenerator()

        expect(generator.generateCodeChallenge(CHALLENGE_METHODS.S256, CODE_VERIFIER)).to.be.eql(EXPECTED_CODE_CHALLENGE)
    })

    it('should generate correct random code challenge', function () {
        const generator = new CodeVerifierGenerator()

        const verifier = generator.generate()

        expect(generator.generateCodeChallenge(CHALLENGE_METHODS.S256, verifier.codeVerifier)).to.be.eql(verifier.codeChallenge)
        expect(verifier.challengeMethod).to.be.eql(CHALLENGE_METHODS.S256)
    })

    it('should generate correct length random code verifier', function () {
        const generator = new CodeVerifierGenerator()

        const LENGTH = 50

        expect(generator.generateRandomCodeVerifier(LENGTH).length).to.be.eql(LENGTH)
    })
})