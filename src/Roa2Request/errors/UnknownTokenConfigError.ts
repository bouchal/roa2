import Roa2RequestError from "./Roa2RequestError"

export default class UnknownTokenConfigError extends Roa2RequestError {
    /* istanbul ignore next */
    constructor() {
        super('Provided token config is unknown')

        Object.setPrototypeOf(this, UnknownTokenConfigError.prototype)
    }
}