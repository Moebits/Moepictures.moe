import {Express, NextFunction, Request, Response} from "express"
import rateLimit from "express-rate-limit"
import slowDown from "express-slow-down"
import sql from "../sql/SQLQuery"
import functions from "../structures/Functions"
import permissions from "../structures/Permissions"
import path from "path"
import sharp from "sharp"
import phash from "sharp-phash"
import serverFunctions, {csrfProtection, keyGenerator, handler} from "../structures/ServerFunctions"

const translationLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 300,
	message: "Too many requests, try again later.",
	standardHeaders: true,
	legacyHeaders: false,
    keyGenerator,
    handler
})

const TranslationRoutes = (app: Express) => {
    app.post("/api/translation/save", csrfProtection, translationLimiter, async (req: Request, res: Response) => {
        try {
            const {postID, order, data, reason} = req.body
            if (Number.isNaN(Number(postID))) return res.status(400).send("Invalid postID")
            if (Number.isNaN(Number(order)) || Number(order) < 1) return res.status(400).send("Invalid order")
            if (!req.session.username) return res.status(403).send("Unauthorized")
            if (!permissions.isContributor(req.session)) return res.status(403).send("Unauthorized")
            if (req.session.banned) return res.status(403).send("You are banned")
            if (!data) return res.status(400).send("Bad data")

            const post = await sql.post.post(postID)
            if (!post) return res.status(400).send("Invalid post ID")
            if (post.locked && !permissions.isMod(req.session)) return res.status(403).send("Unauthorized")

            const translation = await sql.translation.translation(postID, order)
            if (!translation) {
                if (JSON.stringify(data) === "[]") return res.status(200).send("Success")
                await sql.translation.insertTranslation(postID, req.session.username, order, JSON.stringify(data))
            } else {
                if (JSON.stringify(data) === "[]") {
                    await sql.translation.deleteTranslation(translation.translationID)
                } else {
                    await sql.translation.updateTranslation(translation.translationID, req.session.username, JSON.stringify(data))
                }
            }
            await sql.history.insertTranslationHistory(postID, order, req.session.username, JSON.stringify(data), reason)
            res.status(200).send("Success")
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request")
        }
    })

    app.put("/api/translation/save", csrfProtection, translationLimiter, async (req: Request, res: Response) => {
        try {
            const {postID, order, data} = req.body
            if (Number.isNaN(Number(postID))) return res.status(400).send("Invalid postID")
            if (Number.isNaN(Number(order)) || Number(order) < 1) return res.status(400).send("Invalid order")
            if (!req.session.username) return res.status(403).send("Unauthorized")
            if (req.session.banned) return res.status(403).send("You are banned")
            if (!data) return res.status(400).send("Bad data")

            const post = await sql.post.post(postID)
            if (!post) return res.status(400).send("Invalid post ID")
            if (post.locked && !permissions.isMod(req.session)) return res.status(403).send("Unauthorized")

            const translation = await sql.translation.translation(postID, order)
            if (!translation) {
                if (JSON.stringify(data) === "[]") return res.status(200).send("Success")
                await sql.translation.insertTranslation(postID, req.session.username, order, JSON.stringify(data))
            } else {
                if (JSON.stringify(data) === "[]") {
                    await sql.translation.deleteTranslation(translation.translationID)
                } else {
                    await sql.translation.updateTranslation(translation.translationID, req.session.username, JSON.stringify(data))
                }
            }
            await sql.history.insertTranslationHistory(postID, order, req.session.username, JSON.stringify(data), "")
            res.status(200).send("Success")
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request")
        }
    })

    app.get("/api/translations", translationLimiter, async (req: Request, res: Response) => {
        try {
            const postID = req.query.postID
            if (Number.isNaN(Number(postID))) return res.status(400).send("Invalid postID")
            const translations = await sql.translation.translations(Number(postID))
            res.status(200).json(translations)
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request")
        }
    })

    app.post("/api/translation/save/request", csrfProtection, translationLimiter, async (req: Request, res: Response) => {
        try {
            let {postID, order, data, reason} = req.body
            if (Number.isNaN(Number(postID))) return res.status(400).send("Invalid postID")
            if (Number.isNaN(Number(order)) || Number(order) < 1) return res.status(400).send("Invalid order")
            if (!req.session.username) return res.status(403).send("Unauthorized")
            if (!data) return res.status(400).send("Bad data")

            const originalPostID = postID as any
            const post = await sql.post.post(originalPostID)
            if (!post) return res.status(400).send("Invalid post ID")
            if (post.locked && !permissions.isMod(req.session)) return res.status(403).send("Unauthorized")
            postID = await sql.post.insertUnverifiedPost()

            const categories = await serverFunctions.tagCategories(post.tags)
            let artists = categories.artists.map((a: any) => a.tag)
            let characters = categories.characters.map((c: any) => c.tag)
            let series = categories.series.map((s: any) => s.tag)
            let tags = categories.tags.map((t: any) => t.tag)
            let type = post.type
            let restrict = post.restrict
            let style = post.style
            let source = {
                title: post.title,
                translatedTitle: post.translatedTitle,
                artist: post.artist,
                drawn: post.drawn ? functions.formatDate(new Date(post.drawn), true) : null as any,
                link: post.link,
                commentary: post.commentary,
                translatedCommentary: post.translatedCommentary,
                bookmarks: post.bookmarks,
                purchaseLink: post.purchaseLink,
                mirrors: post.mirrors ? Object.values(post.mirrors).join("\n") : null
            }

            if (post.thirdParty) {
                const thirdPartyID = await sql.post.parent(originalPostID).then((r) => r.parentID)
                await sql.post.insertUnverifiedThirdParty(postID, Number(thirdPartyID))
            }
            if (type !== "comic") type = "image"

            let hasOriginal = false
            let hasUpscaled = false
            let originalCheck = [] as string[]
            let upscaledCheck = [] as string[]
            let r18 = post.restrict === "explicit"

            for (let i = 0; i < post.images.length; i++) {
                const imagePath = functions.getImagePath(post.images[i].type, originalPostID, post.images[i].order, post.images[i].filename)
                const buffer = await serverFunctions.getFile(imagePath, false, r18) as Buffer
                const upscaledImagePath = functions.getUpscaledImagePath(post.images[i].type, originalPostID, post.images[i].order, post.images[i].filename)
                const upscaledBuffer = await serverFunctions.getFile(upscaledImagePath, false, r18) as Buffer

                let current = upscaledBuffer ? upscaledBuffer : buffer
                let order = i + 1
                const ext = path.extname(post.images[i].filename).replace(".", "")
                let fileOrder = post.images.length > 1 ? `${order}` : "1"
                const filename = post.title ? `${post.title}.${ext}` : 
                characters[0] !== "unknown-character" ? `${characters[0]}.${ext}` :
                `${postID}.${ext}`
                let kind = "image" as any
                if (type === "comic") {
                    kind = "comic"
                } else if (ext === "jpg" || ext === "png" || ext === "avif") {
                    kind = "image"
                } else if (ext === "webp") {
                    const animated = functions.isAnimatedWebp(current)
                    if (animated) {
                        kind = "animation"
                    if (type !== "video") type = "animation"
                    } else {
                        kind = "image"
                    }
                } else if (ext === "gif") {
                    kind = "animation"
                    if (type !== "video") type = "animation"
                } else if (ext === "mp4" || ext === "webm") {
                    kind = "video"
                    type = "video"
                } else if (ext === "mp3" || ext === "wav") {
                    kind = "audio"
                    type = "audio"
                } else if (ext === "glb" || ext === "obj" || ext === "fbx") {
                    kind = "model"
                    type = "model"
                }
                if (buffer.byteLength) {
                    let newImagePath = functions.getImagePath(kind, postID, Number(fileOrder), filename)
                    await serverFunctions.uploadUnverifiedFile(newImagePath, buffer)
                    hasOriginal = true
                    originalCheck.push(newImagePath)
                }
                if (upscaledBuffer.byteLength) {
                    let newImagePath = functions.getUpscaledImagePath(kind, postID, Number(fileOrder), filename)
                    await serverFunctions.uploadUnverifiedFile(newImagePath, upscaledBuffer)
                    hasUpscaled = true
                    upscaledCheck.push(newImagePath)
                }
                let dimensions = null as any
                let hash = ""
                if (kind === "video" || kind === "audio" || kind === "model") {
                    const buffer = functions.base64ToBuffer(post.thumbnail)
                    hash = await phash(buffer).then((hash: string) => functions.binaryToHex(hash))
                    dimensions = await sharp(buffer).metadata()
                } else {
                    hash = await phash(current).then((hash: string) => functions.binaryToHex(hash))
                    dimensions = await sharp(current).metadata()
                }
                await sql.post.insertUnverifiedImage(postID, filename, type, order, hash, dimensions.width, dimensions.height, String(current.byteLength))
            }
            if (upscaledCheck?.length > originalCheck?.length) hasOriginal = false
            if (originalCheck?.length > upscaledCheck?.length) hasUpscaled = false
    
            const updatedDate = new Date().toISOString()
            await sql.post.bulkUpdateUnverifiedPost(postID, {
                originalID: originalPostID ? originalPostID : null,
                reason: reason ? reason : null,
                type,
                restrict, 
                style, 
                thirdParty: post.thirdParty,
                title: source.title ? source.title : null,
                translatedTitle: source.translatedTitle ? source.translatedTitle : null,
                artist: source.artist ? source.artist : null,
                drawn: source.drawn ? source.drawn : null,
                link: source.link ? source.link : null,
                commentary: source.commentary ? source.commentary : null,
                translatedCommentary: source.translatedCommentary ? source.translatedCommentary : null,
                bookmarks: source.bookmarks ? source.bookmarks : null,
                purchaseLink: source.purchaseLink ? source.purchaseLink : null,
                mirrors: source.mirrors ? functions.mirrorsJSON(source.mirrors) : null,
                uploader: post.uploader,
                uploadDate: post.uploadDate,
                updatedDate,
                hasOriginal,
                hasUpscaled,
                updater: req.session.username
            })

            let tagMap = [] as any
            let bulkTagUpdate = [] as any
    
            for (let i = 0; i < artists.length; i++) {
                if (!artists[i]) continue
                let bulkObj = {tag: artists[i], type: "artist", description: "Artist.", image: null} as any
                const existingTag = await sql.tag.tag(artists[i])
                if (existingTag) {
                    if (existingTag.description) bulkObj.description = existingTag.description
                    if (existingTag.image) {
                        const imagePath = functions.getTagPath("artist", existingTag.image)
                        const buffer = await serverFunctions.getFile(imagePath, false, false)
                        await serverFunctions.uploadUnverifiedFile(imagePath, buffer)
                        bulkObj.image = existingTag.image
                    }
                }
                bulkTagUpdate.push(bulkObj)
                tagMap.push(artists[i])
            }
            
            for (let i = 0; i < characters.length; i++) {
                if (!characters[i]) continue
                let bulkObj = {tag: characters[i], type: "character", description: "Character.", image: null} as any
                const existingTag = await sql.tag.tag(characters[i])
                if (existingTag) {
                    if (existingTag.description) bulkObj.description = existingTag.description
                    if (existingTag.image) {
                        const imagePath = functions.getTagPath("character", existingTag.image)
                        const buffer = await serverFunctions.getFile(imagePath, false, false)
                        await serverFunctions.uploadUnverifiedFile(imagePath, buffer)
                        bulkObj.image = existingTag.image
                    }
                }
                bulkTagUpdate.push(bulkObj)
                tagMap.push(characters[i])
            }

            for (let i = 0; i < series.length; i++) {
                if (!series[i]) continue
                let bulkObj = {tag: series[i], type: "series", description: "Series.", image: null} as any
                const existingTag = await sql.tag.tag(series[i])
                if (existingTag) {
                    if (existingTag.description) bulkObj.description = existingTag.description
                    if (existingTag.image) {
                        const imagePath = functions.getTagPath("series", existingTag.image)
                        const buffer = await serverFunctions.getFile(imagePath, false, false)
                        await serverFunctions.uploadUnverifiedFile(imagePath, buffer)
                        bulkObj.image = existingTag.image
                    }
                }
                bulkTagUpdate.push(bulkObj)
                tagMap.push(series[i])
            }

            for (let i = 0; i < tags.length; i++) {
                if (!tags[i]) continue
                let bulkObj = {tag: tags[i], type: functions.tagType(tags[i]), description: `${functions.toProperCase(tags[i]).replaceAll("-", " ")}.`, image: null} as any
                const existingTag = await sql.tag.tag(tags[i])
                if (existingTag) {
                    if (existingTag.description) bulkObj.description = existingTag.description
                    if (existingTag.image) {
                        const imagePath = functions.getTagPath("tag", existingTag.image)
                        const buffer = await serverFunctions.getFile(imagePath, false, false)
                        await serverFunctions.uploadUnverifiedFile(imagePath, buffer)
                        bulkObj.image = existingTag.image
                    }
                }
                bulkTagUpdate.push(bulkObj)
                tagMap.push(tags[i])
            }

            for (let i = 0; i < tagMap.length; i++) {
                const implications = await sql.tag.implications(tagMap[i])
                if (implications?.[0]) {
                    for (const i of implications) {
                      tagMap.push(i.implication)
                      const tag = await sql.tag.tag(i.implication)
                      bulkTagUpdate.push({tag: i.implication, type: functions.tagType(i.implication), description: tag?.description || null, image: tag?.image || null})
                    }
                }
            }
    
            tagMap = functions.removeDuplicates(tagMap)
            await sql.tag.purgeUnverifiedTagMap(postID)
            await sql.tag.bulkInsertUnverifiedTags(bulkTagUpdate, true)
            await sql.tag.insertUnverifiedTagMap(postID, tagMap)

            await sql.translation.insertUnverifiedTranslation(postID, originalPostID, req.session.username, order, JSON.stringify(data), reason)
            res.status(200).send("Success")
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request")
        }
    })

    app.get("/api/translations/unverified", translationLimiter, async (req: Request, res: Response) => {
        try {
            const postID = req.query.postID
            if (Number.isNaN(Number(postID))) return res.status(400).send("Invalid postID")
            if (!req.session.username) return res.status(403).send("Unauthorized")
            if (!permissions.isMod(req.session)) return res.status(403).end()
            const translations = await sql.translation.unverifiedPostTranslations(Number(postID))
            res.status(200).json(translations)
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request")
        }
    })

    app.put("/api/translation/save/unverified", csrfProtection, translationLimiter, async (req: Request, res: Response) => {
        try {
            const {postID, order, data, reason} = req.body
            if (Number.isNaN(Number(postID))) return res.status(400).send("Invalid postID")
            if (Number.isNaN(Number(order)) || Number(order) < 1) return res.status(400).send("Invalid order")
            if (!req.session.username) return res.status(403).send("Unauthorized")
            if (!permissions.isMod(req.session)) return res.status(403).end()
            if (!data) return res.status(400).send("Bad data")

            const translation = await sql.translation.unverifiedTranslation(postID, order)
            if (!translation) return res.status(400).send("Bad translation")
            await sql.translation.updateUnverifiedTranslation(translation.translationID, JSON.stringify(data), reason)
            res.status(200).send("Success")
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request")
        }
    })

    app.get("/api/translation/list/unverified", translationLimiter, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const offset = req.query.offset as string
            if (!req.session.username) return res.status(403).send("Unauthorized")
            if (!permissions.isMod(req.session)) return res.status(403).end()
            const result = await sql.translation.unverifiedTranslations(offset)
            res.status(200).json(result)
        } catch (e) {
            console.log(e)
            return res.status(400).send("Bad request")
        }
    })

    app.post("/api/translation/approve", csrfProtection, translationLimiter, async (req: Request, res: Response, next: NextFunction) => {
        try {
            let {translationID, username, postID} = req.body
            if (!req.session.username) return res.status(403).send("Unauthorized")
            translationID = Number(req.body.translationID)
            if (Number.isNaN(translationID)) return res.status(400).send("Bad translationID")
            if (!permissions.isMod(req.session)) return res.status(403).end()
            const unverified = await sql.post.unverifiedPost(Number(postID))
            if (!unverified) return res.status(400).send("Bad postID")
            await sql.post.deleteUnverifiedPost(Number(postID))
            for (let i = 0; i < unverified.images.length; i++) {
                const file = functions.getImagePath(unverified.images[i].type, unverified.postID, unverified.images[i].order, unverified.images[i].filename)
                await serverFunctions.deleteUnverifiedFile(file)
            }
            const unverifiedTranslation = await sql.translation.unverifiedTranslationID(Number(translationID))
            if (!unverifiedTranslation) return res.status(400).send("Bad translationID")
            await sql.translation.insertTranslation(unverifiedTranslation.originalID, unverified.updater, unverified.order, JSON.stringify(unverified.data))
            await sql.translation.deleteUnverifiedTranslation(Number(translationID))

            let message = `Translations you added on ${functions.getDomain()}/post/${postID} have been approved. Thanks for the contribution!`
            await serverFunctions.systemMessage(username, "Notice: Translations have been approved", message)

            res.status(200).send("Success")
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request")
        }
    })

    app.post("/api/translation/reject", csrfProtection, translationLimiter, async (req: Request, res: Response, next: NextFunction) => {
        try {
            let {translationID, username, postID} = req.body
            if (!req.session.username) return res.status(403).send("Unauthorized")
            translationID = Number(req.body.translationID)
            if (Number.isNaN(translationID)) return res.status(400).send("Bad translationID")
            if (!permissions.isMod(req.session)) return res.status(403).end()
            const unverified = await sql.post.unverifiedPost(Number(postID))
            if (!unverified) return res.status(400).send("Bad postID")
            await sql.post.deleteUnverifiedPost(Number(postID))
            for (let i = 0; i < unverified.images.length; i++) {
                const file = functions.getImagePath(unverified.images[i].type, unverified.postID, unverified.images[i].order, unverified.images[i].filename)
                await serverFunctions.deleteUnverifiedFile(file)
            }
            const unverifiedTranslation = await sql.translation.unverifiedTranslationID(Number(translationID))
            if (!unverifiedTranslation) return res.status(400).send("Bad translationID")
            await sql.translation.deleteUnverifiedTranslation(Number(translationID))

            let message = `Translations you added on ${functions.getDomain()}/post/${postID} have been rejected. They might be incorrect.`
            // await serverFunctions.systemMessage(username, "Notice: Translations have been rejected", message)
            
            res.status(200).send("Success")
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request")
        }
    })

    app.get("/api/translation/history", translationLimiter, async (req: Request, res: Response) => {
        try {
            const postID = req.query.postID as string
            const order = req.query.order as string
            const historyID = req.query.historyID as string
            const offset = req.query.offset as string
            if (!req.session.username) return res.status(403).send("Unauthorized")
            if (historyID) {
                const result = await sql.history.translationHistoryID(postID, historyID)
                res.status(200).json(result)
            } else {
                const result = await sql.history.translationHistory(postID, order, offset)
                res.status(200).json(result)
            }
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request")
        }
    })

    app.delete("/api/translation/history/delete", csrfProtection, translationLimiter, async (req: Request, res: Response) => {
        try {
            const postID = req.query.postID as string
            const order = req.query.order as string
            const historyID = req.query.historyID as string
            if (Number.isNaN(Number(historyID))) return res.status(400).send("Invalid historyID")
            if (!req.session.username) return res.status(403).send("Unauthorized")
            if (!permissions.isMod(req.session)) return res.status(403).end()
            const translationHistory = await sql.history.translationHistory(postID, order)
            if (translationHistory[0]?.historyID === historyID) {
                return res.status(400).send("Bad historyID")
            } else {
                await sql.history.deleteTranslationHistory(Number(historyID))
            }
            res.status(200).send("Success")
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request")
        }
    })
}

export default TranslationRoutes