export interface EmailToken {
    email: string
    token: string
    expires: string
}

export interface $2FAToken {
    username: string
    token: string
    qrcode: string
}

export interface PasswordToken {
    username: string
    token: string
    expires: string
}

export interface IPToken {
    username: string
    token: string
    ip: string
    expires: string
}

export interface APIKey {
    username: string
    createDate: string
    key: string
}

export type TokenPostEndpoint<T extends string> = 
    T extends "/api/2fa/create" ? {params: null, response: string} :
    T extends "/api/2fa/qr" ? {params: null, response: string} :
    T extends "/api/2fa/enable" ? {params: {token: string}, response: string} :
    T extends "/api/2fa" ? {params: {token: string}, response: string} :
    never

export type TokenDeleteEndpoint<T extends string> = 
    T extends "/api/2fa/delete" ? {params: null, response: string} :
    never