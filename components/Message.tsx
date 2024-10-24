import React, {useContext, useEffect, useRef, useState} from "react"
import {useHistory} from "react-router-dom"
import {ThemeContext, SearchContext, SearchFlagContext, MobileContext, SessionContext, SiteHueContext, SiteLightnessContext,
SiteSaturationContext, SoftDeleteMessageIDContext, HasNotificationContext, SessionFlagContext} from "../Context"
import {HashLink as Link} from "react-router-hash-link"
import functions from "../structures/Functions"
import adminCrown from "../assets/icons/admin-crown.png"
import modCrown from "../assets/icons/mod-crown.png"
import systemCrown from "../assets/icons/system-crown.png"
import premiumCuratorStar from "../assets/icons/premium-curator-star.png"
import curatorStar from "../assets/icons/curator-star.png"
import premiumContributorPencil from "../assets/icons/premium-contributor-pencil.png"
import contributorPencil from "../assets/icons/contributor-pencil.png"
import premiumStar from "../assets/icons/premium-star.png"
import softDelete from "../assets/icons/soft-delete.png"
import unread from "../assets/icons/unread.png"
import read from "../assets/icons/read.png"
import readLight from "../assets/icons/read-light.png"
import favicon from "../assets/icons/favicon.png"
import "./styles/message.less"

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
    const {sessionFlag, setSessionFlag} = useContext(SessionFlagContext)
    const {softDeleteMessageID, setSoftDeleteMessageID} = useContext(SoftDeleteMessageIDContext)
    const {hasNotification, setHasNotification} = useContext(HasNotificationContext)
    const [creatorData, setCreatorData] = useState({}) as any
    const [recipientData, setRecipientData] = useState({}) as any
    const [creatorDefaultIcon, setCreatorDefaultIcon] = useState(false)
    const [recipientDefaultIcon, setRecipientDefaultIcon] = useState(false)
    const history = useHistory()

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    const updateRecipient = async () => {
        const recipient = await functions.get("/api/user", {username: props.message.recipient}, session, setSessionFlag)
        setRecipientData(recipient)
        setRecipientDefaultIcon(recipient?.image ? false : true)
    }

    const updateCreator = async () => {
        const creator = await functions.get("/api/user", {username: props.message.creator}, session, setSessionFlag)
        setCreatorData(creator)
        setCreatorDefaultIcon(creator?.image ? false : true)
    }

    useEffect(() => {
        if (props.message) {
            updateCreator()
            updateRecipient()
        }
    }, [session])

    const messagePage = (event: React.MouseEvent) => {
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/message/${props.message.messageID}`, "_blank")
        } else {
            history.push(`/message/${props.message.messageID}`)
        }
    }

    const getCreatorPFP = () => {
        if (creatorData?.image) {
            return functions.getTagLink("pfp", creatorData.image)
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
        if (!creatorData?.imagePost) return
        event.stopPropagation()
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/post/${creatorData.imagePost}`, "_blank")
        } else {
            history.push(`/post/${creatorData.imagePost}`)
        }
    }

    const getRecipientPFP = () => {
        if (recipientData?.image) {
            return functions.getTagLink("pfp", recipientData.image)
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
        if (!recipientData?.imagePost) return
        event.stopPropagation()
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/post/${recipientData.imagePost}`, "_blank")
        } else {
            history.push(`/post/${recipientData.imagePost}`)
        }
    }

    const generateCreatorJSX = () => {
        if (creatorData?.role === "admin") {
            return (
                <div className="message-username-container" onClick={creatorPage} onAuxClick={creatorPage}>
                    <img draggable={false} src={getCreatorPFP()} className="message-user-img" onClick={creatorImgClick} onAuxClick={creatorImgClick} style={{filter: creatorDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text admin-color">{functions.toProperCase(props.message.creator)}</span>
                    <img className="message-user-label" src={adminCrown}/>
                </div>
            )
        } else if (creatorData?.role === "mod") {
            return (
                <div className="message-username-container" onClick={creatorPage} onAuxClick={creatorPage}>
                    <img draggable={false} src={getCreatorPFP()} className="message-user-img" onClick={creatorImgClick} onAuxClick={creatorImgClick} style={{filter: creatorDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text mod-color">{functions.toProperCase(props.message.creator)}</span>
                    <img className="message-user-label" src={modCrown}/>
                </div>
            )
        } else if (creatorData?.role === "system") {
            return (
                <div className="message-username-container" onClick={creatorPage} onAuxClick={creatorPage}>
                    <img draggable={false} src={getCreatorPFP()} className="message-user-img" onClick={creatorImgClick} onAuxClick={creatorImgClick} style={{filter: creatorDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text system-color">{functions.toProperCase(props.message.creator)}</span>
                    <img className="message-user-label" src={systemCrown}/>
                </div>
            )
        } else if (creatorData?.role === "premium-curator") {
            return (
                <div className="message-username-container" onClick={creatorPage} onAuxClick={creatorPage}>
                    <img draggable={false} src={getCreatorPFP()} className="message-user-img" onClick={creatorImgClick} onAuxClick={creatorImgClick} style={{filter: creatorDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text curator-color">{functions.toProperCase(props.message.creator)}</span>
                    <img className="message-user-label" src={premiumCuratorStar}/>
                </div>
            )
        } else if (creatorData?.role === "curator") {
            return (
                <div className="message-username-container" onClick={creatorPage} onAuxClick={creatorPage}>
                    <img draggable={false} src={getCreatorPFP()} className="message-user-img" onClick={creatorImgClick} onAuxClick={creatorImgClick} style={{filter: creatorDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text curator-color">{functions.toProperCase(props.message.creator)}</span>
                    <img className="message-user-label" src={curatorStar}/>
                </div>
            )
        } else if (creatorData?.role === "premium-contributor") {
            return (
                <div className="message-username-container" onClick={creatorPage} onAuxClick={creatorPage}>
                    <img draggable={false} src={getCreatorPFP()} className="message-user-img" onClick={creatorImgClick} onAuxClick={creatorImgClick} style={{filter: creatorDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text premium-color">{functions.toProperCase(props.message.creator)}</span>
                    <img className="message-user-label" src={premiumContributorPencil}/>
                </div>
            )
        } else if (creatorData?.role === "contributor") {
            return (
                <div className="message-username-container" onClick={creatorPage} onAuxClick={creatorPage}>
                    <img draggable={false} src={getCreatorPFP()} className="message-user-img" onClick={creatorImgClick} onAuxClick={creatorImgClick} style={{filter: creatorDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text contributor-color">{functions.toProperCase(props.message.creator)}</span>
                    <img className="message-user-label" src={contributorPencil}/>
                </div>
            )
        } else if (creatorData?.role === "premium") {
            return (
                <div className="message-username-container" onClick={creatorPage} onAuxClick={creatorPage}>
                    <img draggable={false} src={getCreatorPFP()} className="message-user-img" onClick={creatorImgClick} onAuxClick={creatorImgClick} style={{filter: creatorDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text premium-color">{functions.toProperCase(props.message.creator)}</span>
                    <img className="message-user-label" src={premiumStar}/>
                </div>
            )
        }
        return (
            <div className="message-username-container" onClick={creatorPage} onAuxClick={creatorPage}>
                <img draggable={false} src={getCreatorPFP()} className="message-user-img" onClick={creatorImgClick} onAuxClick={creatorImgClick} style={{filter: creatorDefaultIcon ? getFilter() : ""}}/>
                <span className={`message-user-text ${creatorData?.banned ? "banned" : ""}`} onClick={creatorPage} onAuxClick={creatorPage}>{functions.toProperCase(props.message?.creator) || "deleted"}</span>
            </div>
        )
    }

    const generateRecipientJSX = () => {
        if (recipientData?.role === "admin") {
            return (
                <div className="message-username-container" onClick={(event) => recipientPage(event)} onAuxClick={(event) => recipientPage(event)}>
                    <img draggable={false} src={getRecipientPFP()} className="message-user-img" onClick={recipientImgClick} onAuxClick={recipientImgClick} style={{filter: recipientDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text admin-color">{functions.toProperCase(props.message.recipient)}</span>
                    <img className="message-user-label" src={adminCrown}/>
                </div>
            )
        } else if (recipientData?.role === "mod") {
            return (
                <div className="message-username-container" onClick={(event) => recipientPage(event)} onAuxClick={(event) => recipientPage(event)}>
                <img draggable={false} src={getRecipientPFP()} className="message-user-img" onClick={recipientImgClick} onAuxClick={recipientImgClick} style={{filter: recipientDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text mod-color">{functions.toProperCase(props.message.recipient)}</span>
                    <img className="message-user-label" src={modCrown}/>
                </div>
            )
        } else if (recipientData?.role === "system") {
            return (
                <div className="message-username-container" onClick={(event) => recipientPage(event)} onAuxClick={(event) => recipientPage(event)}>
                <img draggable={false} src={getRecipientPFP()} className="message-user-img" onClick={recipientImgClick} onAuxClick={recipientImgClick} style={{filter: recipientDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text system-color">{functions.toProperCase(props.message.recipient)}</span>
                    <img className="message-user-label" src={systemCrown}/>
                </div>
            )
        } else if (recipientData?.role === "premium-curator") {
            return (
                <div className="message-username-container" onClick={(event) => recipientPage(event)} onAuxClick={(event) => recipientPage(event)}>
                <img draggable={false} src={getRecipientPFP()} className="message-user-img" onClick={recipientImgClick} onAuxClick={recipientImgClick} style={{filter: recipientDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text curator-color">{functions.toProperCase(props.message.recipient)}</span>
                    <img className="message-user-label" src={premiumCuratorStar}/>
                </div>
            )
        } else if (recipientData?.role === "curator") {
            return (
                <div className="message-username-container" onClick={(event) => recipientPage(event)} onAuxClick={(event) => recipientPage(event)}>
                <img draggable={false} src={getRecipientPFP()} className="message-user-img" onClick={recipientImgClick} onAuxClick={recipientImgClick} style={{filter: recipientDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text curator-color">{functions.toProperCase(props.message.recipient)}</span>
                    <img className="message-user-label" src={curatorStar}/>
                </div>
            )
        } else if (recipientData?.role === "premium-contributor") {
            return (
                <div className="message-username-container" onClick={(event) => recipientPage(event)} onAuxClick={(event) => recipientPage(event)}>
                <img draggable={false} src={getRecipientPFP()} className="message-user-img" onClick={recipientImgClick} onAuxClick={recipientImgClick} style={{filter: recipientDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text premium-color">{functions.toProperCase(props.message.recipient)}</span>
                    <img className="message-user-label" src={premiumContributorPencil}/>
                </div>
            )
        } else if (recipientData?.role === "contributor") {
            return (
                <div className="message-username-container" onClick={(event) => recipientPage(event)} onAuxClick={(event) => recipientPage(event)}>
                <img draggable={false} src={getRecipientPFP()} className="message-user-img" onClick={recipientImgClick} onAuxClick={recipientImgClick} style={{filter: recipientDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text contributor-color">{functions.toProperCase(props.message.recipient)}</span>
                    <img className="message-user-label" src={contributorPencil}/>
                </div>
            )
        } else if (recipientData?.role === "premium") {
            return (
                <div className="message-username-container" onClick={(event) => recipientPage(event)} onAuxClick={(event) => recipientPage(event)}>
                <img draggable={false} src={getRecipientPFP()} className="message-user-img" onClick={recipientImgClick} onAuxClick={recipientImgClick} style={{filter: recipientDefaultIcon ? getFilter() : ""}}/>
                    <span className="message-user-text premium-color">{functions.toProperCase(props.message.recipient)}</span>
                    <img className="message-user-label" src={premiumStar}/>
                </div>
            )
        }
        return (
            <div className="message-username-container" onClick={(event) => recipientPage(event)} onAuxClick={(event) => recipientPage(event)}>
                <img draggable={false} src={getRecipientPFP()} className="message-user-img" onClick={recipientImgClick} onAuxClick={recipientImgClick} style={{filter: recipientDefaultIcon ? getFilter() : ""}}/>
                <span className={`message-user-text ${recipientData?.banned ? "banned" : ""}`} onClick={(event) => recipientPage(event)} onAuxClick={(event) => recipientPage(event)}>{functions.toProperCase(props.message?.recipient || "deleted")}</span>
            </div>
        )
    }

    const checkMail = async () => {
        const result = await functions.get("/api/user/checkmail", null, session, setSessionFlag)
        setHasNotification(result)
    }

    const readStatus = () => {
        if (props.message.creator === session.username) {
            return props.message.creatorRead
        } else if (props.message.recipient === session.username) {
            return props.message.recipientRead
        }
    }

    const toggleRead = async () => {
        await functions.post("/api/message/read", {messageID: props.message.messageID}, session, setSessionFlag)
        props.onEdit?.()
        checkMail()
    }

    const toggleSoftDelete = () => {
        setSoftDeleteMessageID(props.message.messageID)
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

    const getReadIcon = () => {
        if (!readStatus()) return unread
        if (theme.includes("light")) return readLight
        return read
    }

    return (
        <tr className="message">
            <div className="message-content-container">
                <td className="message-container">
                    <div className="message-row" style={{width: "100%"}}>
                        <img draggable={false} className="message-opt-icon" src={getReadIcon()} onClick={toggleRead} style={{filter: getFilter()}}/>
                        <img draggable={false} className="message-opt-icon" src={softDelete} onClick={toggleSoftDelete} style={{filter: getFilter()}}/>
                        <span className={`message-title ${readStatus() ? "message-read" : ""}`} onClick={messagePage} onAuxClick={messagePage}>{props.message.title}</span>
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