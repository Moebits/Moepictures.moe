import React, {useEffect, useRef, useState} from "react"
import {useHistory} from "react-router-dom"
import {useThemeSelector, useSessionSelector, useLayoutSelector, useSessionActions, useFilterSelector} from "../store"
import functions from "../structures/Functions"
import permissions from "../structures/Permissions"
import favicon from "../assets/icons/favicon.png"
import noteHistory from "../assets/icons/history.png"
import adminCrown from "../assets/icons/admin-crown.png"
import modCrown from "../assets/icons/mod-crown.png"
import systemCrown from "../assets/icons/system-crown.png"
import premiumCuratorStar from "../assets/icons/premium-curator-star.png"
import curatorStar from "../assets/icons/curator-star.png"
import premiumContributorPencil from "../assets/icons/premium-contributor-pencil.png"
import contributorPencil from "../assets/icons/contributor-pencil.png"
import premiumStar from "../assets/icons/premium-star.png"
import "./styles/commentrow.less"

interface Props {
    note: any
    onDelete?: () => void
    onEdit?: () => void
}

const NoteRow: React.FunctionComponent<Props> = (props) => {
    const {siteHue, siteSaturation, siteLightness, i18n} = useThemeSelector()
    const {mobile} = useLayoutSelector()
    const {session} = useSessionSelector()
    const {setSessionFlag} = useSessionActions()
    const {brightness, contrast, hue, saturation, lightness, blur, sharpen, pixelate} = useFilterSelector()
    const history = useHistory()
    const rawImg = props.note?.post.images[props.note.order - 1]
    const initialImg = functions.getThumbnailLink(rawImg.type, props.note?.postID, rawImg.order, rawImg.filename, "tiny")
    const [img, setImg] = useState(initialImg)
    const ref = useRef<HTMLCanvasElement>(null)

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    const defaultIcon = props.note?.image ? false : true

    const getNotePFP = () => {
        if (props.note?.image) {
            return functions.getTagLink("pfp", props.note.image, props.note.imageHash)
        } else {
            return favicon
        }
    }

    const imgClick = (event: React.MouseEvent) => {
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/post/${props.note.postID}`, "_blank")
        } else {
            history.push(`/post/${props.note.postID}`)
        }
    }

    const userImgClick = (event: React.MouseEvent) => {
        if (!props.note?.imagePost) return
        event.stopPropagation()
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/post/${props.note.imagePost}`, "_blank")
        } else {
            history.push(`/post/${props.note.imagePost}`)
        }
    }

    const parseText = () => {
        let jsx = [] as any
        if (!props.note.data?.length) {
            return <span className="commentrow-text">No data</span>
        }
        for (const item of props.note.data) {
            jsx.push(<span className="commentrow-text">{`${item.transcript} -> ${item.translation}`}</span>)
        }
        return jsx
    }

    const showHistory = () => {
        history.push(`/note/history/${props.note.postID}/${props.note.order || 1}`)
    }

    const commentOptions = () => {
        if (mobile) return null
        if (session.banned) return null
        return (
            <div className="commentrow-options">
                <div className="commentrow-options-container" onClick={showHistory}>
                    <img className="commentrow-options-img" src={noteHistory}/>
                    <span className="commentrow-options-text">{i18n.sidebar.history}</span>
                </div>
            </div>
        )
    }

    const userClick = (event: React.MouseEvent) => {
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/user/${props.note.updater}`, "_blank")
        } else {
            history.push(`/user/${props.note.updater}`)
        }
    }

    const generateUsernameJSX = () => {
        if (props.note?.role === "admin") {
            return (
                <div className="commentrow-username-container">
                    <span className="commentrow-user-text admin-color">{functions.toProperCase(props.note.updater)}</span>
                    <img className="commentrow-user-label" src={adminCrown}/>
                </div>
            )
        } else if (props.note?.role === "mod") {
            return (
                <div className="commentrow-username-container">
                <span className="commentrow-user-text mod-color">{functions.toProperCase(props.note.updater)}</span>
                    <img className="commentrow-user-label" src={modCrown}/>
                </div>
            )
        } else if (props.note?.role === "system") {
            return (
                <div className="commentrow-username-container">
                <span className="commentrow-user-text system-color">{functions.toProperCase(props.note.updater)}</span>
                    <img className="commentrow-user-label" src={systemCrown}/>
                </div>
            )
        } else if (props.note?.role === "premium-curator") {
            return (
                <div className="commentrow-username-container">
                <span className="commentrow-user-text curator-color">{functions.toProperCase(props.note.updater)}</span>
                    <img className="commentrow-user-label" src={premiumCuratorStar}/>
                </div>
            )
        } else if (props.note?.role === "curator") {
            return (
                <div className="commentrow-username-container">
                <span className="commentrow-user-text curator-color">{functions.toProperCase(props.note.updater)}</span>
                    <img className="commentrow-user-label" src={curatorStar}/>
                </div>
            )
        } else if (props.note?.role === "premium-contributor") {
            return (
                <div className="commentrow-username-container">
                <span className="commentrow-user-text premium-color">{functions.toProperCase(props.note.updater)}</span>
                    <img className="commentrow-user-label" src={premiumContributorPencil}/>
                </div>
            )
        } else if (props.note?.role === "contributor") {
            return (
                <div className="commentrow-username-container">
                <span className="commentrow-user-text contributor-color">{functions.toProperCase(props.note.updater)}</span>
                    <img className="commentrow-user-label" src={contributorPencil}/>
                </div>
            )
        } else if (props.note?.role === "premium") {
            return (
                <div className="commentrow-username-container">
                <span className="commentrow-user-text premium-color">{functions.toProperCase(props.note.updater)}</span>
                    <img className="commentrow-user-label" src={premiumStar}/>
                </div>
            )
        }
        return <span className={`commentrow-user-text ${props.note?.banned ? "banned" : ""}`}>{functions.toProperCase(props.note?.updater) || i18n.user.deleted}</span>
    }

    useEffect(() => {
        if (functions.isVideo(img) && mobile) {
            functions.videoThumbnail(img).then((thumbnail) => {
                setImg(thumbnail)
            })
        }
        const base64Img = async () => {
            const base64 = await functions.linkToBase64(img)
            setImg(base64)
        }
        // base64Img()
    }, [])

    const loadImage = async () => {
        if (functions.isGIF(img)) return
        if (!ref.current) return
        let src = await functions.decryptThumb(img, session)
        const imgElement = document.createElement("img")
        imgElement.src = src 
        imgElement.onload = () => {
            if (!ref.current) return
            const rendered = functions.render(imgElement, brightness, contrast, hue, saturation, lightness, blur, sharpen, pixelate)
            const refCtx = ref.current.getContext("2d")
            ref.current.width = rendered.width
            ref.current.height = rendered.height
            refCtx?.drawImage(rendered, 0, 0, rendered.width, rendered.height)
        }
    }

    useEffect(() => {
        loadImage()
    }, [img, brightness, contrast, hue, saturation, lightness, blur, sharpen, pixelate, session])

    return (
        <div className="commentrow" note-id={props.note?.noteID}>
            <div className="commentrow-container" style={{justifyContent: "center"}}>
                {functions.isVideo(img) && !mobile ? 
                <video className="commentrow-img" src={img} onClick={imgClick} onAuxClick={imgClick}></video> :
                functions.isGIF(img) ? <img className="commentrow-img" src={img} onClick={imgClick} onAuxClick={imgClick}/> :
                <canvas className="commentrow-img" ref={ref} onClick={imgClick} onAuxClick={imgClick}></canvas>}
            </div>
            <div className="commentrow-container-row">
                <div className="commentrow-container">
                    <div className="commentrow-user-container" onClick={userClick} onAuxClick={userClick}>
                        <img className="commentrow-user-img" src={getNotePFP()} onClick={userImgClick} onAuxClick={userImgClick} style={{filter: defaultIcon ? getFilter() : ""}}/>
                        {generateUsernameJSX()}
                    </div>
                </div>
                <div className="commentrow-container" style={{width: "100%"}}>
                    <span className="commentrow-date-text" onClick={imgClick}>{functions.timeAgo(props.note?.updatedDate, i18n)}:</span>
                    {parseText()}
                </div>
            </div>
            {session.username ? commentOptions() : null}
        </div>
    )
}

export default NoteRow