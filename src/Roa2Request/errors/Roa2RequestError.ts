export default class Roa2RequestError extends Error {
    /* istanbul ignore next */
    constructor(...args: any[]) {
        super(...args)

        Object.setPrototypeOf(this, Roa2RequestError.prototype)
    }
}