import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { mediaDir } from "./config.js"

// Direct port of the old rp/src/server/hosting.coffee logic, modernized:
//   - uses global fetch instead of the http/https modules
//   - uses spawnSync to shell out to ffprobe + ffmpeg
//   - writes mp4 + jpg pair under data/videos/<ref>
//
// ffmpeg + ffprobe must be on PATH on the host running the server.

const downloadToFile = async (url, outputFilename) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(outputFilename, buf)
}

export const downloadSelfHostedVideo = async (url, ref) => {
    if (!/^[a-z0-9_-]+$/i.test(ref)) throw new Error("invalid ref (alphanumeric/dash/underscore only)")
    fs.mkdirSync(mediaDir, { recursive: true })
    const videoFilename = path.join(mediaDir, `${ref}.mp4`)
    const thumbFilename = path.join(mediaDir, `${ref}.jpg`)
    if (fs.existsSync(videoFilename)) throw new Error(`ref ${ref} already exists`)

    await downloadToFile(url, videoFilename)
    if (!fs.existsSync(videoFilename)) throw new Error("download produced no file")

    const probe = spawnSync("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        videoFilename
    ])
    if (probe.error || probe.status !== 0) {
        fs.unlinkSync(videoFilename)
        throw new Error("ffprobe failed — is ffmpeg installed?")
    }
    const duration = Math.ceil(parseFloat(String(probe.stdout)))
    if (!Number.isFinite(duration)) {
        fs.unlinkSync(videoFilename)
        throw new Error("couldn't determine video duration — bad file?")
    }

    const thumb = spawnSync("ffmpeg", [
        "-y",
        "-ss",
        "10",
        "-i",
        videoFilename,
        "-vframes",
        "1",
        "-vf",
        "scale=320:180",
        thumbFilename
    ])
    if (thumb.error || thumb.status !== 0 || !fs.existsSync(thumbFilename)) {
        fs.unlinkSync(videoFilename)
        throw new Error("thumbnail generation failed")
    }

    return { duration_s: duration, thumb: `/videos/${ref}.jpg` }
}
