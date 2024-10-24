import React, {useEffect, useContext, useState, useRef, useReducer} from "react"
import {useHistory, useLocation} from "react-router-dom"
import TitleBar from "../components/TitleBar"
import NavBar from "../components/NavBar"
import SideBar from "../components/SideBar"
import Footer from "../components/Footer"
import functions from "../structures/Functions"
import PostHistoryRow from "../components/PostHistoryRow"
import RevertPostHistoryDialog from "../dialogs/RevertPostHistoryDialog"
import DeletePostHistoryDialog from "../dialogs/DeletePostHistoryDialog"
import TagHistoryRow from "../components/TagHistoryRow"
import RevertTagHistoryDialog from "../dialogs/RevertTagHistoryDialog"
import DeleteTagHistoryDialog from "../dialogs/DeleteTagHistoryDialog"
import TranslationHistoryRow from "../components/TranslationHistoryRow"
import RevertTranslationHistoryDialog from "../dialogs/RevertTranslationHistoryDialog"
import DeleteTranslationHistoryDialog from "../dialogs/DeleteTranslationHistoryDialog"
import SearchHistoryRow from "../components/SearchHistoryRow"
import DeleteSearchHistoryDialog from "../dialogs/DeleteSearchHistoryDialog"
import DeleteAllSearchHistoryDialog from "../dialogs/DeleteAllSearchHistoryDialog"
import scrollIcon from "../assets/icons/scroll.png"
import pageIcon from "../assets/icons/page.png"
import PageDialog from "../dialogs/PageDialog"
import searchHistoryDelete from "../assets/icons/delete.png"
import permissions from "../structures/Permissions"
import matureTags from "../assets/json/mature-tags.json"
import historyPost from "../assets/icons/history-post.png"
import historySearch from "../assets/icons/history-search.png"
import historyTag from "../assets/icons/history-tag.png"
import historyTranslate from "../assets/icons/history-translate.png"
import historyPostActive from "../assets/icons/history-post-active.png"
import historySearchActive from "../assets/icons/history-search-active.png"
import historyTagActive from "../assets/icons/history-tag-active.png"
import historyTranslateActive from "../assets/icons/history-translate-active.png"
import {ThemeContext, EnableDragContext, HideNavbarContext, HideSidebarContext, MobileContext, SessionContext, ScrollContext, ShowPageDialogContext,
RelativeContext, HideTitlebarContext, ActiveDropdownContext, HeaderTextContext, SidebarTextContext, SessionFlagContext, HistoryPageContext, PageFlagContext,
SiteHueContext, SiteSaturationContext, SiteLightnessContext, ShowDeleteAllHistoryDialogContext, RedirectContext, RestrictTypeContext, PremiumRequiredContext} from "../Context"
import "./styles/historypage.less"

let replace = false

const HistoryPage: React.FunctionComponent = () => {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0)
    const {theme, setTheme} = useContext(ThemeContext)
    const {siteHue, setSiteHue} = useContext(SiteHueContext)
    const {siteSaturation, setSiteSaturation} = useContext(SiteSaturationContext)
    const {siteLightness, setSiteLightness} = useContext(SiteLightnessContext)
    const {enableDrag, setEnableDrag} = useContext(EnableDragContext)
    const {hideNavbar, setHideNavbar} = useContext(HideNavbarContext)
    const {hideTitlebar, setHideTitlebar} = useContext(HideTitlebarContext)
    const {hideSidebar, setHideSidebar} = useContext(HideSidebarContext)
    const {relative, setRelative} = useContext(RelativeContext)
    const {activeDropdown, setActiveDropdown} = useContext(ActiveDropdownContext)
    const {headerText, setHeaderText} = useContext(HeaderTextContext)
    const {sidebarText, setSidebarText} = useContext(SidebarTextContext)
    const {scroll, setScroll} = useContext(ScrollContext)
    const {mobile, setMobile} = useContext(MobileContext)
    const {session, setSession} = useContext(SessionContext)
    const {sessionFlag, setSessionFlag} = useContext(SessionFlagContext)
    const {historyPage, setHistoryPage} = useContext(HistoryPageContext)
    const {showPageDialog, setShowPageDialog} = useContext(ShowPageDialogContext)
    const {redirect, setRedirect} = useContext(RedirectContext)
    const {premiumRequired, setPremiumRequired} = useContext(PremiumRequiredContext)
    const {showDeleteAllHistoryDialog, setShowDeleteAllHistoryDialog} = useContext(ShowDeleteAllHistoryDialogContext)
    const {restrictType, setRestrictType} = useContext(RestrictTypeContext)
    const {pageFlag, setPageFlag} = useContext(PageFlagContext)
    const [index, setIndex] = useState(0)
    const [postStates, setPostStates] = useState([]) as any
    const [tagStates, setTagStates] = useState([]) as any
    const [translationStates, setTranslationStates] = useState([]) as any
    const [searchStates, setSearchStates] = useState([]) as any
    const [visibleHistoryPosts, setVisibleHistoryPosts] = useState([]) as any
    const [visibleHistoryTags, setVisibleHistoryTags] = useState([]) as any
    const [visibleHistoryTranslations, setVisibleHistoryTranslations] = useState([]) as any
    const [visibleHistorySearch, setVisibleHistorySearch] = useState([]) as any
    const [offset, setOffset] = useState(0)
    const [ended, setEnded] = useState(false)
    const [queryPage, setQueryPage] = useState(1)
    const [historyTab, setHistoryTab] = useState("")
    const history = useHistory()
    const location = useLocation()

    useEffect(() => {
        const typeParam = new URLSearchParams(window.location.search).get("type")
        if (typeParam) setHistoryTab(typeParam)
        const pageParam = new URLSearchParams(window.location.search).get("page")
        if (pageParam) setQueryPage(Number(pageParam))
        const onDOMLoaded = () => {
            const savedScroll = localStorage.getItem("scroll")
            if (savedScroll) setScroll(savedScroll === "true")
            const savedPage = localStorage.getItem("historyPage")
            const savedTab = localStorage.getItem("historyTab")
            if (savedPage) setHistoryPage(Number(savedPage))
            if (savedTab) setHistoryTab(savedTab)
            if (pageParam) setHistoryPage(Number(pageParam))
        }
        const updateStateChange = () => {
            replace = true
            const pageParam = new URLSearchParams(window.location.search).get("page")
            if (pageParam) setHistoryPage(Number(pageParam))
        }
        window.addEventListener("load", onDOMLoaded)
        window.addEventListener("popstate", updateStateChange)
        window.addEventListener("pushstate", updateStateChange)
        return () => {
            window.removeEventListener("load", onDOMLoaded)
            window.removeEventListener("popstate", updateStateChange)
            window.removeEventListener("pushstate", updateStateChange)
        }
    }, [location])

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    useEffect(() => {
        if (!session.cookie) return
        if (!session.username) {
            setRedirect("/history")
            history.push("/login")
            setSidebarText("Login required.")
        }
        const typeParam = new URLSearchParams(window.location.search).get("type")
        if (!typeParam) setHistoryTab(permissions.isPremium(session) ? "search" : "post")
    }, [session])

    const getHistoryStates = () => {
        if (historyTab === "post") {
            return postStates
        }
        if (historyTab === "tag") {
            return tagStates
        }
        if (historyTab === "translation") {
            return translationStates
        }
        if (historyTab === "search") {
            return searchStates
        }
        return []
    }

    const historyStates = getHistoryStates()

    const setHistoryStates = (states: any) => {
        if (historyTab === "post") {
            setPostStates(states)
        }
        if (historyTab === "tag") {
            setTagStates(states)
        }
        if (historyTab === "translation") {
            setTranslationStates(states)
        }
        if (historyTab === "search") {
            setSearchStates(states)
        }
    }

    const getVisibleHistory = () => {
        if (historyTab === "post") {
            return visibleHistoryPosts
        }
        if (historyTab === "tag") {
            return visibleHistoryTags
        }
        if (historyTab === "translation") {
            return visibleHistoryTranslations
        }
        if (historyTab === "search") {
            return visibleHistorySearch
        }
        return []
    }

    const visibleHistory = getVisibleHistory()

    const setVisibleHistory = (visible: any) => {
        if (historyTab === "post") {
            setVisibleHistoryPosts(visible)
        }
        if (historyTab === "tag") {
            setVisibleHistoryTags(visible)
        }
        if (historyTab === "translation") {
            setVisibleHistoryTranslations(visible)
        }
        if (historyTab === "search") {
            setVisibleHistorySearch(visible)
        }
    }

    const resetState = () => {
        setHistoryPage(1)
        setQueryPage(1)
        setOffset(0)
    }

    const updateHistory = async () => {
        let result = []
        if (historyTab === "post") {
            result = await functions.get("/api/post/history", null, session, setSessionFlag)
        }
        if (historyTab === "tag") {
            result = await functions.get("/api/tag/history", null, session, setSessionFlag)
        }
        if (historyTab === "translation") {
            result = await functions.get("/api/translation/history", null, session, setSessionFlag)
        }
        if (historyTab === "search") {
            result = await functions.get("/api/user/history", null, session, setSessionFlag).catch(() => [])
        }
        setEnded(false)
        setIndex(0)
        setVisibleHistory([])
        setHistoryStates(result)
    }

    useEffect(() => {
        resetState()
        updateHistory()
        document.title = `${functions.toProperCase(historyTab)} History`
    }, [session, historyTab])

    useEffect(() => {
        setHideNavbar(true)
        setHideTitlebar(true)
        setHideSidebar(false)
        setRelative(false)
        setActiveDropdown("none")
        setHeaderText("")
        setSidebarText("")
    }, [])

    useEffect(() => {
        if (mobile) {
            setRelative(true)
        } else {
            setRelative(false)
        }
    }, [mobile])

    const getPageAmount = () => {
        return 15
    }

    useEffect(() => {
        const updateHistory = () => {
            let currentIndex = index
            const newVisibleHistory = [] as any
            for (let i = 0; i < 10; i++) {
                if (!historyStates[currentIndex]) break
                if (!session.showR18) {
                    if (historyTab === "tag") {
                        if (functions.arrayIncludes(historyStates[currentIndex].tag, matureTags, true)) {
                            currentIndex++
                            continue
                        }
                    } else {
                        if (historyStates[currentIndex].restrict === "explicit") {
                            continue
                        }
                    }
                }
                newVisibleHistory.push(historyStates[currentIndex])
                currentIndex++
            }
            setIndex(currentIndex)
            setVisibleHistory(functions.removeDuplicates(newVisibleHistory))
        }
        if (scroll) updateHistory()
    }, [historyStates, scroll, session])

    const updateOffset = async () => {
        if (ended) return
        let newOffset = offset + 100
        let padded = false
        if (!scroll) {
            newOffset = (historyPage - 1) * getPageAmount()
            if (newOffset === 0) {
                if (historyStates[newOffset]?.fake) {
                    padded = true
                } else {
                    return
                }
            }
        }
        let result = [] as any
        if (historyTab === "post") {
            result = await functions.get("/api/post/history", {offset: newOffset}, session, setSessionFlag).catch(() => [])
        }
        if (historyTab === "tag") {
            result = await functions.get("/api/tag/history", {offset: newOffset}, session, setSessionFlag).catch(() => [])
        }
        if (historyTab === "translation") {
            result = await functions.get("/api/translation/history", {offset: newOffset}, session, setSessionFlag).catch(() => [])
        }
        if (historyTab === "search") {
            result = await functions.get("/api/user/history", {offset: newOffset}, session, setSessionFlag).catch(() => [])
        }
        let hasMore = result?.length >= 100
        const cleanHistory = historyStates.filter((t: any) => !t.fake)
        if (!scroll) {
            if (cleanHistory.length <= newOffset) {
                result = [...new Array(newOffset).fill({fake: true, historyCount: cleanHistory[0]?.historyCount}), ...result]
                padded = true
            }
        }
        if (hasMore) {
            setOffset(newOffset)
            if (padded) {
                setHistoryStates(result)
            } else {
                setHistoryStates((prev: any) => functions.removeDuplicates([...prev, ...result]))
            }
        } else {
            if (result?.length) {
                if (padded) {
                    setHistoryStates(result)
                } else {
                    setHistoryStates((prev: any) => functions.removeDuplicates([...prev, ...result]))
                }
            }
            setEnded(true)
        }
    }

    useEffect(() => {
        const scrollHandler = async () => {
            if (functions.scrolledToBottom()) {
                let currentIndex = index
                if (!historyStates[currentIndex]) return updateOffset()
                const newHistory = visibleHistory as any
                for (let i = 0; i < 15; i++) {
                    if (!historyStates[currentIndex]) return updateOffset()
                    if (!session.showR18) {
                        if (historyTab === "tag") {
                            if (functions.arrayIncludes(historyStates[currentIndex].tag, matureTags, true)) {
                                currentIndex++
                                continue
                            }
                        } else {
                            if (historyStates[currentIndex].restrict === "explicit") {
                                continue
                            }
                        }
                    }
                    newHistory.push(historyStates[currentIndex])
                    currentIndex++
                }
                setIndex(currentIndex)
                setVisibleHistory(functions.removeDuplicates(newHistory))
            }
        }
        if (scroll) window.addEventListener("scroll", scrollHandler)
        return () => {
            window.removeEventListener("scroll", scrollHandler)
        }
    }, [scroll, visibleHistory, index, historyTab, session])

    useEffect(() => {
        window.scrollTo(0, 0)
        if (scroll) {
            setEnded(false)
            setIndex(0)
            setVisibleHistory([])
            setHistoryPage(1)
            updateHistory()
        }
    }, [scroll, session, historyTab])

    useEffect(() => {
        if (!scroll) updateOffset()
    }, [historyTab])

    useEffect(() => {
        const updatePageOffset = () => {
            const historyOffset = (historyPage - 1) * getPageAmount()
            if (historyStates[historyOffset]?.fake) {
                setEnded(false)
                return updateOffset()
            }
            const historyAmount = Number(historyStates[0]?.historyCount)
            let maximum = historyOffset + getPageAmount()
            if (maximum > historyAmount) maximum = historyAmount
            const maxTag = historyStates[maximum - 1]
            if (!maxTag) {
                setEnded(false)
                updateOffset()
            }
        }
        if (!scroll) updatePageOffset()
    }, [scroll, historyStates, historyPage, ended])

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)
        if (historyTab) searchParams.set("type", historyTab)
        if (!scroll) searchParams.set("page", historyPage)
        if (replace) {
            if (!scroll) history.replace(`${location.pathname}?${searchParams.toString()}`)
            replace = false
        } else {
            if (!scroll) history.push(`${location.pathname}?${searchParams.toString()}`)
        }
    }, [scroll, historyTab, historyPage])

    useEffect(() => {
        if (historyStates?.length) {
            const maxTagPage = maxPage()
            if (maxTagPage === 1) return
            if (queryPage > maxTagPage) {
                setQueryPage(maxTagPage)
                setHistoryPage(maxTagPage)
            }
        }
    }, [historyStates, historyPage, queryPage])

    useEffect(() => {
        if (pageFlag) {
            goToPage(pageFlag)
            setPageFlag(null)
        }
    }, [pageFlag])

    useEffect(() => {
        localStorage.setItem("historyPage", String(historyPage))
        localStorage.setItem("historyTab", String(historyTab))
    }, [historyPage, historyTab])

    const maxPage = () => {
        if (!historyStates?.length) return 1
        if (Number.isNaN(Number(historyStates[0]?.historyCount))) return 10000
        return Math.ceil(Number(historyStates[0]?.historyCount) / getPageAmount())
    }

    const firstPage = () => {
        setHistoryPage(1)
        window.scrollTo(0, 0)
    }

    const previousPage = () => {
        let newPage = historyPage - 1 
        if (newPage < 1) newPage = 1 
        setHistoryPage(newPage)
        window.scrollTo(0, 0)
    }

    const nextPage = () => {
        let newPage = historyPage + 1 
        if (newPage > maxPage()) newPage = maxPage()
        setHistoryPage(newPage)
        window.scrollTo(0, 0)
    }

    const lastPage = () => {
        setHistoryPage(maxPage())
        window.scrollTo(0, 0)
    }

    const goToPage = (newPage: number) => {
        setHistoryPage(newPage)
        window.scrollTo(0, 0)
    }

    const generatePageButtonsJSX = () => {
        const jsx = [] as any
        let buttonAmount = 7
        if (mobile) buttonAmount = 3
        if (maxPage() < buttonAmount) buttonAmount = maxPage()
        let counter = 0
        let increment = -3
        if (historyPage > maxPage() - 3) increment = -4
        if (historyPage > maxPage() - 2) increment = -5
        if (historyPage > maxPage() - 1) increment = -6
        if (mobile) {
            increment = -2
            if (historyPage > maxPage() - 2) increment = -3
            if (historyPage > maxPage() - 1) increment = -4
        }
        while (counter < buttonAmount) {
            const pageNumber = historyPage + increment
            if (pageNumber > maxPage()) break
            if (pageNumber >= 1) {
                jsx.push(<button key={pageNumber} className={`page-button ${increment === 0 ? "page-button-active" : ""}`} onClick={() => goToPage(pageNumber)}>{pageNumber}</button>)
                counter++
            }
            increment++
        }
        return jsx
    }

    const generateHistoryJSX = () => {
        const jsx = [] as any
        let visible = [] as any
        if (scroll) {
            visible = functions.removeDuplicates(visibleHistory) as any
        } else {
            const postOffset = (historyPage - 1) * getPageAmount()
            visible = historyStates.slice(postOffset, postOffset + getPageAmount())
            if (!session.showR18) {
                visible = visible.filter((item: any) => historyTab === "tag" ? 
                !functions.arrayIncludes(item.tag || "", matureTags, true) : item.restrict !== "explicit")
            }
        }
        let current = visible[0]
        let currentIndex = 0
        for (let i = 0; i < visible.length; i++) {
            if (visible[i].fake) continue
            if (historyTab === "post") {
                let previous = visible[i + 1]
                if (current.postID !== visible[i].postID) {
                    current = visible[i]
                    currentIndex = i
                }
                if (previous?.postID !== current.postID) previous = null
                jsx.push(<PostHistoryRow historyIndex={i+1} postHistory={visible[i]} 
                    previousHistory={previous} currentHistory={current} current={i === currentIndex}
                    onDelete={updateHistory} onEdit={updateHistory}/>)
            }

            if (historyTab === "tag") {
                let previous = visible[i + 1]
                if (current.tag !== visible[i].tag) {
                    current = visible[i]
                    currentIndex = i
                }
                if (previous?.tag !== current.tag) previous = null
                jsx.push(<TagHistoryRow historyIndex={i+1} tagHistory={visible[i]} 
                    previousHistory={previous} currentHistory={current} current={i === currentIndex}
                    onDelete={updateHistory} onEdit={updateHistory}/>)
            }

            if (historyTab === "translation") {
                let previous = visible[i + 1]
                if (current.postID !== visible[i].postID &&
                    current.order !== visible[i].order) {
                    current = visible[i]
                    currentIndex = i
                }
                if (previous?.postID !== current.postID &&
                    previous?.order !== current.order) previous = null
                jsx.push(<TranslationHistoryRow previousHistory={previous} translationHistory={visible[i]} 
                    onDelete={updateHistory} onEdit={updateHistory} current={i === currentIndex}/>)
            }

            if (historyTab === "search") {
                jsx.push(<SearchHistoryRow history={visible[i]} onDelete={updateHistory}/>)
            }
        }
        if (!scroll) {
            jsx.push(
                <div key="page-numbers" className="page-container">
                    {historyPage <= 1 ? null : <button className="page-button" onClick={firstPage}>{"<<"}</button>}
                    {historyPage <= 1 ? null : <button className="page-button" onClick={previousPage}>{"<"}</button>}
                    {generatePageButtonsJSX()}
                    {historyPage >= maxPage() ? null : <button className="page-button" onClick={nextPage}>{">"}</button>}
                    {historyPage >= maxPage() ? null : <button className="page-button" onClick={lastPage}>{">>"}</button>}
                    {maxPage() > 1 ? <button className="page-button" onClick={() => setShowPageDialog(true)}>{"?"}</button> : null}
                </div>
            )
        }
        return jsx
    }

    const toggleScroll = () => {
        setScroll((prev: boolean) => {
            const newValue = !prev
            localStorage.setItem("scroll", `${newValue}`)
            return newValue
        })
    }

    const generateHeaderJSX = () => {
        if (historyTab === "post") {
            return (
                <><span className="history-heading">Post History</span>
                <div className="history-item" onClick={() => toggleScroll()}>
                    <img className="history-img" src={scroll ? scrollIcon : pageIcon} style={{filter: getFilter()}}/>
                    <span className="history-text">{scroll ? "Scrolling" : "Pages"}</span>
                </div></>
            )
        }
        if (historyTab === "tag") {
            return (
                <><span className="history-heading">Tag History</span>
                <div className="history-item" onClick={() => toggleScroll()}>
                    <img className="history-img" src={scroll ? scrollIcon : pageIcon} style={{filter: getFilter()}}/>
                    <span className="history-text">{scroll ? "Scrolling" : "Pages"}</span>
                </div></>
            )
        }
        if (historyTab === "translation") {
            return (
                <><span className="history-heading">Translation History</span>
                <div className="history-item" onClick={() => toggleScroll()}>
                    <img className="history-img" src={scroll ? scrollIcon : pageIcon} style={{filter: getFilter()}}/>
                    <span className="history-text">{scroll ? "Scrolling" : "Pages"}</span>
                </div></>
            )
        }
        if (historyTab === "search") {
            return (
                <><span className="history-heading">Search History</span>
                <div className="history-item" onClick={() => toggleScroll()}>
                    <img className="history-img" src={scroll ? scrollIcon : pageIcon} style={{filter: getFilter()}}/>
                    <span className="history-text">{scroll ? "Scrolling" : "Pages"}</span>
                </div>
                <div className="history-item" onClick={() => setShowDeleteAllHistoryDialog((prev: boolean) => !prev)}>
                    <img className="history-img" src={searchHistoryDelete}/>
                    <span className="history-opt-text">Delete All</span>
                </div></>
            )
        }
    }

    const searchHistoryClick = () => {
        if (permissions.isPremium(session)) {
            setHistoryTab("search")
        } else {
            setPremiumRequired(true)
        }
    }

    return (
        <>
        <RevertPostHistoryDialog/>
        <DeletePostHistoryDialog/>
        <RevertTagHistoryDialog/>
        <DeleteTagHistoryDialog/>
        <RevertTranslationHistoryDialog/>
        <DeleteTranslationHistoryDialog/>
        <DeleteAllSearchHistoryDialog/>
        <DeleteSearchHistoryDialog/>
        <PageDialog/>
        <TitleBar/>
        <NavBar/>
        <div className="body">
            <SideBar/>
            <div className="content" onMouseEnter={() => setEnableDrag(true)}>
                <div className="history-page">
                    <div className="history-icons">
                        <img className="history-icon" onClick={searchHistoryClick} src={historyTab === "search" ? historySearchActive : historySearch} style={{filter: historyTab === "search" ? "" : getFilter()}}/>
                        <img className="history-icon" onClick={() => setHistoryTab("post")} src={historyTab === "post" ? historyPostActive : historyPost} style={{filter: historyTab === "post" ? "" : getFilter()}}/>
                        <img className="history-icon" onClick={() => setHistoryTab("tag")} src={historyTab === "tag" ? historyTagActive : historyTag} style={{filter: historyTab === "tag" ? "" : getFilter()}}/>
                        <img className="history-icon" onClick={() => setHistoryTab("translation")} src={historyTab === "translation" ? historyTranslateActive : historyTranslate} style={{filter: historyTab === "translation" ? "" : getFilter()}}/>
                    </div>
                    <div className="history-heading-container">
                        {generateHeaderJSX()}
                    </div>
                    <table className="history-container">
                        {generateHistoryJSX()}
                    </table>
                </div>
                <Footer/>
            </div>
        </div>
        </>
    )
}

export default HistoryPage