import nodemailer from "nodemailer"
import {Request, Response, NextFunction} from "express"
import path from "path"
import fs from "fs"
import crypto from "crypto"
import sql from "../sql/SQLQuery"
import functions from "../structures/Functions"
import {render} from "@react-email/components"
import S3 from "aws-sdk/clients/s3"
import phash from "sharp-phash"
import dist from "sharp-phash/distance"
import CSRF from "csrf"
import jwt from "jsonwebtoken"

const csrf = new CSRF()

let local = process.env.MOEPICTURES_LOCAL
let localR18 = process.env.MOEPICTURES_LOCAL_R18
let localUnverified = process.env.MOEPICTURES_LOCAL_UNVERIFIED

const s3 = new S3({region: "us-east-1", credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!
}})

export const keyGenerator = (req: Request, res: Response) => {
    return req.session.username || req.ip
}

export const handler = (req: Request, res: Response) => {
    req.session.captchaNeeded = true
    return res.status(429).send("Too many requests, try again later.")
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.username) return res.status(403).send("Unauthorized")
    if (!ServerFunctions.validateCSRF(req)) return res.status(400).send("Bad CSRF token")
    const token = req.headers["authorization"]?.split(" ")[1]
    if (!token) return res.status(401).send("Invalid token")

    jwt.verify(token, process.env.ACCESS_SECRET!, (err, session: any) => {
        if (err) return res.status(401).send("Invalid token")
        if (req.session.username !== session.username) return res.status(403).send("Bad request")
        next()
    })
}

export default class ServerFunctions {
    public static generateCSRF = () => {
        const secret = csrf.secretSync()
        const token = csrf.create(secret)
        return {secret, token}
    }

    public static validateCSRF = (req: Request) => {
        const csrfToken = req.headers["x-csrf-token"] as string
        return csrf.verify(req.session.csrfSecret!, csrfToken)
    }

    public static generateAccessToken = (req: Request) => {
        const session = {username: req.session.username, role: req.session.role}
        return jwt.sign(session, process.env.ACCESS_SECRET!, {expiresIn: "24h"})
    }

    public static generateRefreshToken = (req: Request) => {
        const session = {username: req.session.username, role: req.session.role}
        return jwt.sign(session, process.env.REFRESH_SECRET!, {expiresIn: "30d"})
    }

    public static email = async (email: string, subject: string, jsx: React.ReactElement) => {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_ADDRESS,
              pass: process.env.EMAIL_PASSWORD,
            }
        })
        const html = await render(jsx)
        return transporter.sendMail({
            from: {name: "Moepictures", address: process.env.EMAIL_ADDRESS},
            to: email,
            subject: subject,
            html
        })
    }

    public static contactEmail = async (email: string, subject: string, message: string, attachments?: any[]) => {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_ADDRESS,
              pass: process.env.EMAIL_PASSWORD,
            }
        })
        return transporter.sendMail({
            from: {name: "Moepictures", address: process.env.EMAIL_ADDRESS},
            to: process.env.EMAIL_ADDRESS,
            replyTo: email,
            subject: subject,
            text: message,
            attachments
        })
    }

    public static systemMessage = async (username: string, subject: string, message: string) => {
        const userMessages = await sql.message.userMessages(username)
        if (userMessages[0]?.creator === "moepictures" && userMessages[0]?.title === subject && userMessages[0]?.content === message) {
            const timeDifference = new Date().getTime() - new Date(userMessages[0].createDate).getTime()
            if (timeDifference < 10000) return
        }
        await sql.message.insertMessage("moepictures", username, subject, message)
    }

    public static getFirstHistoryFile = async (file: string, r18: boolean) => {
        const defaultBuffer = Buffer.from("")
        if (file.includes("artist") || file.includes("character") || file.includes("series") || file.includes("pfp")) {
            if (functions.isLocalHost()) {
                let folder = r18 ? localR18 : local
                const id = file.split("-")?.[0]?.match(/\d+/)?.[0]
                if (!id) return defaultBuffer
                const historyFolder = `${folder}/history/post/${id}`
                if (!fs.existsSync(historyFolder)) return defaultBuffer
                let folders = fs.readdirSync(historyFolder)
                if (!folders.length) return defaultBuffer
                folders = folders.sort(new Intl.Collator(undefined, {numeric: true, sensitivity: "base"}).compare)
                const firstHistory = `${folder}/history/tag/${id}/${folders[0]}`
                let files = fs.readdirSync(firstHistory)
                if (!files.length) return defaultBuffer
                files = files.sort(new Intl.Collator(undefined, {numeric: true, sensitivity: "base"}).compare)
                const firstFile = `${folder}/history/tag/${id}/${folders[0]}/${files[0]}`
                return fs.readFileSync(firstFile)
            } else {
                return defaultBuffer
            }
        } else {
            if (functions.isLocalHost()) {
                let folder = r18 ? localR18 : local
                const id = file.split("-")?.[0]?.match(/\d+/)?.[0]
                if (!id) return defaultBuffer
                const historyFolder = `${folder}/history/post/${id}`
                if (!fs.existsSync(historyFolder)) return defaultBuffer
                let folders = fs.readdirSync(historyFolder)
                if (!folders.length) return defaultBuffer
                folders = folders.sort(new Intl.Collator(undefined, {numeric: true, sensitivity: "base"}).compare)
                const firstHistory = `${folder}/history/post/${id}/${folders[0]}`
                let files = fs.readdirSync(firstHistory)
                if (!files.length) return defaultBuffer
                files = files.sort(new Intl.Collator(undefined, {numeric: true, sensitivity: "base"}).compare)
                const firstFile = `${folder}/history/post/${id}/${folders[0]}/${files[0]}`
                return fs.readFileSync(firstFile)
            } else {
                return defaultBuffer
            }
        }
    }

    public static getFile = async (file: string, upscaled: boolean, r18: boolean) => {
        if (functions.isLocalHost()) {
            let folder = r18 ? localR18 : local
            let originalKey = `${folder}/${decodeURIComponent(file)}`
            let upscaledKey = `${folder}/${decodeURIComponent(`${file.split("/")[0]}-upscaled/${file.split("/")[1]}`)}`
            if (!fs.existsSync(upscaled ? upscaledKey : originalKey)) return ServerFunctions.getFirstHistoryFile(file, r18)
            if (upscaled) return fs.existsSync(upscaledKey) ? fs.readFileSync(upscaledKey) : Buffer.from("")
            return fs.existsSync(originalKey) ? fs.readFileSync(originalKey) : Buffer.from("")
        }
        return s3.getObject({Key: decodeURIComponent(file), Bucket: "moepictures"}).promise().then((r) => r.Body) as unknown as Buffer
    }

    public static uploadFile = async (file: string, content: any, r18: boolean) => {
        if (functions.isLocalHost()) {
            let folder = r18 ? localR18 : local
            const dir = path.dirname(`${folder}/${file}`)
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true})
            fs.writeFileSync(`${folder}/${file}`, content)
            return `${folder}/${file}`
        }
        const upload = await s3.upload({Body: content, Key: file, Bucket: "moepictures"}).promise()
        return upload.Location
    }

    public static deleteFile = async (file: string, r18: boolean) => {
        if (functions.isLocalHost()) {
            try {
                let folder = r18 ? localR18 : local
                fs.unlinkSync(`${folder}/${file}`)
            } catch {}
            return
        }
        await s3.deleteObject({Key: file, Bucket: "moepictures"}).promise()
    }

    public static deleteIfEmpty = async (folderPath: string, r18: boolean) => {
        if (functions.isLocalHost()) {
            try {
                let folder = r18 ? localR18 : local
                fs.rmdirSync(`${folder}/${folderPath}`)
            } catch {}
            return
        }
    }

    public static deleteFolder = async (folderPath: string, r18: boolean) => {
        if (functions.isLocalHost()) {
            let folder = r18 ? localR18 : local
            const dir = `${folder}/${folderPath}`
            return ServerFunctions.removeLocalDirectory(dir)
        }
        const listedObjects = await s3.listObjectsV2({Bucket: "moepictures", Prefix: folderPath}).promise()
        if (listedObjects.Contents?.length === 0) return
    
        const deleteParams = {Bucket: "moepictures", Delete: {Objects: [] as any}}
    
        listedObjects.Contents?.forEach(({Key}) => {
            deleteParams.Delete.Objects.push({Key});
        })
        await s3.deleteObjects(deleteParams).promise()
        if (listedObjects.IsTruncated) await ServerFunctions.deleteFolder(folderPath, r18)
    }

    public static renameFile = async (oldFile: string, newFile: string, oldR18: boolean, newR18: boolean) => {
        if (functions.isLocalHost()) {
            let oldFolder = oldR18 ? localR18 : local
            let newFolder = newR18 ? localR18 : local
            try {
                fs.renameSync(`${oldFolder}/${oldFile}`, `${newFolder}/${newFile}`)
            } catch {}
            return
        }
        try {
            await s3.copyObject({CopySource: `moepictures/${oldFile}`, Key: newFile, Bucket: "moepictures"}).promise()
        } catch {
            await s3.copyObject({CopySource: `moepictures/${encodeURI(oldFile)}`, Key: newFile, Bucket: "moepictures"}).promise()
        }
        await s3.deleteObject({Key: oldFile, Bucket: "moepictures"}).promise()
    }

    public static renameFolder = async (oldFolder: string, newFolder: string, r18: boolean) => {
        if (functions.isLocalHost()) {
            let folder = r18 ? localR18 : local
            try {
                fs.renameSync(`${folder}/${oldFolder}`, `${folder}/${newFolder}`)
            } catch {
                fs.renameSync(`${folder}/${encodeURI(oldFolder)}`, `${folder}/${encodeURI(newFolder)}`)
            }
            return
        }
        try {
            const listedObjects = await s3.listObjectsV2({Bucket: "moepictures", Prefix: `${oldFolder}/`}).promise()
    
            if (listedObjects.Contents?.length === 0) return
            const renamePromises = listedObjects.Contents!.map(async (obj) => {
                const oldKey = obj.Key 
                if (!oldKey) return
                const newKey = oldKey.replace(`${oldFolder}/`, `${newFolder}/`)
                try {
                    await s3.copyObject({CopySource: `moepictures/${oldKey}`, Key: newKey, Bucket: "moepictures"}).promise()
                } catch {
                    await s3.copyObject({CopySource: `moepictures/${encodeURI(oldKey)}`, Key: newKey, Bucket: "moepictures"}).promise()
                }
                await s3.deleteObject({Key: oldKey, Bucket: "moepictures"}).promise()
            })
            await Promise.all(renamePromises)
        } catch (error) {
            console.error("Error renaming folder in S3:", error)
        }
    }

    public static getNextKey = async (type: string, name: string, r18: boolean) => {
        const key = `history/${type}/${name}`
        if (functions.isLocalHost()) {
            let folder = r18 ? localR18 : local
            if (!fs.existsSync(`${folder}/${key}`)) return 1
            const objects = fs.readdirSync(`${folder}/${key}`)
            let nextKey = 0
            for (let i = 0; i < objects.length; i++) {
                const object = objects[i]
                if (!object) continue
                const keyMatch = object.replace(key, "").match(/\d+/)?.[0]
                const keyNumber = Number(keyMatch)
                if (keyNumber >= nextKey) nextKey = keyNumber
            }
            return nextKey + 1
        }
        const objects = await s3.listObjects({Prefix: key, Bucket: "moepictures"}).promise()
        let nextKey = 0
        for (let i = 0; i < (objects.Contents || []).length; i++) {
            const object = objects.Contents?.[i]
            if (!object) continue
            const keyMatch = object.Key?.replace(key, "").match(/\d+/)?.[0]
            const keyNumber = Number(keyMatch)
            if (keyNumber >= nextKey) nextKey = keyNumber
        }
        return nextKey + 1
    }

    public static getUnverifiedFile = async (file: string, upscaled?: boolean) => {
        if (functions.isLocalHost()) {
            let originalKey = `${localUnverified}/${decodeURIComponent(file)}`
            let upscaledKey = `${localUnverified}/${decodeURIComponent(`${file.split("/")[0]}-upscaled/${file.split("/")[1]}`)}`
            if (upscaled) return fs.existsSync(upscaledKey) ? fs.readFileSync(upscaledKey) : Buffer.from("")
            return fs.existsSync(originalKey) ? fs.readFileSync(originalKey) : Buffer.from("")
        }
        return s3.getObject({Key: decodeURIComponent(file), Bucket: "moepictures-unverified"}).promise().then((r) => r.Body) as unknown as Buffer
    }

    public static uploadUnverifiedFile = async (file: string, content: any) => {
        if (functions.isLocalHost()) {
            const dir = path.dirname(`${localUnverified}/${file}`)
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true})
            fs.writeFileSync(`${localUnverified}/${file}`, content)
            return `${localUnverified}/${file}`
        }
        const upload = await s3.upload({Body: content, Key: file, Bucket: "moepictures-unverified"}).promise()
        return upload.Location
    }

    public static deleteUnverifiedFile = async (file: string) => {
        if (functions.isLocalHost()) {
            const dir = path.dirname(`${localUnverified}/${file}`)
            try {
                fs.unlinkSync(`${localUnverified}/${file}`)
                //fs.rmdirSync(dir)
            } catch {}
            return
        }
        await s3.deleteObject({Key: file, Bucket: "moepictures-unverified"}).promise()
    }

    public static tagCategories = async (tags: string[]) => {
        let result = await sql.tag.tags(tags.filter(Boolean))
        let artists = [] as any 
        let characters = [] as any 
        let series = [] as any 
        let newTags = [] as any
        for (let i = 0; i < tags.length; i++) {
            const index = result.findIndex((r: any) => tags[i] === r.tag)
            const obj = {} as any 
            obj.tag = tags[i]
            obj.image = result[index].image
            obj.description = result[index].description 
            obj.social = result[index].social
            obj.twitter = result[index].twitter
            obj.website = result[index].website
            obj.fandom = result[index].fandom
            if (result[index].type === "artist") {
                artists.push(obj)
            } else if (result[index].type === "character") {
                characters.push(obj)
            } else if (result[index].type === "series") {
                series.push(obj)
            } else {
                newTags.push(obj)
            }
        }
        return {artists, characters, series, tags: newTags}
    }

    public static unverifiedTagCategories = async (tags: any[]) => {
        let result = await sql.tag.unverifiedTags(tags.filter(Boolean))
        let artists = [] as any 
        let characters = [] as any 
        let series = [] as any 
        let newTags = [] as any
        for (let i = 0; i < tags.length; i++) {
            const index = result.findIndex((r: any) => tags[i] === r.tag)
            const obj = {} as any 
            obj.tag = tags[i]
            obj.image = result[index].image 
            obj.description = result[index].description 
            if (result[index].type === "artist") {
                artists.push(obj)
            } else if (result[index].type === "character") {
                characters.push(obj)
            } else if (result[index].type === "series") {
                series.push(obj)
            } else {
                newTags.push(obj)
            }
        }
        return {artists, characters, series, tags: newTags}
    }

    public static imagesChanged = async (oldImages: any[], currentImages: any[], upscaled: boolean, r18: boolean) => {
        if (oldImages?.length !== currentImages?.length) return true
        for (let i = 0; i < oldImages.length; i++) {
            const oldImage = oldImages[i]
            let oldPath = ""
            if (upscaled) {
                oldPath = functions.getUpscaledImagePath(oldImage.type, oldImage.postID, oldImage.order, oldImage.filename)
            } else {
                oldPath = functions.getImagePath(oldImage.type, oldImage.postID, oldImage.order, oldImage.filename)
            }
            const oldBuffer = await ServerFunctions.getFile(oldPath, false, r18) as any
            if (!oldBuffer) continue
            const currentImage = currentImages[i]
            const currentBuffer = Buffer.from(currentImage.bytes) as any
            const imgMD5 = crypto.createHash("md5").update(oldBuffer).digest("hex")
            const currentMD5 = crypto.createHash("md5").update(currentBuffer).digest("hex")
            if (imgMD5 !== currentMD5) return true
        }
        return false
    }

    public static imagesChangedUnverified = async (oldImages: any[], currentImages: any[], upscaled: boolean, r18: boolean) => {
        if (oldImages?.length !== currentImages?.length) return true
        for (let i = 0; i < oldImages.length; i++) {
            const oldImage = oldImages[i]
            let oldPath = ""
            if (upscaled) {
                oldPath = functions.getUpscaledImagePath(oldImage.type, oldImage.postID, oldImage.order, oldImage.filename)
            } else {
                oldPath = functions.getImagePath(oldImage.type, oldImage.postID, oldImage.order, oldImage.filename)
            }
            const oldBuffer = await ServerFunctions.getFile(oldPath, false, r18) as any
            if (!oldBuffer) continue
            const currentImage = currentImages[i]
            let currentPath = ""
            if (upscaled) {
                currentPath = functions.getUpscaledImagePath(currentImage.type, currentImage.postID, currentImage.order, currentImage.filename)
            } else {
                currentPath = functions.getImagePath(currentImage.type, currentImage.postID, currentImage.order, currentImage.filename)
            }
            const currentBuffer = await ServerFunctions.getUnverifiedFile(currentPath, false) as any
            if (!currentBuffer) continue
            const imgMD5 = crypto.createHash("md5").update(oldBuffer).digest("hex")
            const currentMD5 = crypto.createHash("md5").update(currentBuffer).digest("hex")
            if (imgMD5 !== currentMD5) return true
        }
        return false
    }

    public static buffersChanged = (oldBuffer: Buffer, currentBuffer: Buffer) => {
        if (!oldBuffer && !currentBuffer) return false
        if (!oldBuffer && currentBuffer) return true
        const imgMD5 = crypto.createHash("md5").update(oldBuffer as any).digest("hex")
        const currentMD5 = crypto.createHash("md5").update(currentBuffer as any).digest("hex")
        if (imgMD5 !== currentMD5) return true
        return false
    }

    public static migratePost = async (post: any, oldR18: boolean, newR18: boolean) => {
        if (oldR18 === newR18) return
        for (let i = 0; i < post.images.length; i++) {
            const imagePath = functions.getImagePath(post.images[i].type, post.postID, post.images[i].order, post.images[i].filename)
            const upscaledImagePath = functions.getUpscaledImagePath(post.images[i].type, post.postID, post.images[i].order, post.images[i].filename) 
            ServerFunctions.renameFile(imagePath, imagePath, oldR18, newR18)
            ServerFunctions.renameFile(upscaledImagePath, upscaledImagePath, oldR18, newR18)
        }
        ServerFunctions.renameFile(`history/post/${post.postID}`, `history/post/${post.postID}`, oldR18, newR18)
    }

    public static updateImplication = async (tag: string, implication: string) => {
        const posts = await sql.search.search([tag], "all", "all", "all", "date", "0", "9999999", true)
        for (const post of posts) {
            if (!post.tags.includes(implication)) {
                await sql.tag.insertTagMap(post.postID, [implication])
            }
        }
    }

    public static batchUpdateImplications = async () => {
        console.log("Updating all tag implications...")
        const posts = await sql.search.posts()
        for (let i = 0; i < posts.length; i++) {
            const postID = posts[i].postID
            let tagMap = posts[i].tags
            for (let i = 0; i < tagMap.length; i++) {
                const implications = await sql.tag.implications(tagMap[i])
                if (implications?.[0]) tagMap.push(...implications.map(((i: any) => i.implication)))
            }
            tagMap = functions.removeDuplicates(tagMap)
            await sql.tag.purgeTagMap(postID)
            await sql.tag.insertTagMap(postID, tagMap)
        }
        console.log("Done")
    }

    public static updateHashes = async () => {
        console.log("Updating all hashes...")
        const modelPosts = await sql.search.search([], "model", "all", "all", "date")
        const audioPosts = await sql.search.search([], "audio", "all", "all", "date")
        const posts = [...modelPosts, ...audioPosts]
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i]
            for (let j = 0; j < post.images.length; j++) {
                const image = post.images[j]
                const imgPath = functions.getImagePath(image.type, post.postID, image.order, image.filename)
                console.log(imgPath)
                const buffer = await ServerFunctions.getFile(imgPath, false, false) as any
                const md5 = crypto.createHash("md5").update(buffer).digest("hex")
                console.log(md5)
                await sql.post.updateImage(image.imageID, "hash", md5)
            }
        }
        console.log("Done")
    }

    private static removeLocalDirectory = (dir: string) => {
        if (!fs.existsSync(dir)) return
        fs.readdirSync(dir).forEach((file) => {
            const current = path.join(dir, file)
            if (fs.lstatSync(current).isDirectory()) {
                ServerFunctions.removeLocalDirectory(current)
            } else {
                fs.unlinkSync(current)
            }
        })
        try {
            fs.rmdirSync(dir)
        } catch (error) {
            console.log(error)
        }
    }
}