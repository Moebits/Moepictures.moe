import React, {useEffect, useState, useRef} from "react"
import {useHistory} from "react-router-dom"
import {useInteractionActions, usePostDialogSelector, usePostDialogActions, useFlagActions, useSessionSelector, useSessionActions} from "../store"
import functions from "../structures/Functions"
import Draggable from "react-draggable"
import "./styles/dialog.less"
import permissions from "../structures/Permissions"

interface Props {
    post: any
}

const LockPostDialog: React.FunctionComponent<Props> = (props) => {
    const {setEnableDrag} = useInteractionActions()
    const {lockPostID} = usePostDialogSelector()
    const {setLockPostID} = usePostDialogActions()
    const {setPostFlag} = useFlagActions()
    const {session} = useSessionSelector()
    const {setSessionFlag} = useSessionActions()
    const [error, setError] = useState(false)
    const errorRef = useRef<any>(null)
    const history = useHistory()

    useEffect(() => {
        document.title = "Lock Post"
    }, [])

    useEffect(() => {
        if (lockPostID) {
            // document.body.style.overflowY = "hidden"
            document.body.style.pointerEvents = "none"
        } else {
            // document.body.style.overflowY = "visible"
            document.body.style.pointerEvents = "all"
            setEnableDrag(true)
        }
    }, [lockPostID])

    const lockPost = async () => {
        if (permissions.isMod(session)) {
            await functions.post("/api/post/lock",  {postID: props.post.postID}, session, setSessionFlag)
            setPostFlag(true)
            localStorage.removeItem("savedPost")
            localStorage.removeItem("savedPosts")
            localStorage.removeItem("savedTags")
        }
    }

    const click = (button: "accept" | "reject", keep?: boolean) => {
        if (button === "accept") {
            lockPost()
        }
        if (!keep) setLockPostID(null)
    }

    const getTitle = () => {
        if (props.post.locked) {
            return "Unlock Post"
        } else {
            return "Lock Post"
        }
    }

    const getPrompt = () => {
        if (props.post.locked) {
            return "Do you want to unlock this post?"
        } else {
            return "Are you sure you want to lock this post?"
        }
    }

    if (lockPostID) {
        if (permissions.isMod(session)) {
            return (
                <div className="dialog">
                    <Draggable handle=".dialog-title-container">
                    <div className="dialog-box" style={{width: "280px", height: "200px"}} onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                        <div className="dialog-container">
                            <div className="dialog-title-container">
                                <span className="dialog-title">{getTitle()}</span>
                            </div>
                            <div className="dialog-row">
                                <span className="dialog-text">{getPrompt()}</span>
                            </div>
                            <div className="dialog-row">
                                <button onClick={() => click("reject")} className="dialog-button">{"No"}</button>
                                <button onClick={() => click("accept")} className="dialog-button">{"Yes"}</button>
                            </div>
                        </div>
                    </div>
                    </Draggable>
                </div>
            )
        }
    }
    return null
}

export default LockPostDialog