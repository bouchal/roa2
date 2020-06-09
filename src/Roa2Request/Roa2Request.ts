import Roa2RequestComponents from "./interfaces/Roa2RequestComponents"
import Roa2ResponseValidator from "./helpers/Roa2ResponseValidator"
import InvalidTokenError from "./errors/InvalidTokenError"
import ResponseValidator from "./interfaces/ResponseValidator"
import deepmerge from 'deepmerge'
import axios, {AxiosInstance, AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse} from "axios"
import Optional from "./helpers/Optional"
import TokenManager from "./helpers/TokenManager"

export interface Roa2RequestOptions extends AxiosRequestConfig {
    pathPrefix?: string
}

export interface Roa2Response<TBody = any> extends AxiosResponse<TBody> {
}

interface Interceptors {
    readonly request: AxiosInterceptorManager<AxiosRequestConfig>
    readonly response: AxiosInterceptorManager<AxiosResponse>
}

export default class Roa2Request {
    protected components: Roa2RequestComponents

    protected responseValidator: ResponseValidator

    protected defaultOptions: Roa2RequestOptions

    protected axios: AxiosInstance

    public readonly interceptors: Interceptors

    constructor(
        protected baseUrl: string,
        protected tokenManager?: TokenManager,
        defaultOptions?: Roa2RequestOptions,
        components?: Optional<Roa2RequestComponents>
    ) {
        this.components = {
            ...{
                responseValidator: new Roa2ResponseValidator(),
            },
            ...components
        }

        this.defaultOptions = defaultOptions || {}

        this.responseValidator = this.components.responseValidator

        this.axios = axios.create()

        this.interceptors = this.axios.interceptors
    }

    protected async runRequest<TBody = any>(method: string, path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        const mergedOptions = deepmerge(this.defaultOptions, options || {})

        const url = (mergedOptions.pathPrefix || '') + path

        const doRequest = async (invalidateStoredToken = false): Promise<AxiosResponse> => {
            let authorizationHeader

            if (this.tokenManager) {
                const token = await this.tokenManager.getToken(invalidateStoredToken)
                authorizationHeader = `${token.tokenType} ${token.accessToken}`
            }

            const options: AxiosRequestConfig = deepmerge({
                url,
                method,
                baseURL: this.baseUrl,
                headers: {
                    ...(authorizationHeader && {Authorization: authorizationHeader})
                },
                validateStatus: () => true
            }, mergedOptions)

            if (body) options.data = body
            if (parameters) options.params = parameters

            return new Promise((resolve, reject) => {
                this.axios(options).then(async (res: AxiosResponse) => {
                    try {
                        await this.responseValidator.validate(res)
                    } catch (e) {
                        // If token is rejected, we wanna regenerate it, but only once
                        if (e instanceof InvalidTokenError && !invalidateStoredToken) {
                            return doRequest(true)
                                .then((res) => resolve(res))
                                .catch((err) => reject(err))
                        }

                        return reject(e)
                    }

                    resolve(res)
                }).catch((err: Error) => reject(err))
            })
        }

        return doRequest()
    }

    public get<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('get', path, parameters, body, options)
    }

    public post<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('post', path, parameters, body, options)
    }

    public put<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('put', path, parameters, body, options)
    }

    public head<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('head', path, parameters, body, options)
    }

    public delete<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('delete', path, parameters, body, options)
    }

    public options<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('options', path, parameters, body, options)
    }

    public trace<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('trace', path, parameters, body, options)
    }

    public copy<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('copy', path, parameters, body, options)
    }

    public lock<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('lock', path, parameters, body, options)
    }

    public mkcol<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('mkcol', path, parameters, body, options)
    }

    public move<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('move', path, parameters, body, options)
    }

    public purge<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('purge', path, parameters, body, options)
    }

    public propfind<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('propfind', path, parameters, body, options)
    }

    public proppatch<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('proppatch', path, parameters, body, options)
    }

    public unlock<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('unlock', path, parameters, body, options)
    }

    public report<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('report', path, parameters, body, options)
    }

    public mkactivity<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('mkactivity', path, parameters, body, options)
    }

    public checkout<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('checkout', path, parameters, body, options)
    }

    public merge<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('merge', path, parameters, body, options)
    }

    // tslint:disable-next-line
    public 'm-search'<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('m-search', path, parameters, body, options)
    }

    public notify<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('notify', path, parameters, body, options)
    }

    public subscribe<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('subscribe', path, parameters, body, options)
    }

    public unsubscribe<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('unsubscribe', path, parameters, body, options)
    }

    public patch<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('patch', path, parameters, body, options)
    }

    public search<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('search', path, parameters, body, options)
    }

    /* istanbul ignore next */
    public connect<TBody = any>(path: string, parameters?: object | null, body?: any, options?: Roa2RequestOptions): Promise<Roa2Response<TBody>> {
        return this.runRequest<TBody>('connect', path, parameters, body, options)
    }

    public wrap(options: Roa2RequestOptions): Roa2Request {
        const mergedOptions = deepmerge(this.defaultOptions, options)

        return new Roa2Request(
            this.baseUrl,
            this.tokenManager,
            mergedOptions,
            this.components
        )
    }
}