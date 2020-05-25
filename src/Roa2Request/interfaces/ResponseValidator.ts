import {AxiosResponse} from "axios"

export default interface ResponseValidator {
    validate(res: AxiosResponse): Promise<boolean>
}