export default class Roa2AuthenticatorError extends Error {
    /* istanbul ignore next */
    constructor(...args: any[]) {
        super(...args)

        Object.setPrototypeOf(this, Roa2AuthenticatorError.prototype)
    }
}