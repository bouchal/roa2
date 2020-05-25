import CodeVerifier from "./CodeVerifier"

export default class AuthorizationCodeBases {
    constructor(public readonly authorizationUrl: string, public readonly codeVerifier?: CodeVerifier) {}
}