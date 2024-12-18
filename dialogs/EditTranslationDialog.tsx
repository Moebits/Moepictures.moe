import React, {useEffect, useState} from "react"
import {useHistory} from "react-router-dom"
import {useThemeSelector, useInteractionActions, useTranslationDialogSelector, useTranslationDialogActions} from "../store"
import functions from "../structures/Functions"
import "./styles/edittranslationdialog.less"
import Draggable from "react-draggable"

const EditTranslationDialog: React.FunctionComponent = (props) => {
    const {i18n} = useThemeSelector()
    const {setEnableDrag} = useInteractionActions()
    const {editTranslationID, editTranslationText, editTranslationTranscript} = useTranslationDialogSelector()
    const {setEditTranslationFlag, setEditTranslationID, setEditTranslationText, setEditTranslationTranscript} = useTranslationDialogActions()
    const history = useHistory()

    useEffect(() => {
        document.title = i18n.dialogs.editTranslation.title
    }, [i18n])

    useEffect(() => {
        if (editTranslationID !== null) {
            document.body.style.pointerEvents = "all"
            setEnableDrag(false)
        } else {
            document.body.style.pointerEvents = "all"
            setEnableDrag(true)
        }
    }, [editTranslationID])

    const click = (button: "accept" | "reject") => {
        if (button === "accept") {
            setEditTranslationFlag(true)
        } else {
            setEditTranslationText("")
            setEditTranslationTranscript("")
            setEditTranslationID(null)
        }
    }

    if (editTranslationID !== null) {
        return (
            <div className="edit-translation-dialog">
                <Draggable handle=".edit-translation-dialog-title-container">
                <div className="edit-translation-dialog-box" onMouseEnter={() => setEnableDrag(false)} onMouseLeave={() => setEnableDrag(true)}>
                    <div className="edit-translation-container">
                        <div className="edit-translation-dialog-title-container">
                            <span className="edit-translation-dialog-title">{i18n.dialogs.editTranslation.title}</span>
                        </div>
                        <div className="edit-translation-dialog-row">
                            <span className="edit-translation-dialog-text">{i18n.labels.transcription}</span>
                        </div>
                        <div className="edit-translation-dialog-row" onMouseEnter={() => setEnableDrag(false)}>
                            <textarea className="edit-translation-textarea" spellCheck={false} value={editTranslationTranscript} onChange={(event) => setEditTranslationTranscript(event.target.value)}></textarea>
                        </div>
                        <div className="edit-translation-dialog-row">
                            <span className="edit-translation-dialog-text">{i18n.labels.translation}</span>
                        </div>
                        <div className="edit-translation-dialog-row" onMouseEnter={() => setEnableDrag(false)}>
                            <textarea className="edit-translation-textarea" spellCheck={false} value={editTranslationText} onChange={(event) => setEditTranslationText(event.target.value)}></textarea>
                        </div>
                        <div className="edit-translation-dialog-row">
                            <button onClick={() => click("reject")} className="dialog-button">{i18n.buttons.cancel}</button>
                            <button onClick={() => click("accept")} className="dialog-button">{i18n.buttons.edit}</button>
                        </div>
                    </div>
                </div>
                </Draggable>
            </div>
        )
    }
    return null
}

export default EditTranslationDialog