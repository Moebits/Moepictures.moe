import e, {Express, NextFunction, Request, Response} from "express"
import rateLimit from "express-rate-limit"
import slowDown from "express-slow-down"
import sql from "../sql/SQLQuery"
import functions from "../structures/Functions"
import permissions from "../structures/Permissions"
import serverFunctions, {csrfProtection, keyGenerator, handler} from "../structures/ServerFunctions"

const favoriteLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 300,
	standardHeaders: true,
	legacyHeaders: false,
    keyGenerator,
    handler
})

const FavoriteRoutes = (app: Express) => {
    app.post("/api/favorite/toggle", csrfProtection, favoriteLimiter, async (req: Request, res: Response) => {
        try {
            const {postID} = req.body
            if (Number.isNaN(Number(postID))) return res.status(400).send("Invalid postID")
            if (!req.session.username) return res.status(403).send("Unauthorized")
            const favorite = await sql.favorite.favorite(Number(postID), req.session.username)
            if (favorite) {
                await sql.favorite.deleteFavorite(Number(postID), req.session.username)
            } else {
                await sql.favorite.insertFavorite(Number(postID), req.session.username)
            }
            res.status(200).send("Success")
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request") 
        }
    })

    app.post("/api/favorite/update", csrfProtection, favoriteLimiter, async (req: Request, res: Response) => {
        try {
            const {postID, favorited} = req.body
            if (Number.isNaN(Number(postID))) return res.status(400).send("Invalid postID")
            if (!req.session.username) return res.status(403).send("Unauthorized")
            if (favorited == null) return res.status(400).send("Bad favorited")
            const favorite = await sql.favorite.favorite(Number(postID), req.session.username)
            if (favorited) {
                if (!favorite) await sql.favorite.insertFavorite(Number(postID), req.session.username)
            } else {
                if (favorite) await sql.favorite.deleteFavorite(Number(postID), req.session.username)
            }
            res.status(200).send("Success")
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request") 
        }
    })

    app.get("/api/favorite", favoriteLimiter, async (req: Request, res: Response) => {
        try {
            const postID = req.query.postID
            if (Number.isNaN(Number(postID))) return res.status(400).send("Invalid postID")
            if (!req.session.username) return res.status(403).send("Unauthorized")
            const favorite = await sql.favorite.favorite(Number(postID), req.session.username)
            res.status(200).send(favorite)
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request") 
        }
    })

    app.post("/api/favgroup/update", csrfProtection, favoriteLimiter, async (req: Request, res: Response) => {
        try {
            const {postID, name, isPrivate} = req.body
            if (Number.isNaN(Number(postID))) return res.status(400).send("Invalid postID")
            if (!req.session.username) return res.status(403).send("Unauthorized")
            const slug = functions.generateSlug(name)
            await sql.favorite.insertFavgroup(req.session.username, slug, name, isPrivate)
            try {
                const favgroup = await sql.favorite.favgroup(req.session.username, slug)
                if (!favgroup) {
                    await sql.favorite.insertFavgroupPost(req.session.username, slug, Number(postID), 1)
                } else {
                    if (!favgroup.posts?.length) favgroup.posts = [{order: 0}]
                    const maxOrder = Math.max(...favgroup.posts.map((post: any) => post.order))
                    await sql.favorite.insertFavgroupPost(req.session.username, slug, Number(postID), maxOrder + 1)
                }
            } catch {}
            res.status(200).send("Success")
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request") 
        }
    })

    app.get("/api/favgroups", favoriteLimiter, async (req: Request, res: Response) => {
        try {
            const postID = req.query.postID
            if (Number.isNaN(Number(postID))) return res.status(400).send("Invalid postID")
            if (!req.session.username) return res.status(403).send("Unauthorized")
            const favgroups = await sql.favorite.postFavgroups(Number(postID), req.session.username)
            res.status(200).send(favgroups)
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request") 
        }
    })

    app.delete("/api/favgroup/post/delete", csrfProtection, favoriteLimiter, async (req: Request, res: Response) => {
        try {
            const postID = req.query.postID
            const name = req.query.name as string
            if (Number.isNaN(Number(postID))) return res.status(400).send("Invalid postID")
            if (!req.session.username) return res.status(403).send("Unauthorized")
            const slug = functions.generateSlug(name)
            const favgroup = await sql.favorite.favgroup(req.session.username, slug)
            if (!favgroup) return res.status(400).send("Invalid favgroup")
            await sql.favorite.deleteFavgroupPost(Number(postID), req.session.username, favgroup.slug)
            if (favgroup.posts.length === 1) {
                await sql.favorite.deleteFavgroup(req.session.username, favgroup.slug)
            }
            res.status(200).send("Success")
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request") 
        }
    })

    app.get("/api/favgroup", favoriteLimiter, async (req: Request, res: Response) => {
        try {
            const username = req.query.username as string
            const name = req.query.name as string
            if (!username) return res.status(400).send("Bad username")
            const slug = functions.generateSlug(name)
            const favgroup = await sql.favorite.favgroup(username, slug)
            if (!favgroup) return res.status(400).send("Invalid favgroup")
            if (favgroup.private) {
                if (!permissions.isMod(req.session) && username !== req.session.username) return res.status(403).send("Unauthorized")
            }
            res.status(200).json(favgroup)
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request") 
        }
    })

    app.put("/api/favgroup/edit", csrfProtection, favoriteLimiter, async (req: Request, res: Response) => {
        try {
            const {key, name, isPrivate} = req.body
            if (!req.session.username) return res.status(403).send("Unauthorized")
            const slug = functions.generateSlug(key)
            const favgroup = await sql.favorite.favgroup(req.session.username, slug)
            if (!favgroup) return res.status(400).send("Invalid favgroup")
            if (isPrivate !== undefined) {
                await sql.favorite.updateFavGroup(req.session.username, slug, "private", isPrivate)
            }
            if (name !== undefined) {
                if (!name) return res.status(400).send("Invalid name")
                const newSlug = functions.generateSlug(name)
                await sql.favorite.updateFavGroup(req.session.username, slug, "name", name)
                await sql.favorite.updateFavGroup(req.session.username, slug, "slug", newSlug)
            }
            res.status(200).send("Success")
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request") 
        }
    })

    app.delete("/api/favgroup/delete", csrfProtection, favoriteLimiter, async (req: Request, res: Response) => {
        try {
            const name = req.query.name as string
            if (!req.session.username) return res.status(403).send("Unauthorized")
            const slug = functions.generateSlug(name)
            const favgroup = await sql.favorite.favgroup(req.session.username, slug)
            if (!favgroup) return res.status(400).send("Invalid favgroup")
            await sql.favorite.deleteFavgroup(req.session.username, favgroup.slug)
            res.status(200).send("Success")
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request") 
        }
    })

    app.put("/api/favgroup/reorder", csrfProtection, favoriteLimiter, async (req: Request, res: Response) => {
        try {
            const {name, posts} = req.body
            if (!req.session.username) return res.status(403).send("Unauthorized")
            if (req.session.banned) return res.status(403).send("You are banned")
            const slug = functions.generateSlug(name)
            const favgroup = await sql.favorite.favgroup(req.session.username, slug)
            if (!favgroup) return res.status(400).send("Invalid favgroup")
            for (let i = 0; i < posts.length; i++) {
                if (Number(posts[i].order) !== i + 1) return res.status(400).send("Bad post orders")
            }
            await sql.favorite.purgeFavgroupMap(req.session.username, favgroup.slug)
            await sql.favorite.bulkInsertFavgroupMappings(req.session.username, favgroup.slug, posts)
            res.status(200).send("Success")
        } catch (e) {
            console.log(e)
            res.status(400).send("Bad request") 
        }
    })
}

export default FavoriteRoutes