export enum ROA2_TOKEN_TYPES {
    BEARER = 'Bearer'
}

export default class Roa2Token {
    constructor(
        public accessToken: string,
        public tokenType: ROA2_TOKEN_TYPES,
        public expiresIn: number,
        public scope: string[],
        public refreshToken?: string
    ) {
    }
}