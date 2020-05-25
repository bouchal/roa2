import TokenStorage from "../interfaces/TokenStorage"
import {Roa2Token} from "../../Roa2Authenticator";

export default class MemoryTokenStorage implements TokenStorage {
    protected savedToken?: Roa2Token

    constructor() {
    }

    public async save(token: Roa2Token) {
        this.savedToken = token
    }

    public async get(): Promise<Roa2Token | undefined> {
        return this.savedToken
    }

    public async revoke(): Promise<void> {
        this.savedToken = undefined
    }
}