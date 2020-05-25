import CodeVerifier from "../models/CodeVerifier"
import {WordArray, enc, SHA256} from "crypto-js"

export enum CHALLENGE_METHODS {
    S256 = 'S256'
}

export default class CodeVerifierGenerator {
    public generate(): CodeVerifier {
        const codeVerifier = this.generateRandomCodeVerifier()

        return new CodeVerifier(
            codeVerifier,
            CHALLENGE_METHODS.S256,
            this.generateCodeChallenge(CHALLENGE_METHODS.S256, codeVerifier)
        )
    }

    /**
     * Generate random code verifier.
     *
     * If length is not set, it random choose length from 43 to 128 included.
     *
     * @param length
     */
    public generateRandomCodeVerifier(length?: number) {
        const codeVerifierLength = length || this.getRandomLength(43, 128)

        let text = ""
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        for (let i = 0; i < codeVerifierLength; i+=1) {
            text += possible.charAt(Math.floor(Math.random() * possible.length))
        }
        return text
    }

    public generateCodeChallenge(method: CHALLENGE_METHODS, codeVerifier: string): string {
        return this.base64URL(SHA256(codeVerifier))
    }

    protected base64URL(text: WordArray) {
        return text.toString(enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    }

    protected getRandomLength(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
}