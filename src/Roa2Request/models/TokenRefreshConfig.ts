import TokenConfig from "./TokenConfig"

export default class TokenRefreshConfig extends TokenConfig {
    constructor(public readonly refreshToken: string) {
        super()
    }
}