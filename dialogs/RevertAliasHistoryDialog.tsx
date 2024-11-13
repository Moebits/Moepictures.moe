import React, {useEffect, useState, useRef} from "react"
import {useHistory} from "react-router-dom"
import {useInteractionActions, useTagDialogSelector, useTagDialogActions, useSessionSelector} from "../store"
import functions from "../structures/Functions"
import permissions from "../structures/Permissions"
import Draggable from "react-draggable"
import "./styles/dialog.less"

const RevertAliasHistoryDialog: React.FunctionComponent = (props) => {
    const {setEnableDrag} = useInteractionActions()
    const {revertAliasHistoryID} = useTagDialogSelector()
    const {setRevertAliasHistoryID, setRevertAliasHistoryFlag} = useTagDialogActions()
    const {session} = useSessionSelector()
    const [error, setError] = useState(false)
    const errorRef = useRef<any>(null)
    const history = useHistory()

    useEffect(() => {
        if (revertAliasHistoryID) {
            // document.body.style.overflowY = "hidden"
            document.body.style.pointerEvents = "none"
            document.title = getTitle() || ""
        } else {
            // document.body.style.overflowY = "visible"
            document.body.style.pointerEvents = "all"
            setEnableDrag(true)
        }
    }, [revertAliasHistoryID])

    const click = (button: "accept" | "reject") => {
        if (button === "accept") {
            setRevertAliasHistoryFlag(true)
        } else {
            setRevertAliasHistoryID(null)
        }
    }

    const getTitle = () => {
        if (revertAliasHistoryID.type === "alias") {
            return "Undo Aliasing"
        } else if (revertAliasHistoryID.type === "undo alias") {
            return "Redo Aliasing"
        } else if (revertAliasHistoryID.type === "implication") {
            return "Undo Implication"
        } else if (revertAliasHistoryID.type === "undo implication") {
            return "Redo Implication"
        }
    }
    const getDescription = () => {
        if (revertAliasHistoryID.type === "alias") {
            return "Would you like to undo this aliasing?"
        } else if (revertAliasHistoryID.type === "undo alias") {
            return "Would you like to redo this aliasing?"
        } else if (revertAliasHistoryID.type === "implication") {
            return "Would you like to undo this implication?"
        } else if (revertAliasHistoryID.type === "undo implication") {
            return "Would you like to redo this implication?"
        }
    }

    if (revertAliasHistoryID) {
        if (permissions.isMod(session)) {
            return (
                <div className="dialog">
                    <Draggable handle=".dialog-title-container">
                    <div className="dialog-box" style={{width: "250px", height: "190px"}} onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                        <div className="dialog-container">
                            <div className="dialog-title-container">
                                <span className="dialog-title">{getTitle()}</span>
                            </div>
                            <div className="dialog-row">
                                <span className="dialog-text">{getDescription()}</span>
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

export default RevertAliasHistoryDialog