import React, {useContext, useEffect, useRef, useState} from "react"
import {useHistory} from "react-router-dom"
import {ThemeContext, SessionContext, MobileContext, DeleteTranslationHistoryIDContext, RevertTranslationHistoryIDContext,
DeleteTranslationHistoryFlagContext, RevertTranslationHistoryFlagContext, SessionFlagContext} from "../Context"
import functions from "../structures/Functions"
import translationHistoryRevert from "../assets/icons/revert.png"
import translationHistoryDelete from "../assets/icons/delete.png"
import adminCrown from "../assets/icons/admin-crown.png"
import modCrown from "../assets/icons/mod-crown.png"
import permissions from "../structures/Permissions"
import cryptoFunctions from "../structures/CryptoFunctions"
import "./styles/translationhistoryrow.less"

interface Props {
    previousHistory: any
    translationHistory: any
    onDelete?: () => void
    onEdit?: () => void
    current?: boolean
}

const TranslationHistoryRow: React.FunctionComponent<Props> = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const {mobile, setMobile} = useContext(MobileContext)
    const {session, setSession} = useContext(SessionContext)
    const {sessionFlag, setSessionFlag} = useContext(SessionFlagContext)
    const {deleteTranslationHistoryID, setDeleteTranslationHistoryID} = useContext(DeleteTranslationHistoryIDContext)
    const {revertTranslationHistoryID, setRevertTranslationHistoryID} = useContext(RevertTranslationHistoryIDContext)
    const {deleteTranslationHistoryFlag, setDeleteTranslationHistoryFlag} = useContext(DeleteTranslationHistoryFlagContext)
    const {revertTranslationHistoryFlag, setRevertTranslationHistoryFlag} = useContext(RevertTranslationHistoryFlagContext)
    const history = useHistory()
    const [img, setImg] = useState("")
    const [userRole, setUserRole] = useState("")
    const postID = props.translationHistory.postID
    const order = props.translationHistory.order

    const updateUserRole = async () => {
        const user = await functions.get("/api/user", {username: props.translationHistory.updater}, session, setSessionFlag)
        if (user?.role) setUserRole(user.role)
    }

    const updateImage = async () => {
        const thumb = functions.getThumbnailLink(props.translationHistory.post.images[0].type, props.translationHistory.postID, props.translationHistory.order, props.translationHistory.post.images[0].filename, "medium", mobile)
        const decrypted = await cryptoFunctions.decryptedLink(thumb)
        setImg(decrypted)
    }

    useEffect(() => {
        updateUserRole()
        updateImage()
    }, [props.translationHistory, session])

    const revertTranslationHistory = async () => {
        if (props.current) return Promise.reject()
        await functions.put("/api/translation/save", {postID: props.translationHistory.postID, order: props.translationHistory.order,
        data: props.translationHistory.data}, session, setSessionFlag)
        props.onEdit?.()
    }

    useEffect(() => {
        if (revertTranslationHistoryFlag && props.translationHistory.historyID === revertTranslationHistoryID?.historyID) {
            revertTranslationHistory().then(() => {
                setRevertTranslationHistoryFlag(false)
                setRevertTranslationHistoryID(null)
            }).catch(() => {
                setRevertTranslationHistoryFlag(false)
                setRevertTranslationHistoryID({failed: true, historyID: props.translationHistory.historyID})
            })
        }
    }, [revertTranslationHistoryFlag, revertTranslationHistoryID, session, props.current])

    const deleteTranslationHistory = async () => {
        if (props.current) return Promise.reject()
        await functions.delete("/api/translation/history/delete", {postID, order, historyID: props.translationHistory.historyID}, session, setSessionFlag)
        props.onDelete?.()
    }

    useEffect(() => {
        if (deleteTranslationHistoryFlag && props.translationHistory.historyID === deleteTranslationHistoryID?.historyID) {
            deleteTranslationHistory().then(() => {
                setDeleteTranslationHistoryFlag(false)
                setDeleteTranslationHistoryID(null)
            }).catch(() => {
                setDeleteTranslationHistoryFlag(false)
                setDeleteTranslationHistoryID({failed: true, historyID: props.translationHistory.historyID})
            })
        }
    }, [deleteTranslationHistoryFlag, deleteTranslationHistoryID, session, props.current])

    const revertTranslationHistoryDialog = async () => {
        const post = await functions.get("/api/post", {postID: props.translationHistory.postID}, session, setSessionFlag)
        if (post.locked && !permissions.isMod(session)) return setRevertTranslationHistoryID({failed: "locked", historyID: props.translationHistory.historyID})
        setRevertTranslationHistoryID({failed: false, historyID: props.translationHistory.historyID})
    }

    const deleteTranslationHistoryDialog = async () => {
        setDeleteTranslationHistoryID({failed: false, historyID: props.translationHistory.historyID})
    }

    const translationhistoryOptions = () => {
        if (session.banned) return null
        if (permissions.isMod(session)) {
            return (
                <div className="translationhistoryrow-options">
                    <div className="translationhistoryrow-options-container" onClick={revertTranslationHistoryDialog}>
                        <img className="translationhistoryrow-options-img" src={translationHistoryRevert}/>
                        <span className="translationhistoryrow-options-text">Revert</span>
                    </div>
                    <div className="translationhistoryrow-options-container" onClick={deleteTranslationHistoryDialog}>
                        <img className="translationhistoryrow-options-img" src={translationHistoryDelete}/>
                        <span className="translationhistoryrow-options-text">Delete</span>
                    </div>
                </div>
            )
        } else if (permissions.isContributor(session)) {
            return (
                <div className="translationhistoryrow-options">
                    <div className="translationhistoryrow-options-container" onClick={revertTranslationHistoryDialog}>
                        <img className="translationhistoryrow-options-img" src={translationHistoryRevert}/>
                        <span className="translationhistoryrow-options-text">Revert</span>
                    </div>
                </div>
            )
        }
    }

    const imgClick = (event: React.MouseEvent) => {
        let historyIndex = props.current ? "" : `?translation=${props.translationHistory.historyID}&order=${props.translationHistory.order}`
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/post/${props.translationHistory.postID}${historyIndex}`, "_blank")
        } else {
            history.push(`/post/${props.translationHistory.postID}${historyIndex}`)
        }
    }

    const userClick = (event: React.MouseEvent) => {
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(`/user/${props.translationHistory.updater}`, "_blank")
        } else {
            history.push(`/user/${props.translationHistory.updater}`)
        }
    }


    const dateTextJSX = () => {
        const targetDate = props.translationHistory.updatedDate
        const targetUser = props.translationHistory.updater
        const targetText = "Updated"
        if (userRole === "admin") {
            return (
                <div className="translationhistoryrow-username-container" onClick={userClick} onAuxClick={userClick}>
                    <span className="translationhistoryrow-user-text admin-color">{targetText} {functions.timeAgo(targetDate)} by {functions.toProperCase(targetUser)}</span>
                    <img className="translationhistoryrow-user-label" src={adminCrown}/>
                </div>
            )
        } else if (userRole === "mod") {
            return (
                <div className="translationhistoryrow-username-container" onClick={userClick} onAuxClick={userClick}>
                    <span className="translationhistoryrow-user-text mod-color">{targetText} {functions.timeAgo(targetDate)} by {functions.toProperCase(targetUser)}</span>
                    <img className="translationhistoryrow-user-label" src={modCrown}/>
                </div>
            )
        }
        return <span className="translationhistoryrow-user-text" onClick={userClick} onAuxClick={userClick}>{targetText} {functions.timeAgo(targetDate)} by {functions.toProperCase(targetUser)}</span>
    }

    const diffText = () => {
        if (!props.previousHistory) {
            if (props.translationHistory.data[0].transcript === "No data") return "No data"
            return props.translationHistory.data.map((item: any) => `${item.transcript} -> ${item.translation}`)
        }
        const prevData = props.previousHistory.data
        const newData = props.translationHistory.data
        const prevMap = new Map(prevData.map((item: any) => [item.transcript, item.translation]))
        const newMap = new Map(newData.map((item: any) => [item.transcript, item.translation]))

        const addedEntries = newData
            .filter((item: any) => !prevMap.has(item.transcript))
            .map((item: any) => `+${item.transcript} -> ${item.translation}`)

        const removedEntries = prevData
            .filter((item: any) => !newMap.has(item.transcript))
            .map((item: any) => `-${item.transcript} -> ${item.translation}`)

        if (![...addedEntries, ...removedEntries].length) return null
        
        const addedJSX = addedEntries.map((i: string) => <span className="tag-add">{i}</span>)
        const removedJSX = removedEntries.map((i: string) => <span className="tag-remove">{i}</span>)

        return [...addedJSX, ...removedJSX]
    }

    const translationJSX = () => {
        let jsx = [] as any
        const diffs = diffText()
        if (diffs === "No data") return <span className="translationhistoryrow-tag-text">No data</span>
        for (let i = 0; i < diffs?.length; i++) {
            jsx.push(<span className="translationhistoryrow-tag-text">{diffs[i]}</span>)
        }
        return jsx
    }

    //if (!diffText()) return null

    return (
        <div className="translationhistoryrow">
            {session.username ? translationhistoryOptions() : null}
            <div className="translationhistoryrow-container">
                <img className="translationhistoryrow-img" src={img} onClick={imgClick}/>
            </div>
            <div className="translationhistoryrow-container-row">
                <div className="translationhistoryrow-container">
                    <div className="translationhistoryrow-user-container">
                        {dateTextJSX()}
                        {translationJSX()}
                        {props.translationHistory.reason ? <span className="taghistoryrow-text"><span className="taghistoryrow-label-text">Reason:</span> {props.translationHistory.reason}</span> : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TranslationHistoryRow