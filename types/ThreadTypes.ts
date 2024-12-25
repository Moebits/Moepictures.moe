import {UserRole} from "./Types"

export interface Thread {
    threadID: string
    creator: string
    createDate: string
    updater: string
    updatedDate: string
    sticky: boolean
    locked: boolean
    title: string
    content: string
    r18: boolean | null
    read?: boolean
    threadCount: string
}

export interface ThreadUser extends Thread {
    role: UserRole
    image: string | null
    imagePost: string | null
    imageHash: string | null
    banned: boolean | null 
    postCount: number
}

export interface ThreadSearch extends Thread {
    fake?: boolean
}

export interface Reply {
    replyID: string
    threadID: string
    creator: string
    createDate: string
    updatedDate: string
    content: string
    r18: boolean
    role: UserRole
    image: string | null
    imagePost: string | null
    imageHash: string | null
    banned: boolean | null
    replyCount: string
    postCount: number
}

export interface ThreadRead {
    threadID: string
    username: string
    read: boolean
}

export interface ThreadCreateParams {
    title: string
    content: string
    r18: boolean
}

export interface ThreadEditParams {
    threadID: string
    title: string
    content: string
    r18: boolean
}

export interface ThreadReplyParams {
    threadID: string
    content: string
    r18: boolean
}

export interface ReplyEditParams {
    replyID: string
    content: string
    r18: boolean
}

export interface ThreadReportFulfillParams {
    reportID: string 
    reporter: string 
    username: string 
    id: string 
    accepted: boolean
}

export type ThreadGetEndpoint<T extends string> = 
    T extends "/api/thread" ? {params: {threadID: string}, response: ThreadUser} :
    T extends "/api/thread/replies" ? {params: {threadID: string, offset?: number}, response: Reply[]} :
    T extends "/api/reply" ? {params: {replyID: string}, response: Reply} :
    never

export type ThreadPostEndpoint<T extends string> = 
    T extends "/api/thread/create" ? {params: ThreadCreateParams, response: string} :
    T extends "/api/thread/sticky" ? {params: {threadID: string}, response: string} :
    T extends "/api/thread/lock" ? {params: {threadID: string}, response: string} :
    T extends "/api/thread/reply" ? {params: ThreadReplyParams, response: string} :
    T extends "/api/thread/report" ? {params: {threadID: string, reason: string}, response: string} :
    T extends "/api/reply/report" ? {params: {replyID: string, reason: string}, response: string} :
    T extends "/api/thread/report/fulfill" ? {params: ThreadReportFulfillParams, response: string} :
    T extends "/api/reply/report/fulfill" ? {params: ThreadReportFulfillParams, response: string} :
    T extends "/api/thread/read" ? {params: {threadID: string, forceRead?: boolean}, response: string} :
    never

export type ThreadPutEndpoint<T extends string> = 
    T extends "/api/thread/edit" ? {params: ThreadEditParams, response: string} :
    T extends "/api/reply/edit" ? {params: ReplyEditParams, response: string} :
    never

export type ThreadDeleteEndpoint<T extends string> = 
    T extends "/api/thread/delete" ? {params: {threadID: string}, response: string} :
    T extends "/api/reply/delete" ? {params: {threadID: string, replyID: string}, response: string} :
    never