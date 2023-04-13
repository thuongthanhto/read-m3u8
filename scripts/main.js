var is_live = true;
var current_stream;

capturing = new Wrapper(false, () => {
    if(!is_live)
    {
        Log('Further logic has not been developed.')
        return;
    }

    if(capturing.value())
    {

        if(!url || url === '')
        {
            capturing = false;
            Log('Not a valid m3u8 file url provided.');
            return
        }

        console.log(`Capture started for: ${url}`);
        capture_button.innerHTML = 'Stop Capture';

        //
        let request = new XMLHttpRequest();
        request.onreadystatechange = function(){
            if(this.readyState !== 4) return;

            if(this.status == 200)
            {
                let redirect = url;

                if(request.responseText.includes('.m3u8'))
                {
                    redirect = get_max_quality(this.responseText, url);
                }

                current_stream = new LStream(
                    redirect
                );

                current_stream.record();

                return;
            }

            Log(`Server fetch error:\nReady state: ${this.readyState};\nStatus code: ${this.status};`);
        }
        
        request.open('GET', url, true);
        request.send();

        video_source.style.borderColor = "#ff2c2c";

        return;
    }

    console.log('Capture stopped;');
    video_source.style.borderColor = "#00000000";
    capture_button.innerHTML = 'Capture';
    current_stream.stop();
    current_stream.download('video.ts');
});

function Capture()
{
    capturing.set(!capturing.value());
}