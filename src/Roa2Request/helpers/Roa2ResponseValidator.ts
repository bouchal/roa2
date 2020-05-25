import InvalidTokenError from "../errors/InvalidTokenError"
import ResponseValidator from "../interfaces/ResponseValidator"
import {AxiosResponse} from "axios"

export default class Roa2ResponseValidator implements ResponseValidator {
    public async validate(res: AxiosResponse): Promise<boolean> {
        if (res.status === 401) {
            throw new InvalidTokenError()
        }

        return true
    }
}