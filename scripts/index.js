/*

Direct video links:

    Static version: https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master_6660.m3u8
    Multiple versions: https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8

Indirect video links:

    Static version: https://broadcast.mytvtogo.net/klmntv/klmntv/chunklist_w1719036778.m3u8
    Multiple versions: https://broadcast.mytvtogo.net/klmntv/klmntv/playlist.m3u8

*/

const input = document.getElementById("url_input");
const video_source = document.getElementById("video");
const capture_button = document.getElementById("capture");
const output_field = document.getElementById("output");
const progress_bar = document.getElementById("progress_bar");

const hls = new Hls();

url = ''

function Load()
{
    if(!input.value.toLowerCase().includes('m3u8'))
    {
        input.value = '';
        Log('Not a valid m3u8 file url provided.');
        return;
    }

    url = input.value;

    hls.loadSource(
        url
    );

    hls.attachMedia(video_source);
    video_source.play();
    video_source.currentTime = 0;
}

hls.on(Hls.Events.MEDIA_ATTACHED, () =>
{
    Log(
        'Video and hls.js succefully connected'
    );
});

hls.on(Hls.Events.MANIFEST_PARSED, (event, data) =>
{
    Log(
        `Manifest loaded, found ${data.levels.length} quality level;`
    );
});

input.addEventListener('keypress', (event) =>
{
    if (event.key === "Enter") {
        Load();
    }
});