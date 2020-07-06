import TokenStorage from "../interfaces/TokenStorage";
import Cookie from 'js-cookie'
import Roa2Token, {ROA2_TOKEN_TYPES} from "../../Roa2Authenticator/models/Roa2Token";

interface JsonToken {
    access_token: string,
    token_type: ROA2_TOKEN_TYPES,
    expires_in: number,
    refresh_token?: string,
    scope: string[]
}

export default class CookieTokenStorage implements TokenStorage {
    constructor(
        protected readonly COOKIE_KEY: string = 'ROA2_TOKEN',
        protected readonly domain?: string,
        protected readonly expires?: number | Date
    ) {
    }

    public async get(): Promise<Roa2Token | undefined> {
        const tokenJson = Cookie.getJSON(this.COOKIE_KEY)

        if (!tokenJson) {
            return undefined
        }

        return this.jsonToToken(
            tokenJson
        )
    }

    public async revoke(): Promise<void> {
        return Cookie.remove(this.COOKIE_KEY, {
            domain: this.domain
        })
    }

    public async save(token: Roa2Token): Promise<void> {
        Cookie.set(this.COOKIE_KEY, this.tokenToJson(token), {
            domain: this.domain,
            expires: this.expires
        })
    }

    protected tokenToJson(token: Roa2Token): JsonToken {
        return {
            access_token: token.accessToken,
            token_type: token.tokenType,
            expires_in: token.expiresIn,
            refresh_token: token.refreshToken,
            scope: token.scope
        }
    }

    protected jsonToToken(jsonToken: JsonToken): Roa2Token {
        return new Roa2Token(
            jsonToken.access_token,
            jsonToken.token_type,
            jsonToken.expires_in,
            jsonToken.scope,
            jsonToken.refresh_token
        )
    }

}