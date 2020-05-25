import {Roa2Token} from "../../Roa2Authenticator";


export default interface TokenStorage {
    save(token: Roa2Token): Promise<void>

    get(): Promise<Roa2Token | undefined>

    revoke(): Promise<void>
}