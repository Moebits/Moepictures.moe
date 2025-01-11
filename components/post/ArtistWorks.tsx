import React, {useContext, useRef, useState} from "react"
import {useHistory} from "react-router-dom"
import {useLayoutSelector, useCacheActions, useThemeSelector} from "../../store"
import functions from "../../structures/Functions"
import Carousel from "../site/Carousel"
import "./styles/related.less"
import {PostFull} from "../../types/Types"

interface Props {
    posts: PostFull[]
}

const ArtistWorks: React.FunctionComponent<Props> = (props) => {
    const {i18n} = useThemeSelector()
    const {mobile} = useLayoutSelector()
    const {setPosts} = useCacheActions()
    const history = useHistory()

    const getImages = () => {
        return props.posts.map((post) => functions.getThumbnailLink(post.images[0].type, post.postID, post.images[0].order, post.images[0].filename, "small"))
    }

    const click = (img: string, index: number) => {
        const post = props.posts[index]
        history.push(`/post/${post.postID}/${post.slug}`)
        window.scrollTo(0, functions.navbarHeight() + functions.titlebarHeight())
        setPosts(props.posts)
    }

    let marginLeft = mobile ? 20 : 200

    if (!props.posts.length) return null

    return (
        <div className="related">
            <div className="related-title">{i18n.post.artistWorks}</div>
            <div className="related-container">
                <Carousel images={getImages()} set={click} noKey={true} marginLeft={marginLeft} height={200}/>
            </div>
        </div>
    )
}

export default ArtistWorks