import {Group, GroupChanges, Post, Tag, TagChanges} from "./Types"

export interface DeleteRequest {
    requestID: string
    username: string
    postID: string | null
    tag: string | null
    group: string | null
    groupPost: string | null
    reason: string | null
}

export interface PostDeleteRequest extends DeleteRequest {
    postID: string
    requestCount: string
    post: Post
}

export interface TagDeleteRequest extends Tag, DeleteRequest {
    tag: string
    requestCount: string
}

export interface GroupDeleteRequest extends Group, DeleteRequest {
    group: string
    post: Post
    requestCount: string
}

export interface GroupPostDeleteRequest extends DeleteRequest {
    groupPost: string
}

export interface AliasRequest extends Tag {
    requestID: string
    username: string
    tag: string
    aliasTo: string
    reason: string | null
    requestCount: string
}

export interface TagEditRequest extends Omit<Tag, "aliases" | "implications"> {
    requestID: string
    username: string
    key: string
    reason: string | null
    imageChanged: boolean
    changes: TagChanges
    aliases: string[]
    implications: string[]
    requestCount: string
}

export interface GroupRequest {
    requestID: string
    username: string
    postID: string
    name: string
    slug: string
    post: Post
    exists: boolean
    reason: string | null
    requestCount: string
}

export interface GroupEditRequest {
    requestID: string
    username: string
    group: string
    name: string
    description: string
    reason: string | null
    addedPosts: string[]
    removedPosts: string[]
    orderChanged: boolean
    changes: GroupChanges
    requestCount: string
}