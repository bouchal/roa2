import Roa2ResponseError from "./Roa2ResponseError"

export default class InvalidTokenError extends Roa2ResponseError {
    /* istanbul ignore next */
    constructor() {
        super('Invalid Token. Make sure you have given the correct access token.')

        Object.setPrototypeOf(this, InvalidTokenError.prototype)
    }
}