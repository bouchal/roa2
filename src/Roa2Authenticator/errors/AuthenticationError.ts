import Roa2AuthenticatorError from "./Roa2AuthenticatorError"

export default class AuthenticationError extends Roa2AuthenticatorError {
    /* istanbul ignore next */
    constructor(public error: string, public description: string) {
        super(`${error}: ${description}`)

        Object.setPrototypeOf(this, AuthenticationError.prototype)
    }
}