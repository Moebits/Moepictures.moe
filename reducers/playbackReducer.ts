import {createSlice} from "@reduxjs/toolkit"
import {useSelector, useDispatch} from "react-redux"
import type {StoreState, StoreDispatch} from "../store"
import {UnverifiedPost, PostHistory, PostFull} from "../types/Types"

const playbackSlice = createSlice({
    name: "playback",
    initialState: {
        audio: "",
        audioPost: null as UnverifiedPost | PostHistory | PostFull | null,
        speed: 1,
        reverse: false,
        pitch: 0,
        volume: 0.75,
        previousVolume: 0,
        paused: false,
        preservePitch: true,
        duration: 0,
        seekTo: null as number | null,
        secondsProgress: 0,
        progress: 0,
        dragProgress: null as number | null,
        dragging: false,
        rewindFlag: false,
        fastForwardFlag: false,
        playFlag: null as string | null,
        volumeFlag: null as number | null,
        muteFlag: false,
        resetFlag: false,
        disableZoom: true,
        audioSpeed: 1,
        audioReverse: false,
        audioSecondsProgress: 0,
        audioProgress: 0,
        audioDragProgress: null as number | null,
        audioVolume: 0.75,
        audioPreviousVolume: 0,
        audioPaused: false,
        audioDuration: 0,
        audioSeekTo: null as number | null,
        audioDragging: false,
        audioRewindFlag: false,
        audioFastForwardFlag: false,
        showMiniPlayer: false,
        showBigPlayer: true
    },
    reducers: {
        setAudio: (state, action) => {state.audio = action.payload},
        setAudioPost: (state, action) => {state.audioPost = action.payload},
        setSpeed: (state, action) => {state.speed = action.payload},
        setReverse: (state, action) => {state.reverse = action.payload},
        setPitch: (state, action) => {state.pitch = action.payload},
        setVolume: (state, action) => {state.volume = action.payload},
        setPreviousVolume: (state, action) => {state.previousVolume = action.payload},
        setPaused: (state, action) => {state.paused = action.payload},
        setPreservePitch: (state, action) => {state.preservePitch = action.payload},
        setDuration: (state, action) => {state.duration = action.payload},
        setSeekTo: (state, action) => {state.seekTo = action.payload},
        setSecondsProgress: (state, action) => {state.secondsProgress = action.payload},
        setProgress: (state, action) => {state.progress = action.payload},
        setDragProgress: (state, action) => {state.dragProgress = action.payload},
        setDragging: (state, action) => {state.dragging = action.payload},
        setRewindFlag: (state, action) => {state.rewindFlag = action.payload},
        setFastForwardFlag: (state, action) => {state.fastForwardFlag = action.payload},
        setPlayFlag: (state, action) => {state.playFlag = action.payload},
        setVolumeFlag: (state, action) => {state.volumeFlag = action.payload},
        setMuteFlag: (state, action) => {state.muteFlag = action.payload},
        setResetFlag: (state, action) => {state.resetFlag = action.payload},
        setDisableZoom: (state, action) => {state.disableZoom = action.payload},
        setAudioSpeed: (state, action) => {state.audioSpeed = action.payload},
        setAudioReverse: (state, action) => {state.audioReverse = action.payload},
        setAudioSecondsProgress: (state, action) => {state.audioSecondsProgress = action.payload},
        setAudioProgress: (state, action) => {state.audioProgress = action.payload},
        setAudioDragProgress: (state, action) => {state.audioDragProgress = action.payload},
        setAudioVolume: (state, action) => {state.audioVolume = action.payload},
        setAudioPreviousVolume: (state, action) => {state.audioPreviousVolume = action.payload},
        setAudioPaused: (state, action) => {state.audioPaused = action.payload},
        setAudioDuration: (state, action) => {state.audioDuration = action.payload},
        setAudioSeekTo: (state, action) => {state.audioSeekTo = action.payload},
        setAudioDragging: (state, action) => {state.audioDragging = action.payload},
        setAudioRewindFlag: (state, action) => {state.audioRewindFlag = action.payload},
        setAudioFastForwardFlag: (state, action) => {state.audioFastForwardFlag = action.payload},
        setShowMiniPlayer: (state, action) => {state.showMiniPlayer = action.payload},
        setShowBigPlayer: (state, action) => {state.showBigPlayer = action.payload}
    }
})

const {
    setAudio, setAudioPost, setSpeed, setReverse, setPitch, setVolume, setPreviousVolume, 
    setPaused, setPreservePitch, setDuration, setSeekTo, setSecondsProgress, setProgress,
    setDragProgress, setDragging, setRewindFlag, setFastForwardFlag, setPlayFlag, 
    setVolumeFlag, setMuteFlag, setResetFlag, setDisableZoom, setAudioSpeed, 
    setAudioReverse, setAudioSecondsProgress, setAudioProgress, setAudioDragProgress, 
    setAudioVolume, setAudioPreviousVolume, setAudioPaused, setAudioDuration, 
    setAudioSeekTo, setAudioDragging, setAudioRewindFlag, setAudioFastForwardFlag,
    setShowMiniPlayer, setShowBigPlayer
} = playbackSlice.actions

export const usePlaybackSelector = () => {
    const selector = useSelector.withTypes<StoreState>()
    return {
        audio: selector((state) => state.playback.audio),
        audioPost: selector((state) => state.playback.audioPost),
        speed: selector((state) => state.playback.speed),
        reverse: selector((state) => state.playback.reverse),
        pitch: selector((state) => state.playback.pitch),
        volume: selector((state) => state.playback.volume),
        previousVolume: selector((state) => state.playback.previousVolume),
        paused: selector((state) => state.playback.paused),
        preservePitch: selector((state) => state.playback.preservePitch),
        duration: selector((state) => state.playback.duration),
        seekTo: selector((state) => state.playback.seekTo),
        secondsProgress: selector((state) => state.playback.secondsProgress),
        progress: selector((state) => state.playback.progress),
        dragProgress: selector((state) => state.playback.dragProgress),
        dragging: selector((state) => state.playback.dragging),
        rewindFlag: selector((state) => state.playback.rewindFlag),
        fastForwardFlag: selector((state) => state.playback.fastForwardFlag),
        playFlag: selector((state) => state.playback.playFlag),
        volumeFlag: selector((state) => state.playback.volumeFlag),
        muteFlag: selector((state) => state.playback.muteFlag),
        resetFlag: selector((state) => state.playback.resetFlag),
        disableZoom: selector((state) => state.playback.disableZoom),
        audioSpeed: selector((state) => state.playback.audioSpeed),
        audioReverse: selector((state) => state.playback.audioReverse),
        audioSecondsProgress: selector((state) => state.playback.audioSecondsProgress),
        audioProgress: selector((state) => state.playback.audioProgress),
        audioDragProgress: selector((state) => state.playback.audioDragProgress),
        audioVolume: selector((state) => state.playback.audioVolume),
        audioPreviousVolume: selector((state) => state.playback.audioPreviousVolume),
        audioPaused: selector((state) => state.playback.audioPaused),
        audioDuration: selector((state) => state.playback.audioDuration),
        audioSeekTo: selector((state) => state.playback.audioSeekTo),
        audioDragging: selector((state) => state.playback.audioDragging),
        audioRewindFlag: selector((state) => state.playback.audioRewindFlag),
        audioFastForwardFlag: selector((state) => state.playback.audioFastForwardFlag),
        showMiniPlayer: selector((state) => state.playback.showMiniPlayer),
        showBigPlayer: selector((state) => state.playback.showBigPlayer)
    }
}

export const usePlaybackActions = () => {
    const dispatch = useDispatch.withTypes<StoreDispatch>()()
    return {
        setAudio: (state: string) => dispatch(setAudio(state)),
        setAudioPost: (state: UnverifiedPost | PostHistory | PostFull | null) => dispatch(setAudioPost(state)),
        setSpeed: (state: number) => dispatch(setSpeed(state)),
        setReverse: (state: boolean) => dispatch(setReverse(state)),
        setPitch: (state: number) => dispatch(setPitch(state)),
        setVolume: (state: number) => dispatch(setVolume(state)),
        setPreviousVolume: (state: number) => dispatch(setPreviousVolume(state)),
        setPaused: (state: boolean) => dispatch(setPaused(state)),
        setPreservePitch: (state: boolean) => dispatch(setPreservePitch(state)),
        setDuration: (state: number) => dispatch(setDuration(state)),
        setSeekTo: (state: number | null) => dispatch(setSeekTo(state)),
        setSecondsProgress: (state: number) => dispatch(setSecondsProgress(state)),
        setProgress: (state: number) => dispatch(setProgress(state)),
        setDragProgress: (state: number | null) => dispatch(setDragProgress(state)),
        setDragging: (state: boolean) => dispatch(setDragging(state)),
        setRewindFlag: (state: boolean) => dispatch(setRewindFlag(state)),
        setFastForwardFlag: (state: boolean) => dispatch(setFastForwardFlag(state)),
        setPlayFlag: (state: string | null) => dispatch(setPlayFlag(state)),
        setVolumeFlag: (state: number | null) => dispatch(setVolumeFlag(state)),
        setMuteFlag: (state: boolean) => dispatch(setMuteFlag(state)),
        setResetFlag: (state: boolean) => dispatch(setResetFlag(state)),
        setDisableZoom: (state: boolean) => dispatch(setDisableZoom(state)),
        setAudioSpeed: (state: number) => dispatch(setAudioSpeed(state)),
        setAudioReverse: (state: boolean) => dispatch(setAudioReverse(state)),
        setAudioSecondsProgress: (state: number) => dispatch(setAudioSecondsProgress(state)),
        setAudioProgress: (state: number) => dispatch(setAudioProgress(state)),
        setAudioDragProgress: (state: number | null) => dispatch(setAudioDragProgress(state)),
        setAudioVolume: (state: number) => dispatch(setAudioVolume(state)),
        setAudioPreviousVolume: (state: number) => dispatch(setAudioPreviousVolume(state)),
        setAudioPaused: (state: boolean) => dispatch(setAudioPaused(state)),
        setAudioDuration: (state: number) => dispatch(setAudioDuration(state)),
        setAudioSeekTo: (state: number | null) => dispatch(setAudioSeekTo(state)),
        setAudioDragging: (state: boolean) => dispatch(setAudioDragging(state)),
        setAudioRewindFlag: (state: boolean) => dispatch(setAudioRewindFlag(state)),
        setAudioFastForwardFlag: (state: boolean) => dispatch(setAudioFastForwardFlag(state)),
        setShowMiniPlayer: (state: boolean) => dispatch(setShowMiniPlayer(state)),
        setShowBigPlayer: (state: boolean) => dispatch(setShowBigPlayer(state))
    }
}

export default playbackSlice.reducer