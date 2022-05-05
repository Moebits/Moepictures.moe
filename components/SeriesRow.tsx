import React, {useContext, useEffect, useRef, useState} from "react"
import {useHistory} from "react-router-dom"
import {ThemeContext, SearchContext, SearchFlagContext, SessionContext} from "../Context"
import {HashLink as Link} from "react-router-hash-link"
import functions from "../structures/Functions"
import seriesImg from "../assets/images/series.png"
import Carousel from "./Carousel"
import "./styles/seriesrow.less"

interface Props {
    series: any
}

const SeriesRow: React.FunctionComponent<Props> = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const [hover, setHover] = useState(false)
    const {search, setSearch} = useContext(SearchContext)
    const {searchFlag, setSearchFlag} = useContext(SearchFlagContext)
    const {session, setSession} = useContext(SessionContext)
    const history = useHistory()

    const searchTag = (event: React.MouseEvent) => {
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open("/posts", "_blank")
        } else {
            history.push("/posts")
        }
        setSearch(props.series.tag)
        setSearchFlag(true)
    }

    const set = (image: string, index: number, newTab: boolean) => {
        if (!session.username) {
            const filtered = props.series.posts.filter((p: any) => p.restrict === "safe")
            const post = filtered[index] 
            if (newTab) {
                return window.open(`/post/${post.postID}`, "_blank")
            } else {
                return history.push(`/post/${post.postID}`)
            }
        }
        const post = props.series.posts[index] 
        if (newTab) {
            window.open(`/post/${post.postID}`, "_blank")
        } else {
            history.push(`/post/${post.postID}`)
        }
    }

    const getImages = () => {
        if (!session.username) {
            const filtered = props.series.posts.filter((p: any) => p.restrict === "safe")
            return filtered.map((p: any) => functions.getImageLink(p.images[0].type, p.postID, p.images[0].filename))
        }
        return props.series.posts.map((p: any) => functions.getImageLink(p.images[0].type, p.postID, p.images[0].filename))
    }

    return (
        <div className="seriesrow" onMouseEnter={() =>setHover(true)} onMouseLeave={() => setHover(false)}>
            <div className="seriesrow-row">
                {props.series.image ? <img className="seriesrow-img" src={functions.getTagLink("series", props.series.image)}/> : null}
                <span className="seriesrow-text-hover" onClick={searchTag} onAuxClick={searchTag}>
                    <span className="seriesrow-text">{functions.toProperCase(props.series.tag.replaceAll("-", " "))}</span>
                    <span className="seriesrow-text-alt">{props.series.postCount}</span>
                </span>
            </div>
            <div className="seriesrow-row">
                <Carousel set={set} noKey={true} images={getImages()} height={130}/>
            </div>
        </div>
    )
}

export default SeriesRow