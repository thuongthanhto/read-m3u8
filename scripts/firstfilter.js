function between(head, foot, split_part = '=', sentence)
{
    first_cut = sentence.substring(
        sentence.indexOf(head),
        sentence.length
    );

    if(first_cut.indexOf(foot) < 0) return first_cut;

    return first_cut.substring(
        0,
        first_cut.indexOf(foot),
    ).split(split_part)[1];
}

function get_max_quality(body, full_url)
{
    Log('Searching for maximum quality...');
    let lines = body.split('\n');
    let headers = [];
    let choosen = {
        'criteria': 0,
        'url': ''
    };

    lines.map((line, i) => {
        if(!line.includes('#EXT-X-STREAM-INF')) return;

        headers.push(
            {
                'index': i,
                'line': line.replace('#EXT-X-STREAM-INF:', '')
            }
        )
    });

    Log(`Found ${headers.length} entries for versions.`);

    headers.map((line) => {
        let criteria = 0;

        if(line['line'].includes('+BANDWIDTH'))
        {
            criteria = parseInt(between('BANDWIDTH=', ',', '=', line['line']));
        }
        else if(line['line'].includes('RESOLUTION'))
        {
            let resolution = between('RESOLUTION=', ',', '=', line['line']).split('x');

            criteria = parseInt(resolution[0]) * parseInt(resolution[1]);

        }
        else
        {
            //Log('Could not find the maximum quality, switching to the last one.');
            choosen['url'] = lines[headers[headers.length - 1]['index'] + 1];

            return;
        }

        if(choosen['criteria'] >= criteria) return;

        choosen['criteria'] = criteria;
        choosen['url'] = lines[line['index'] + 1]
    });

    if(!choosen['url'].includes('http'))
    {
        choosen['url'] = url_go_back(full_url) + choosen['url'];
    }

    return choosen['url'];
}