function url_go_back(url, segments_count = 1)
{
    let segments = url.split('/');

    for(let i = 0; i < segments_count; i++)
    {
        segments.pop();
    }

    return segments.join('/') + '/'
}