import {Roa2Token} from "../../Roa2Authenticator";
import TokenStorage from "../interfaces/TokenStorage";

export default class LocalStorageTokenStorage implements TokenStorage {
    constructor(protected key: string = 'ROA2_TOKEN') {
    }

    public async save(token: Roa2Token) {
        window.localStorage.setItem(this.key, JSON.stringify(token))
    }

    public async get(): Promise<Roa2Token | undefined> {
        const storedData = window.localStorage.getItem(this.key)

        if (!storedData) {
            return
        }

        let jsonToken: any

        try {
            jsonToken = JSON.parse(storedData)
        } catch (e) {
            return
        }

        return new Roa2Token(
            jsonToken.accessToken,
            jsonToken.tokenType,
            jsonToken.expiresIn,
            jsonToken.scope,
            jsonToken.refreshToken
        )
    }

    public async revoke(): Promise<void> {
        window.localStorage.removeItem(this.key)
    }
}