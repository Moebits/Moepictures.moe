import React, {useContext, useEffect, useRef, useState} from "react"
import {useHistory} from "react-router-dom"
import {ThemeContext, SearchContext, SearchFlagContext, MobileContext, SessionContext, SiteHueContext, SiteLightnessContext,
SiteSaturationContext} from "../Context"
import {HashLink as Link} from "react-router-hash-link"
import functions from "../structures/Functions"
import adminCrown from "../assets/icons/admin-crown.png"
import modCrown from "../assets/icons/mod-crown.png"
import favicon from "../assets/icons/favicon.png"
import "./styles/message.less"
import axios from "axios"

interface Props {
    message?: any
    onDelete?: () => void
    onEdit?: () => void
    titlePage?: boolean
}

const Message: React.FunctionComponent<Props> = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const {siteHue, setSiteHue} = useContext(SiteHueContext)
    const {siteSaturation, setSiteSaturation} = useContext(SiteSaturationContext)
    const {siteLightness, setSiteLightness} = useContext(SiteLightnessContext)
    const [hover, setHover] = useState(false)
    const {search, setSearch} = useContext(SearchContext)
    const {searchFlag, setSearchFlag} = useContext(SearchFlagContext)
    const {mobile, setMobile} = useContext(MobileContext)
    const {session, setSession} = useContext(SessionContext)
    const [creatorRole, setCreatorRole] = useState("")
    const [recipientRole, setRecipientRole] = useState("")
    const [recipientImg, setRecipientImg] = useState("")
    const [creatorImg, setCreatorImg] = useState("")
    const [recipientImgPost, setRecipientImgPost] = useState("")
    const [creatorImgPost, setCreatorImgPost] = useState("")
    const [creatorDefaultIcon, setCreatorDefaultIcon] = useState(false)
    const [recipientDefaultIcon, setRecipientDefaultIcon] = useState(false)
    const history = useHistory()

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    const recipientecipientRole = async () => {
        const user = await axios.get("/api/user", {params: {username: props.message.recipient}, withCredentials: true}).then((r) => r.data)
        if (user?.role) setRecipientRole(user.role)
        if (user?.image) setRecipientImg(functions.getTagLink("pfp", user.image))
        if (user?.imagePost) setRecipientImgPost(user.imagePost)
        setRecipientDefaultIcon(user?.image ? false : true)
    }

    const updateCreatorRole = async () => {
        const user = await axios.get("/api/user", {params: {username: props.message.creator}, withCredentials: true}).then((r) => r.data)
        if (user?.role) setCreatorRole(user.role)
        if (user?.image) setCreatorImg(functions.getTagLink("pfp", user.image))
        if (user?.imagePost) setCreatorImgPost(user.imagePost)
        setCreatorDefaultIcon(user?.image ? false : true)
    }

    useEffect(() => {
        if (props.message) {
            updateCreatorRole()
            recipientecipientRole()
        }
    }, [])

    const messagePage = (event: React.MouseEvent) => {
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/message/${props.message.messageID}`, "_blank")
        } else {
            history.push(`/message/${props.message.messageID}`)
        }
    }

    const getCreatorPFP = () => {
        if (creatorImg) {
            return creatorImg
        } else {
            return favicon
        }
    }

    const creatorPage = (event: React.MouseEvent) => {
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/user/${props.message.creator}`, "_blank")
        } else {
            history.push(`/user/${props.message.creator}`)
        }
    }

    const creatorImgClick = (event: React.MouseEvent) => {
        if (!creatorImgPost) return
        event.stopPropagation()
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/post/${creatorImgPost}`, "_blank")
        } else {
            history.push(`/post/${creatorImgPost}`)
        }
    }

    const getRecipientPFP = () => {
        if (recipientImg) {
            return recipientImg
        } else {
            return favicon
        }
    }

    const recipientPage = (event: React.MouseEvent) => {
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/user/${props.message.recipient}`, "_blank")
        } else {
            history.push(`/user/${props.message.recipient}`)
        }
    }

    const recipientImgClick = (event: React.MouseEvent) => {
        if (!recipientImgPost) return
        event.stopPropagation()
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/post/${recipientImgPost}`, "_blank")
        } else {
            history.push(`/post/${recipientImgPost}`)
        }
    }

    const generateCreatorJSX = () => {
        if (creatorRole === "admin") {
            return (
                <div className="message-username-container" onClick={creatorPage} onAuxClick={creatorPage}>
                    <img draggable={false} src={getCreatorPFP()} className="message-user-img" onClick={creatorImgClick} onAuxClick={creatorImgClick} style={{filter: creatorDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text admin-color">{functions.toProperCase(props.message.creator)}</span>
                    <img className="message-user-label" src={adminCrown}/>
                </div>
            )
        } else if (creatorRole === "mod") {
            return (
                <div className="message-username-container" onClick={creatorPage} onAuxClick={creatorPage}>
                    <img draggable={false} src={getCreatorPFP()} className="message-user-img" onClick={creatorImgClick} onAuxClick={creatorImgClick} style={{filter: creatorDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text mod-color">{functions.toProperCase(props.message.creator)}</span>
                    <img className="message-user-label" src={modCrown}/>
                </div>
            )
        }
        return (
            <div className="message-username-container" onClick={creatorPage} onAuxClick={creatorPage}>
                <img draggable={false} src={getCreatorPFP()} className="message-user-img" onClick={creatorImgClick} onAuxClick={creatorImgClick} style={{filter: creatorDefaultIcon ? getFilter() : ""}}/>
                <span className="message-user-text" onClick={creatorPage} onAuxClick={creatorPage}>{functions.toProperCase(props.message.creator)}</span>
            </div>
        )
    }

    const generateRecipientJSX = () => {
        if (recipientRole === "admin") {
            return (
                <div className="message-username-container" onClick={(event) => recipientPage(event)} onAuxClick={(event) => recipientPage(event)}>
                    <img draggable={false} src={getRecipientPFP()} className="message-user-img" onClick={recipientImgClick} onAuxClick={recipientImgClick} style={{filter: recipientDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text admin-color">{functions.toProperCase(props.message.recipient)}</span>
                    <img className="message-user-label" src={adminCrown}/>
                </div>
            )
        } else if (recipientRole === "mod") {
            return (
                <div className="message-username-container" onClick={(event) => recipientPage(event)} onAuxClick={(event) => recipientPage(event)}>
                <img draggable={false} src={getRecipientPFP()} className="message-user-img" onClick={recipientImgClick} onAuxClick={recipientImgClick} style={{filter: recipientDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text mod-color">{functions.toProperCase(props.message.recipient)}</span>
                    <img className="message-user-label" src={modCrown}/>
                </div>
            )
        }
        return (
            <div className="message-username-container" onClick={(event) => recipientPage(event)} onAuxClick={(event) => recipientPage(event)}>
                <img draggable={false} src={getRecipientPFP()} className="message-user-img" onClick={recipientImgClick} onAuxClick={recipientImgClick} style={{filter: recipientDefaultIcon ? getFilter() : ""}}/>
                <span className="message-user-text" onClick={(event) => recipientPage(event)} onAuxClick={(event) => recipientPage(event)}>{functions.toProperCase(props.message.recipient)}</span>
            </div>
        )
    }

    const dateTextJSX = () => {
        const targetDate = props.message.updatedDate
        return <span className="message-date-text">{functions.timeAgo(targetDate)}</span>
    }

    if (props.titlePage) {
        return (
            <tr className="message-no-hover">
                <div className="message-content-container">
                    <td className="message-container">
                        <div className="message-row" style={{width: "100%"}}>
                            <span className="message-heading">Title</span>
                        </div>
                        {!mobile ? <div className="message-row">
                            <span className="message-heading">Sender</span>
                        </div> : null}
                        {!mobile ? <div className="message-row">
                            <span className="message-heading">Recipient</span>
                        </div> : null}
                        <div className="message-row">
                            <span className="message-heading">Updated</span>
                        </div>
                    </td>
                </div>
            </tr>
        )
    }

    return (
        <tr className="message">
            <div className="message-content-container">
                <td className="message-container">
                    <div className="message-row" style={{width: "100%"}}>
                        <span className="message-title" onClick={messagePage} onAuxClick={messagePage}>{props.message.title}</span>
                    </div>
                    {!mobile ? <div className="message-row">
                        {generateCreatorJSX()}
                    </div> : null}
                    {!mobile ? <div className="message-row">
                        {generateRecipientJSX()}
                    </div> : null}
                    <div className="message-row">
                        {dateTextJSX()}
                    </div>
                </td>
            </div>
        </tr>
    )
}

export default Message