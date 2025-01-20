import React, {useEffect} from "react"
import {useThemeSelector, useThemeActions, useSearchSelector, useSearchActions, usePlaybackSelector, 
usePlaybackActions, useFilterSelector, useFilterActions, useLayoutSelector, useLayoutActions,
usePageSelector, usePageActions, useCacheSelector, useCacheActions, useSessionSelector, useSessionActions} from "./store"
import {Themes, ImageFormat, PostType, PostRating, PostStyle, PostSize, PostSort} from "./types/Types"
import localforage from "localforage"

const LocalStorage: React.FunctionComponent = (props) => {
    const {theme, language, siteHue, siteSaturation, siteLightness, particles, 
    particleAmount, particleSize, particleSpeed} = useThemeSelector()
    const {setTheme, setLanguage, setSiteHue, setSiteSaturation, setSiteLightness, 
    setParticles, setParticleAmount, setParticleSize, setParticleSpeed} = useThemeActions()
    const {imageExpand, noteDrawingEnabled, scroll, format, saveSearch, favSearch, square, imageType, 
    ratingType, styleType, sizeType, sortType, sortReverse, pageMultiplier, showChildren} = useSearchSelector()
    const {setImageExpand, setNoteDrawingEnabled, setScroll, setFormat, setSaveSearch, setFavSearch, setImageType, setRatingType, 
    setStyleType, setSizeType, setSortType, setSortReverse, setPageMultiplier, setSquare, setShowChildren} = useSearchActions()
    const {brightness, contrast, hue, saturation, lightness, blur, sharpen, pixelate, splatter} = useFilterSelector()
    const {setBrightness, setContrast, setHue, setSaturation, setLightness, setBlur, setSharpen, setPixelate, setSplatter} = useFilterActions()
    const {hideSortbar, hideSidebar, hideTitlebar, hideNavbar} = useLayoutSelector()
    const {setHideSortbar, setHideSidebar, setHideTitlebar, setHideNavbar} = useLayoutActions()
    const {page, historyPage, messagePage, threadPage, artistsPage, charactersPage, commentsPage, forumPage,
    groupsPage, mailPage, modPage, notesPage, seriesPage, tagsPage} = usePageSelector()
    const {setPage, setHistoryPage, setMessagePage, setThreadPage, setArtistsPage, setCharactersPage, setCommentsPage,
    setForumPage, setGroupsPage, setMailPage, setModPage, setNotesPage, setSeriesPage, setTagsPage} = usePageActions()
    const {posts, tags, bannerTags, post, tagCategories, order, related, artists, characters, series} = useCacheSelector()
    const {setPosts, setTags, setBannerTags, setPost, setTagCategories, setOrder, setRelated, setArtists, setCharacters, setSeries} = useCacheActions()
    const {disableZoom} = usePlaybackSelector()
    const {setDisableZoom} = usePlaybackActions()
    const {session} = useSessionSelector()
    const {setSession} = useSessionActions()

    const initLanguage = () => {
        const savedLanguage = localStorage.getItem("language")
        const browserLang = window.navigator.language.split("-")[0]
        const langPref = savedLanguage || browserLang
        if (langPref === "ja") {
            setLanguage("ja")
        } else {
            setLanguage("en")
        }
    }

    const initAsync = async () => {
        const savedPosts = await localforage.getItem("savedPosts") as string
        const savedTags = await localforage.getItem("savedTags") as string
        const savedRelated = await localforage.getItem("savedRelated") as string
        const savedArtists = await localforage.getItem("savedArtists") as string
        const savedCharacters = await localforage.getItem("savedCharacters") as string
        const savedSeries = await localforage.getItem("savedSeries") as string
        if (savedPosts) setPosts(JSON.parse(savedPosts))
        if (savedTags) setTags(JSON.parse(savedTags))
        if (savedRelated) setRelated(JSON.parse(savedRelated))
        if (savedArtists) setArtists(JSON.parse(savedArtists))
        if (savedCharacters) setCharacters(JSON.parse(savedCharacters))
        if (savedSeries) setSeries(JSON.parse(savedSeries))
    }

    useEffect(() => {
        initLanguage()
        initAsync()
        const savedTheme = localStorage.getItem("theme")
        const savedSiteHue = localStorage.getItem("siteHue")
        const savedSiteSaturation = localStorage.getItem("siteSaturation")
        const savedSiteLightness = localStorage.getItem("siteLightness")
        const savedScroll = localStorage.getItem("scroll")
        const savedDisableZoom = localStorage.getItem("disableZoom")
        const savedImageExpand = localStorage.getItem("imageExpand")
        const savedNoteDrawing = localStorage.getItem("noteDrawingEnabled")
        const savedFormat = localStorage.getItem("format")
        const savedBrightness = localStorage.getItem("brightness")
        const savedContrast = localStorage.getItem("contrast")
        const savedHue = localStorage.getItem("hue")
        const savedSaturation = localStorage.getItem("saturation")
        const savedLightness = localStorage.getItem("lightness")
        const savedBlur = localStorage.getItem("blur")
        const savedSharpen = localStorage.getItem("sharpen")
        const savedPixelate = localStorage.getItem("pixelate")
        const savedSplatter = localStorage.getItem("splatter")
        const savedParticles = localStorage.getItem("particles")
        const savedParticleAmount = localStorage.getItem("particleAmount")
        const savedParticleSize = localStorage.getItem("particleSize")
        const savedParticleSpeed = localStorage.getItem("particleSpeed")
        const savedSaveSearch = localStorage.getItem("saveSearch")
        const savedFavSearch = localStorage.getItem("favSearch")
        const savedType = localStorage.getItem("type")
        const savedRating = localStorage.getItem("rating")
        const savedStyle = localStorage.getItem("style")
        const savedSize = localStorage.getItem("size")
        const savedSort = localStorage.getItem("sort")
        const savedSortReverse = localStorage.getItem("sortReverse")
        const savedSquare = localStorage.getItem("square")
        const savedMultiplier = localStorage.getItem("pageMultiplier")
        const savedShowChildren = localStorage.getItem("showChildren")
        const savedPage = localStorage.getItem("page")
        const savedHistoryPage = localStorage.getItem("historyPage")
        const savedMessagePage = localStorage.getItem("messagePage")
        const savedThreadPage = localStorage.getItem("threadPage")
        const savedArtistsPage = localStorage.getItem("artistsPage")
        const savedCharactersPage = localStorage.getItem("charactersPage")
        const savedCommentsPage = localStorage.getItem("commentsPage")
        const savedForumPage = localStorage.getItem("forumPage")
        const savedGroupsPage = localStorage.getItem("groupsPage")
        const savedMailPage = localStorage.getItem("mailPage")
        const savedModPage = localStorage.getItem("modPage")
        const savedNotesPage = localStorage.getItem("notesPage")
        const savedSeriesPage = localStorage.getItem("seriesPage")
        const savedTagsPage = localStorage.getItem("tagsPage")
        const savedHideTitlebar = localStorage.getItem("titlebar")
        const savedHideSidebar = localStorage.getItem("sidebar")
        const savedHideNavbar = localStorage.getItem("navbar")
        const savedHideSortbar = localStorage.getItem("sortbar")
        const savedOrder = localStorage.getItem("order")
        const savedBannerTags = localStorage.getItem("savedBannerTags")
        const savedSession = localStorage.getItem("savedSession")
        const savedPost = localStorage.getItem("savedPost")
        const savedTagCategories = localStorage.getItem("savedTagCategories")
        if (savedTheme) setTheme(savedTheme as Themes)
        if (savedSiteSaturation) setSiteSaturation(Number(savedSiteSaturation))
        if (savedSiteHue) setSiteHue(Number(savedSiteHue))
        if (savedSiteLightness) setSiteLightness(Number(savedSiteLightness))
        if (savedScroll) setScroll(savedScroll === "true")
        if (savedDisableZoom) setDisableZoom(savedDisableZoom === "true")
        if (savedImageExpand) setImageExpand(savedImageExpand === "true")
        if (savedNoteDrawing) setNoteDrawingEnabled(savedNoteDrawing === "true")
        if (savedFormat) setFormat(savedFormat as ImageFormat)
        if (savedBrightness) setBrightness(Number(savedBrightness))
        if (savedContrast) setContrast(Number(savedContrast))
        if (savedHue) setHue(Number(savedHue))
        if (savedSaturation) setSaturation(Number(savedSaturation))
        if (savedLightness) setLightness(Number(savedLightness))
        if (savedBlur) setBlur(Number(savedBlur))
        if (savedSharpen) setSharpen(Number(savedSharpen))
        if (savedPixelate) setPixelate(Number(savedPixelate))
        if (savedSplatter) setSplatter(Number(savedSplatter))
        if (savedParticles) setParticles(savedParticles === "true")
        if (savedParticleAmount) setParticleAmount(Number(savedParticleAmount))
        if (savedParticleSize) setParticleSize(Number(savedParticleSize))
        if (savedParticleSpeed) setParticleSpeed(Number(savedParticleSpeed))
        if (savedSaveSearch) setSaveSearch(savedSaveSearch === "true")
        if (savedFavSearch) setFavSearch(savedFavSearch === "true")
        if (savedType) setImageType(savedType as PostType)
        if (savedRating) setRatingType(savedRating as PostRating)
        if (savedStyle) setStyleType(savedStyle as PostStyle)
        if (savedSize) setSizeType(savedSize as PostSize)
        if (savedSort) setSortType(savedSort as PostSort)
        if (savedSortReverse) setSortReverse(savedSortReverse === "true")
        if (savedSquare) setSquare(savedSquare === "true")
        if (savedMultiplier) setPageMultiplier(Number(savedMultiplier))
        if (savedShowChildren) setShowChildren(savedShowChildren === "true")
        if (savedMessagePage && Number(savedMessagePage) > 0) setMessagePage(Number(savedMessagePage))
        if (savedHistoryPage && Number(savedHistoryPage) > 0) setHistoryPage(Number(savedHistoryPage))
        if (savedThreadPage && Number(savedThreadPage) > 0) setThreadPage(Number(savedThreadPage))
        if (savedPage && Number(savedPage) > 0) setPage(Number(savedPage))
        if (savedArtistsPage && Number(savedArtistsPage) > 0) setArtistsPage(Number(savedArtistsPage))
        if (savedCharactersPage && Number(savedCharactersPage) > 0) setCharactersPage(Number(savedCharactersPage))
        if (savedCommentsPage && Number(savedCommentsPage) > 0) setCommentsPage(Number(savedCommentsPage))
        if (savedForumPage && Number(savedForumPage) > 0) setForumPage(Number(savedForumPage))
        if (savedGroupsPage && Number(savedGroupsPage) > 0) setGroupsPage(Number(savedGroupsPage))
        if (savedMailPage && Number(savedMailPage) > 0) setMailPage(Number(savedMailPage))
        if (savedModPage && Number(savedModPage) > 0) setModPage(Number(savedModPage))
        if (savedNotesPage && Number(savedNotesPage) > 0) setNotesPage(Number(savedNotesPage))
        if (savedSeriesPage && Number(savedSeriesPage) > 0) setSeriesPage(Number(savedSeriesPage))
        if (savedTagsPage && Number(savedTagsPage) > 0) setTagsPage(Number(savedTagsPage))
        if (savedHideTitlebar) setHideTitlebar(savedHideTitlebar === "true")
        if (savedHideNavbar) setHideNavbar(savedHideNavbar === "true")
        if (savedHideSidebar) setHideSidebar(savedHideSidebar === "true")
        if (savedHideSortbar) setHideSortbar(savedHideSortbar === "true")
        if (savedBannerTags) setBannerTags(JSON.parse(savedBannerTags))
        if (savedSession) setSession(JSON.parse(savedSession))
        if (savedPost) setPost(JSON.parse(savedPost))
        if (savedTagCategories) setTagCategories(JSON.parse(savedTagCategories))
        if (savedOrder) setOrder(Number(savedOrder))
    }, [])

    useEffect(() => {
        localStorage.setItem("siteHue", String(siteHue))
        localStorage.setItem("siteSaturation", String(siteSaturation))
        localStorage.setItem("siteLightness", String(siteLightness))
    }, [siteHue, siteSaturation, siteLightness])

    useEffect(() => {
        localStorage.setItem("theme", theme)
        localStorage.setItem("language", language)
        localStorage.setItem("particles", String(particles))
        localStorage.setItem("particleAmount", String(particleAmount))
        localStorage.setItem("particleSize", String(particleSize))
        localStorage.setItem("particleSpeed", String(particleSpeed))
    }, [theme, language, particles, particleAmount, particleSize, particleSpeed])

    useEffect(() => {
        localStorage.setItem("scroll", String(scroll))
        localStorage.setItem("type", imageType)
        localStorage.setItem("rating", ratingType)
        localStorage.setItem("style", styleType)
        localStorage.setItem("size", sizeType)
        localStorage.setItem("sort", sortType)
        localStorage.setItem("sortReverse", String(sortReverse))
        localStorage.setItem("pageMultiplier", String(pageMultiplier))
        localStorage.setItem("square", String(square))
        localStorage.setItem("showChildren", String(showChildren))
    }, [scroll, imageType, ratingType, styleType, sizeType, sortType, sortReverse, 
        pageMultiplier, square, showChildren])

    useEffect(() => {
        localStorage.setItem("brightness", String(brightness))
        localStorage.setItem("contrast", String(contrast))
        localStorage.setItem("hue", String(hue))
        localStorage.setItem("saturation", String(saturation))
        localStorage.setItem("lightness", String(lightness))
        localStorage.setItem("blur", String(blur))
        localStorage.setItem("sharpen", String(sharpen))
        localStorage.setItem("pixelate", String(pixelate))
        localStorage.setItem("splatter", String(splatter))
    }, [brightness, contrast, hue, saturation, lightness, blur, sharpen, pixelate, splatter])

    useEffect(() => {
        localStorage.setItem("disableZoom", String(disableZoom))
        localStorage.setItem("imageExpand", String(imageExpand))
        localStorage.setItem("noteDrawingEnabled", String(noteDrawingEnabled))
        localStorage.setItem("format", format)
        localStorage.setItem("saveSearch", String(saveSearch))
        localStorage.setItem("favSearch", String(favSearch))
    }, [disableZoom, imageExpand, noteDrawingEnabled, format, saveSearch, favSearch])

    useEffect(() => {
        localStorage.setItem("sidebar", String(hideSidebar))
        localStorage.setItem("titlebar", String(hideTitlebar))
        localStorage.setItem("navbar", String(hideNavbar))
        localStorage.setItem("sortbar", String(hideSortbar))
    }, [hideSidebar, hideTitlebar, hideNavbar, hideSortbar])

    useEffect(() => {
        localforage.setItem("savedPosts", JSON.stringify(posts))
        localforage.setItem("savedTags", JSON.stringify(tags))
        localStorage.setItem("savedBannerTags", JSON.stringify(bannerTags))
        localStorage.setItem("savedSession", JSON.stringify(session))
    }, [posts, tags, bannerTags, session])

    useEffect(() => {
        localStorage.setItem("order", String(order))
        localStorage.setItem("savedPost", JSON.stringify(post))
        localStorage.setItem("savedTagCategories", JSON.stringify(tagCategories))
        localforage.setItem("savedRelated", JSON.stringify(related))
    }, [order, tagCategories, post, related])


    useEffect(() => {
        localforage.setItem("savedArtists", JSON.stringify(artists))
        localforage.setItem("savedCharacters", JSON.stringify(characters))
        localforage.setItem("savedSeries", JSON.stringify(series))
    }, [artists, characters, series])

    useEffect(() => {
        localStorage.setItem("page", String(page || ""))
        localStorage.setItem("historyPage", String(historyPage || ""))
        localStorage.setItem("messagePage", String(messagePage || ""))
        localStorage.setItem("threadPage", String(threadPage || ""))
        localStorage.setItem("artistsPage", String(artistsPage || ""))
        localStorage.setItem("charactersPage", String(charactersPage || ""))
        localStorage.setItem("commentsPage", String(commentsPage || ""))
        localStorage.setItem("forumPage", String(forumPage || ""))
        localStorage.setItem("groupsPage", String(groupsPage || ""))
        localStorage.setItem("mailPage", String(mailPage || ""))
        localStorage.setItem("modPage", String(modPage || ""))
        localStorage.setItem("notesPage", String(notesPage || ""))
        localStorage.setItem("seriesPage", String(seriesPage || ""))
        localStorage.setItem("tagsPage", String(tagsPage || ""))
    }, [historyPage, messagePage, threadPage, page, artistsPage, charactersPage, commentsPage, forumPage, 
        groupsPage, mailPage, modPage, notesPage, seriesPage, tagsPage])

    return null
}

export default LocalStorage