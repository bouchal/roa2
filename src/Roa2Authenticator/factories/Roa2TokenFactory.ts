import Roa2Token from "../models/Roa2Token"

export default class Roa2TokenFactory {
    public createFromResponseJson(json: {[key: string]: any}) {
        return new Roa2Token(
            json.access_token,
            json.token_type,
            json.expires_in,
            this.scopeStringToArray(json.scope),
            json.refresh_token
        )
    }

    protected scopeStringToArray(scope?: string) {
        if (!scope) {
            return []
        }

        return scope.split(' ')
    }
}