import TokenConfig from "../models/TokenConfig"
import TokenStorage from "../interfaces/TokenStorage"
import TokenClientCredentialsConfig from "../models/TokenClientCredentialsConfig"
import TokenPasswordConfig from "../models/TokenPasswordConfig"
import TokenRefreshConfig from "../models/TokenRefreshConfig"
import TokenCodeConfig from "../models/TokenCodeConfig"
import UnknownTokenConfigError from "../errors/UnknownTokenConfigError"
import MemoryTokenStorage from "../storages/MemoryTokenStorage"
import Roa2Authenticator, {Roa2Token} from "../../Roa2Authenticator";

export default class TokenManager {
    protected tokenLoadingPromise?: Promise<Roa2Token>

    constructor(
        protected readonly authenticator: Roa2Authenticator,
        protected tokenConfig: TokenConfig = new TokenClientCredentialsConfig(),
        protected readonly tokenStorage: TokenStorage = new MemoryTokenStorage()
    ) {

    }

    public async getToken(invalidateStored: boolean = false): Promise<Roa2Token> {
        if (invalidateStored) {
            await this.tokenStorage.revoke()
        }

        const storedToken = await this.tokenStorage.get()

        if (storedToken) {
            return storedToken
        }

        /**
         * Because we don't wanna request for new token multiple times when second request ask for token earlier
         * then first token loading is done, we return promise of original request.
         */
        if (this.tokenLoadingPromise) {
            return this.tokenLoadingPromise
        }

        // Save promise to memory.
        this.tokenLoadingPromise = this.loadNewToken()

        // Wait until new token is loaded
        const newToken = await this.tokenLoadingPromise

        // Delete promise
        this.tokenLoadingPromise = undefined

        // Return new token
        return newToken
    }

    protected async loadNewToken(): Promise<Roa2Token> {
        let newToken: Roa2Token | undefined = undefined

        if (this.tokenConfig instanceof TokenClientCredentialsConfig) {
            newToken = await this.authenticator.getClientCredentialsToken(this.tokenConfig.scope)
        }

        if (this.tokenConfig instanceof TokenPasswordConfig) {
            newToken = await this.authenticator.getPasswordToken(this.tokenConfig.username, this.tokenConfig.password, this.tokenConfig.scope)
        }

        if (this.tokenConfig instanceof TokenRefreshConfig) {
            newToken = await this.authenticator.getRefreshToken(this.tokenConfig.refreshToken)
        }

        if (this.tokenConfig instanceof TokenCodeConfig) {
            newToken = await this.authenticator.getCodeToken(this.tokenConfig.code, this.tokenConfig.redirectUri, this.tokenConfig.codeVerifier)
        }

        if (!newToken) {
            throw new UnknownTokenConfigError()
        }

        await this.tokenStorage.save(newToken)

        if (newToken.refreshToken) {
            this.tokenConfig = new TokenRefreshConfig(newToken.refreshToken)
        }

        return newToken
    }
}