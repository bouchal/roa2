import {expect} from 'chai'
import Roa2ResponseValidator from "./Roa2ResponseValidator";
import InvalidTokenError from "../errors/InvalidTokenError";
import {AxiosResponse} from "axios";

const INVALID_TOKEN_RESPONSE = {
    status: 401,
    headers: {
        'content-type': 'application/json; charset=utf-8'
    },
    data: {
        "code": 401
    }
}

const VALID_RESPONSE = {
    status: 200,
    headers: {
        'content-type': 'application/json; charset=utf-8'
    },
    data: {
        "code": 200
    }
}

describe('Roa2ResponseValidator', function () {
    it('should throw invalid token error', async function() {
        const validator = new Roa2ResponseValidator()

        try {
            await validator.validate(INVALID_TOKEN_RESPONSE as AxiosResponse)
        } catch (e) {
            expect(e).to.be.instanceof(InvalidTokenError)
        }
    })

    it('shouldn\'t throw invalid token error', async function() {
        const validator = new Roa2ResponseValidator()

        try {
            await validator.validate(VALID_RESPONSE as AxiosResponse)
        } catch (e) {
            throw new Error('This shouldn\'t happen')
        }
    })
})