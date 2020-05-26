import Roa2Token from "./models/Roa2Token"
import Roa2TokenFactory from "./factories/Roa2TokenFactory"
import ClientConfig from "./models/ClientConfig"
import AuthenticationError from "./errors/AuthenticationError"
import axios, {AxiosRequestConfig} from 'axios'
import * as qs from 'qs'
import AuthorizationCodeBases from "./models/AuthorizationCodeBases"
import CodeVerifierGenerator from "./helpers/CodeVerifierGenerator"

interface AuthConfig {
    /** String used to set the host to request the tokens to. Required. */
    tokenHost: string,
    /** String path to request an access token. Default to /oauth/token. */
    tokenPath?: string,
    /** String host to authorization. Default is same as tokenHost. */
    authorizationHost?: string
    /** String path to request an access token. Default to /authorize. */
    authorizationPath?: string,
}

export default class Roa2Authenticator {
    protected roa2TokenFactory: Roa2TokenFactory

    constructor(protected authConfig: AuthConfig, protected clientConfig: ClientConfig) {
        this.roa2TokenFactory = new Roa2TokenFactory()
    }

    /**
     * Generate token through "client_credentials" grant method.
     *
     * @param scope
     */
    public async getClientCredentialsToken(scope?: string | string[]): Promise<Roa2Token> {
        const data = {
            grant_type: 'client_credentials',
            client_id: this.clientConfig.clientId,
            client_secret: this.clientConfig.clientSecret,
            scope: Array.isArray(scope) ? scope.join(' ') : scope
        }

        return this.sendTokenRequest(data)
    }

    /**
     * Generate token through "password" grant method.
     *
     * @param username
     * @param password
     * @param scope
     */
    public async getPasswordToken(username: string, password: string, scope?: string | string[]): Promise<Roa2Token> {
        const data = {
            username,
            password,
            grant_type: 'password',
            client_id: this.clientConfig.clientId,
            client_secret: this.clientConfig.clientSecret,
            scope: Array.isArray(scope) ? scope.join(' ') : scope
        }

        return this.sendTokenRequest(data)
    }

    public async getRefreshToken(refreshToken: string): Promise<Roa2Token> {
        const data = {
            grant_type: 'refresh_token',
            client_id: this.clientConfig.clientId,
            client_secret: this.clientConfig.clientSecret,
            refresh_token: refreshToken
        }

        return this.sendTokenRequest(data)
    }

    public async getCodeToken(code: string, redirectUri: string, codeVerifier?: string): Promise<Roa2Token> {
        const data = {
            code,
            grant_type: 'authorization_code',
            client_id: this.clientConfig.clientId,
            client_secret: this.clientConfig.clientSecret,
            redirect_uri: redirectUri,
            ...(codeVerifier && {code_verifier: codeVerifier})
        }

        return this.sendTokenRequest(data)
    }

    protected async sendTokenRequest(formData: any): Promise<Roa2Token> {
        const authResponse = await this.sendAuthRequest(formData)

        if (authResponse.status === 200) {
            return this.roa2TokenFactory.createFromResponseJson(authResponse.data)
        }

        throw new AuthenticationError(authResponse.data.error, authResponse.data.error_description)
    }

    protected sendAuthRequest(formData: any): Promise<any> {
        const options: AxiosRequestConfig = {
            method: 'post',
            baseURL: this.authConfig.tokenHost,
            url: this.authConfig.tokenPath || '/oauth/token',
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            data: qs.stringify(formData),
            validateStatus: () => true
        }

        return axios(options)
    }

    public generateAuthorizationCodeBases(redirectUri: string, useCodeVerifier: boolean = true): AuthorizationCodeBases {
        const params: any = {
            response_type: 'code',
            client_id: this.clientConfig.clientId,
            redirect_uri: redirectUri,
        }

        let codeVerifier

        if (useCodeVerifier) {
            const codeVerifierGenerator = new CodeVerifierGenerator()

            codeVerifier = codeVerifierGenerator.generate()

            params['code_challenge_method'] = codeVerifier.challengeMethod
            params['code_challenge'] = codeVerifier.codeChallenge
        }



        const authorizationUrl = `${this.getAuthorizationUrl()}?${qs.stringify(params)}`

        return new AuthorizationCodeBases(
            authorizationUrl,
            codeVerifier
        )
    }

    protected getAuthorizationUrl(): string {
        return (this.authConfig.authorizationHost || this.authConfig.tokenHost) + (this.authConfig.authorizationPath || '/authorize')
    }
}