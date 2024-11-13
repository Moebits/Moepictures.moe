import React, {useEffect, useState, useRef} from "react"
import {useHistory} from "react-router-dom"
import {useInteractionActions, useSessionSelector, useSessionActions, usePostDialogSelector, usePostDialogActions,
useFlagActions, useActiveActions} from "../store"
import functions from "../structures/Functions"
import Draggable from "react-draggable"
import permissions from "../structures/Permissions"
import "./styles/dialog.less"

const SourceEditDialog: React.FunctionComponent = (props) => {
    const {setEnableDrag} = useInteractionActions()
    const {session} = useSessionSelector()
    const {setSessionFlag} = useSessionActions()
    const {setPostFlag} = useFlagActions()
    const {sourceEditID} = usePostDialogSelector()
    const {setSourceEditID} = usePostDialogActions()
    const {setActionBanner} = useActiveActions()
    const [title, setTitle] = useState("")
    const [translatedTitle, setTranslatedTitle] = useState("")
    const [commentary, setCommentary] = useState("")
    const [translatedCommentary, setTranslatedCommentary] = useState("")
    const [artist, setArtist] = useState("")
    const [posted, setPosted] = useState("")
    const [link, setLink] = useState("")
    const [mirrors, setMirrors] = useState("")
    const [bookmarks, setBookmarks] = useState("")
    const [purchaseLink, setPurchaseLink] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [reason, setReason] = useState("")
    const [error, setError] = useState(false)
    const errorRef = useRef<any>(null)
    const history = useHistory()

    const updateFields = async () => {
        setTitle(sourceEditID.post.title || "")
        setTranslatedTitle(sourceEditID.post.translatedTitle || "")
        setArtist(sourceEditID.post.artist || "")
        setCommentary(sourceEditID.post.commentary || "")
        setTranslatedCommentary(sourceEditID.post.translatedCommentary || "")
        setMirrors(sourceEditID.post.mirrors ? Object.values(sourceEditID.post.mirrors).join("\n") : "")
        setTranslatedTitle(sourceEditID.post.translatedTitle || "")
        if (sourceEditID.post.posted) setPosted(functions.formatDate(new Date(sourceEditID.post.posted), true))
        setLink(sourceEditID.post.link || "")
        setBookmarks(sourceEditID.post.bookmarks || "")
        setPurchaseLink(sourceEditID.post.purchaseLink || "")
    }

    const reset = () => {
        setTitle("")
        setTranslatedTitle("")
        setCommentary("")
        setTranslatedCommentary("")
        setArtist("")
        setLink("")
        setPosted("")
        setMirrors("")
    }

    useEffect(() => {
        document.title = "Source Edit"
    }, [])

    useEffect(() => {
        if (sourceEditID) {
            document.body.style.pointerEvents = "none"
            updateFields()
        } else {
            document.body.style.pointerEvents = "all"
            setEnableDrag(true)
            reset()
        }
    }, [sourceEditID])

    const sourceEdit = async () => {
        if (permissions.isContributor(session)) {
            const data = {
                postID: sourceEditID.post.postID,
                unverified: sourceEditID.unverified,
                source: {
                    title,
                    translatedTitle,
                    artist,
                    posted,
                    link,
                    commentary,
                    translatedCommentary,
                    bookmarks,
                    purchaseLink,
                    mirrors
                },
                reason
            }
            setSourceEditID(null)
            await functions.put("/api/post/quickedit", data, session, setSessionFlag)
            setPostFlag(true)
            setActionBanner("source-edit")
        } else {
            const badReason = functions.validateReason(reason)
            if (badReason) {
                setError(true)
                if (!errorRef.current) await functions.timeout(20)
                errorRef.current!.innerText = badReason
                await functions.timeout(2000)
                return setError(false)
            }
            const data = {
                postID: sourceEditID.post.postID,
                unverified: sourceEditID.unverified,
                source: {
                    title,
                    translatedTitle,
                    artist,
                    posted,
                    link,
                    commentary,
                    translatedCommentary,
                    bookmarks,
                    purchaseLink,
                    mirrors
                },
                reason
            }
            await functions.put("/api/post/quickedit/unverified", data, session, setSessionFlag)
            setSubmitted(true)
        }
    }

    const click = (button: "accept" | "reject") => {
        if (button === "accept") {
            sourceEdit()
        } else {
            setSourceEditID(null)
        }
    }

    const close = () => {
        setSourceEditID(null)
        setSubmitted(false)
        setReason("")
    }

    const mainJSX = () => {
        return (
            <>
            <div className="dialog-row">
                <span className="dialog-text">Title: </span>
                <input className="dialog-input-small" type="text" spellCheck={false} value={title} onChange={(event) => setTitle(event.target.value)}/>
            </div>
            <div className="dialog-row">
                <span className="dialog-text">Translated Title: </span>
                <input className="dialog-input-small" type="text" spellCheck={false} value={translatedTitle} onChange={(event) => setTranslatedTitle(event.target.value)}/>
            </div>
            <div className="dialog-row">
                <span className="dialog-text">Artist: </span>
                <input className="dialog-input-small" type="text" spellCheck={false} value={artist} onChange={(event) => setArtist(event.target.value)}/>
            </div>
            <div className="dialog-row">
                <span className="dialog-text">Posted: </span>
                <input className="dialog-input-small" style={{width: "30%"}} type="date" spellCheck={false} value={posted} onChange={(event) => setPosted(event.target.value)}/>
            </div>
            <div className="dialog-row">
                <span className="dialog-text">Link: </span>
                <input className="dialog-input" type="text" spellCheck={false} value={link} onChange={(event) => setLink(event.target.value)}/>
            </div>
            <div className="dialog-row">
                <span className="dialog-text">Bookmarks: </span>
                <input className="dialog-input-small" style={{width: "15%"}} type="text" spellCheck={false} value={bookmarks} onChange={(event) => setBookmarks(event.target.value)}/>
            </div>
            <div className="dialog-row">
                <span className="dialog-text">Commentary: </span>
            </div>
            <div className="dialog-row">
                <textarea className="dialog-textarea-small" style={{resize: "vertical"}} spellCheck={false} value={commentary} onChange={(event) => setCommentary(event.target.value)}></textarea>
            </div>
            <div className="dialog-row">
                <span className="dialog-text">Translated Commentary: </span>
            </div>
            <div className="dialog-row">
                <textarea className="dialog-textarea-small" style={{resize: "vertical"}} spellCheck={false} value={translatedCommentary} onChange={(event) => setTranslatedCommentary(event.target.value)}></textarea>
            </div>
            <div className="dialog-row">
                <span className="dialog-text">Mirrors: </span>
            </div>
            <div className="dialog-row">
                <textarea className="dialog-textarea-small" style={{resize: "vertical"}} spellCheck={false} value={mirrors} onChange={(event) => setMirrors(event.target.value)}></textarea>
            </div>
            <div className="dialog-row">
                <span className="dialog-text">Buy Link: </span>
                <input className="dialog-input" style={{width: "75%"}} type="text" spellCheck={false} value={purchaseLink} onChange={(event) => setPurchaseLink(event.target.value)}/>
            </div>
            <div className="dialog-row">
                <span className="dialog-text">Reason: </span>
                <input style={{width: "100%"}} className="dialog-input" type="text" spellCheck={false} value={reason} onChange={(event) => setReason(event.target.value)}/>
            </div>
            </>
        )
    }

    if (sourceEditID) {
        if (session.banned) {
            return (
                <div className="dialog">
                    <Draggable handle=".dialog-title-container">
                    <div className="dialog-box" onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                            <div className="dialog-title-container">
                                <span className="dialog-title">Source Edit</span>
                            </div>
                            <span className="dialog-ban-text">You are banned. Cannot edit.</span>
                            <button className="dialog-ban-button" onClick={() => click("reject")}>
                                <span className="dialog-ban-button-text">←Back</span>
                            </button>
                        </div>
                    </Draggable>
                </div>
            )
        }

        if (sourceEditID.post.locked && !permissions.isMod(session)) {
            return (
                <div className="dialog">
                    <Draggable handle=".dialog-title-container">
                    <div className="dialog-box" onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                            <div className="dialog-title-container">
                                <span className="dialog-title">Source Edit</span>
                            </div>
                            <span className="dialog-ban-text">This post is locked. Cannot edit.</span>
                            <button className="dialog-ban-button" onClick={() => click("reject")}>
                                <span className="dialog-ban-button-text">←Back</span>
                            </button>
                        </div>
                    </Draggable>
                </div>
            )
        }

        if (permissions.isContributor(session)) {
            return (
                <div className="dialog">
                    <Draggable handle=".dialog-title-container">
                    <div className="dialog-box" style={{marginTop: "-50px"}} onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                        <div className="dialog-container">
                            <div className="dialog-title-container">
                                <span className="dialog-title">Source Edit</span>
                            </div>
                            {mainJSX()}
                            {error ? <div className="dialog-validation-container"><span className="dialog-validation" ref={errorRef}></span></div> : null}
                            <div className="dialog-row">
                                <button onClick={() => click("reject")} className="dialog-button">{"Cancel"}</button>
                                <button onClick={() => click("accept")} className="dialog-button">{"Edit"}</button>
                            </div>
                        </div>
                    </div>
                    </Draggable>
                </div>
            )
        }

        return (
            <div className="dialog">
                <Draggable handle=".dialog-title-container">
                <div className="dialog-box" style={{marginTop: "-50px"}} onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                    <div className="dialog-container">
                        <div className="dialog-title-container">
                            <span className="dialog-title">Source Edit Request</span>
                        </div>
                        {submitted ? <>
                        <div className="dialog-row">
                            <span className="dialog-text">Your edit request was submitted.</span>
                        </div>
                        <div className="dialog-row">
                            <button onClick={() => close()} className="dialog-button">{"Cancel"}</button>
                            <button onClick={() => close()} className="dialog-button">{"OK"}</button>
                        </div> 
                        </> : <>
                        {mainJSX()}
                        {error ? <div className="dialog-validation-container"><span className="dialog-validation" ref={errorRef}></span></div> : null}
                        <div className="dialog-row">
                            <button onClick={() => click("reject")} className="dialog-button">{"Cancel"}</button>
                            <button onClick={() => click("accept")} className="dialog-button">{"Submit Request"}</button>
                        </div>
                        </>}
                    </div>
                </div>
                </Draggable>
            </div>
        )
    }
    return null
}

export default SourceEditDialog