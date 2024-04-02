import React, {useContext, useEffect, useState} from "react"
import {ThemeContext, HideSidebarContext, HideNavbarContext, HideTitlebarContext, SiteHueContext, SiteLightnessContext, SiteSaturationContext,
SearchContext, SearchFlagContext, ImageTypeContext, RestrictTypeContext, StyleTypeContext, SortTypeContext} from "../Context"
import {HashLink as Link} from "react-router-hash-link"
import backToTop from "../assets/purple/backtotop.png"
import pack from "../package.json"
import "./styles/footer.less"

const Footer: React.FunctionComponent = (props) => {
    const {theme, setTheme} = useContext(ThemeContext)
    const {siteHue, setSiteHue} = useContext(SiteHueContext)
    const {siteSaturation, setSiteSaturation} = useContext(SiteSaturationContext)
    const {siteLightness, setSiteLightness} = useContext(SiteLightnessContext)
    const {hideSidebar, setHideSidebar} = useContext(HideSidebarContext)
    const {hideNavbar, setHideNavbar} = useContext(HideNavbarContext)
    const {hideTitlebar, setHideTitlebar} = useContext(HideTitlebarContext)
    const {search, setSearch} = useContext(SearchContext)
    const {searchFlag, setSearchFlag} = useContext(SearchFlagContext)
    const {imageType, setImageType} = useContext(ImageTypeContext)
    const {restrictType, setRestrictType} = useContext(RestrictTypeContext)
    const {styleType, setStyleType} = useContext(StyleTypeContext)
    const {sortType, setSortType} = useContext(SortTypeContext)

    const getFilter = () => {
        return `hue-rotate(${siteHue - 180}deg) saturate(${siteSaturation}%) brightness(${siteLightness + 70}%)`
    }

    const goToTop = () => {
        window.scrollTo({top: 0, behavior: "smooth"})
    }

    const footerClick = () => {
        setSearch("")
        setImageType("all")
        setRestrictType("all")
        setStyleType("all")
        setSortType("date")
        setSearchFlag(true)
        window.scrollTo(0, 0)
    }

    return (
        <>
        <div style={{height: "100%", pointerEvents: "none"}}></div>
        <div className="footer">
            <div className="footer-title-container" onClick={footerClick}>
                    <span className="footer-title-a">M</span>
                    <span className="footer-title-b">o</span>
                    <span className="footer-title-a">e</span>
                    <span className="footer-title-b">b</span>
                    <span className="footer-title-a">o</span>
                    <span className="footer-title-b">o</span>
                    <span className="footer-title-a">r</span>
                    <span className="footer-title-b">u</span>
            </div>
            <div className="footer-text-container">
                <span className="footer-text">- This is the bottom of the page -</span>
            </div>
            <div className="footer-back-to-top" onClick={() => goToTop()}>
                <img className="footer-img" src={backToTop} style={{filter: getFilter()}}/>
                <span className="footer-text">Back to top</span>
            </div>
        </div>
        </>
    )
}

export default Footer