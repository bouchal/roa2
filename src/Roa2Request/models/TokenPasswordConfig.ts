import TokenConfig from "./TokenConfig"

export default class TokenPasswordConfig extends TokenConfig {
    constructor(public username: string, public password: string, public scope?: string | string[]) {
        super(scope)
    }
}