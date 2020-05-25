export default class CodeVerifier {
    constructor(public readonly codeVerifier: string, public readonly challengeMethod: string, public readonly codeChallenge: string) {

    }
}