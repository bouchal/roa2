import Roa2RequestError from "./Roa2RequestError"

export default class Roa2ResponseError extends Roa2RequestError {
    /* istanbul ignore next */
    constructor(...args: any[]) {
        super(...args)

        Object.setPrototypeOf(this, Roa2ResponseError.prototype)
    }
}