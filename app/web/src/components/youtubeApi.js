// Lazy-load the YouTube IFrame Player API and expose a single promise that
// resolves with the global `window.YT` namespace.

let promise = null

export const loadYouTubeApi = () => {
    if (promise) return promise
    promise = new Promise((resolve) => {
        if (window.YT?.Player) {
            resolve(window.YT)
            return
        }
        const prior = window.onYouTubeIframeAPIReady
        window.onYouTubeIframeAPIReady = () => {
            if (prior) prior()
            resolve(window.YT)
        }
        const tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"
        document.head.appendChild(tag)
    })
    return promise
}
