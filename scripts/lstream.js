class LStream {
  constructor(url) {
    this.url = url;

    this.target_duration = 0;
    this.chunks_per_request = 0;

    this.record_list = [];
    //this.file = [];
    this.capture_count = 0;

    this.active = false;
    this.loaded = new Wrapper(false, function () {
      console.log('Stream loaded;');
    });

    // Setup

    let request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (this.readyState !== 4) return;

      if (this.status == 200) {
        // if(request.responseText.includes('m3u8'))
        // {
        //     Log('Multiple verions found, restarting streaming process...');
        //     current_stream = new LStream(
        //         get_max_quality_url(this.responseText)
        //     );
        //     current_stream.record();

        //     return;
        // }

        request.responseText.split('\n').map((line, i) => {
          // console.log(line);
          if (line.includes('#EXTINF')) {
            current_stream.chunks_per_request += 1;
          } else if (line.includes('#EXT-X-TARGETDURATION')) {
            current_stream.target_duration = parseInt(
              line.replace('#EXT-X-TARGETDURATION:', '')
            );
          }
        });

        current_stream.active = true;
        current_stream.loaded.set(true);

        return;
      }

      Log(
        `Server fetch error:\nReady state: ${this.readyState};\nStatus code: ${this.status};`
      );
    };
    request.open('GET', this.url, true);
    request.send();
  }

  record() {
    this.capture_count = 0;

    if (!this.loaded.value()) {
      this.loaded.onChange = () => {
        current_stream.snapshot();
      };
      return;
    }

    current_stream.snapshot();
  }

  stop() {
    this.record_list = this.filter(this.record_list);
    console.log(this.record_list);
    this.active = false;
  }

  snapshot() {
    if (!this.active) return;
    if (!capturing) {
      Log(
        'Could not snapshot because the recording process did not start correctly.'
      );
      return;
    }

    let segment_length_sum = 0;

    let finish_fetch = new Wrapper(false, () => {
      if (!capturing) return;
      current_stream.capture_count += 1;

      let next_capture_timeout = segment_length_sum / 1.5; //this.target_duration * this.chunks_per_request - 5;

      Log(
        `# Captured (${this.capture_count})\nTarget duration: ${this.target_duration}\nChunks/request: ${this.chunks_per_request}\nNext capture in: ${next_capture_timeout} seconds\n-------------`
      );

      setTimeout(() => {
        current_stream.snapshot();
      }, next_capture_timeout * 1000);
    });

    let request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (this.readyState !== 4) return;

      if (this.status == 200) {
        let lines = request.responseText.split('\n');

        lines.map((line, index) => {
          if (!line.includes('#EXTINF')) return;
          let raw_video_url = lines[index + 1];

          if (!raw_video_url.includes('http')) {
            raw_video_url = url_go_back(current_stream.url, 1) + raw_video_url;
          }

          current_stream.record_list.push(raw_video_url);

          segment_length_sum += parseFloat(between('#EXTINF', ',', ':', line));

          //Log(`[${raw_video_url}] found, but there is not way to handle it.`)
        });

        finish_fetch.set(true);

        return;
      }

      Log(
        `Server fetch error:\nReady state: ${this.readyState};\nStatus code: ${this.status};`
      );
    };

    request.open('GET', this.url, true);
    request.send();
  }

  download(filename) {
    //if(!this.active) return;

    let file = [];
    let register = 0;

    let complete = new Wrapper(
      false,

      () => {
        console.log('Downloading...');

        //this.create_and_download_blob_file(file, 'test');

        let a = document.createElement('a');
        let blob = new Blob(file, { type: 'video/MP2T' });
        console.log(blob);

        saveAs(blob, filename);

        // a.download = `${filename}.ts`;
        // a.href = URL.createObjectURL(blob);
        // a.style.display = 'none';
        // document.body.appendChild(a)

        // a.click()

        // a.remove()

        progress_bar.value = 0;
      }
    );

    progress_bar.max = current_stream.record_list.length;
    this.record_list.map((url, index) => {
      let request = new XMLHttpRequest();

      request.onreadystatechange = function () {
        if (this.readyState !== 4) return;

        if (this.status == 200) {
          // let new_file = new ArrayBuffer(file.byteLength, request.response.byteLength);
          // new_file = file + this.response;
          // file = new_file;
          // console.log(file);

          // new_file = null;
          register++;
          file[index] = this.response;

          Log(
            `Downloading chunk: ${index}\nRegister: ${register}\nLength: ${current_stream.record_list.length}`
          );

          progress_bar.value = register;

          if (register === current_stream.record_list.length) {
            Log('# Process finished');
            complete.set(true);
          }

          return;
        }

        Log(
          `Server fetch error:\nReady state: ${this.readyState};\nStatus code: ${this.status};`
        );
      };

      request.open('GET', url, true);
      request.responseType = 'arraybuffer';
      request.send();
    });
  }

  filter(list) {
    return [...new Set(list)];
  }
}
