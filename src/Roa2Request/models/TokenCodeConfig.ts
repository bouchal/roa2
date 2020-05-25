import TokenConfig from "./TokenConfig"

export default class TokenCodeConfig extends TokenConfig {
    constructor(public readonly code: string, public readonly redirectUri: string, public readonly codeVerifier?: string) {
        super()
    }
}