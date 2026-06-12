const fs = require('fs');

const versionRegex = /^v\d+\.\d+\.\d+[-a-zA-Z0-9]*$/;

function getElapsedSince(dateObj) {
  const past = dateObj;
  const present = new Date();

  const diff = present - past;
  const days = Math.floor(diff / 86400000);

  return (
    days <= 0 ? 'today'     :
    days == 1 ? 'yesterday' :
    `${days} days ago`
  );
}

function replaceHTMLElem(body, target, rep) {
  const rgx = new RegExp(`(id="${target}"[^>]*>)([^<]*)(<\/.*?>)`, 'g');
  
  return body.replace(rgx, `$1${rep}$3`);
}

// todo-not convinced with how this looks.

async function updatePages() {

  // mpd-local-scrobbler
  // repo: https://codeberg.org/faction/mpd-local-scrobbler

  // need to get:
  // latest stable release version
  // latest stable release date
  // latest dev commit date
  // star count

  console.log("generating new info for mpd-local-scrobbler...");
  var mpdscrobblerinfo = undefined

  {
    let currentTask = "getting latest stable info";
    console.log(currentTask);

    let latestStableInfo = await ( async () => {
      try {
        const r = await fetch('https://codeberg.org/api/v1/repos/faction/mpd-local-scrobbler/releases/latest', {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        });

        const data = await r.text();
        const jobj = JSON.parse(data);

        if (!jobj ||
            !jobj['name'] ||
            !jobj['published_at'])
          throw Error('unacceptable response');
        
        if (!versionRegex.test(jobj['name']))
          throw Error('unacceptable response');

        const date = new Date(jobj['published_at']);

        if (isNaN(date))
          throw Error('unparsable response');

        const elapsedString = getElapsedSince(date);

        return {
          'version': jobj['name'],
          'date': elapsedString,
        };

      } catch (error) {
        console.error(`Error whilst ${currentTask}: `, error);
        process.exit(1);
      }
    })();
    
    console.log('result: ', latestStableInfo)

    // =====

    currentTask = "getting latest dev commit date";
    console.log(currentTask);

    let lastDevDate = await ( async () => {
      try {
        const r = await fetch('https://codeberg.org/api/v1/repos/faction/mpd-local-scrobbler/commits?sha=dev&stat=false&verification=false&files=false&page=1&limit=1', {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        });

        const data = await r.text();
        const jobj = JSON.parse(data);

        if (!Array.isArray(jobj) || !jobj[0] || !jobj[0]["created"])
          throw Error('unacceptable response');

        const date = new Date(jobj[0]["created"]);

        if (isNaN(date))
          throw Error('unparsable response');

        return getElapsedSince(date);

      } catch (error) {
        console.error(`Error whilst ${currentTask}: `, error);
        process.exit(1);
      }
    })();

    console.log(`result: ${lastDevDate}`)

    // =====

    currentTask = "getting repo star count";
    console.log(currentTask);

    let starsCount = await ( async () => {
      try {
        const r = await fetch('https://codeberg.org/api/v1/repos/faction/mpd-local-scrobbler', {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        });

        const data = await r.text();
        const jobj = JSON.parse(data);
        
        if (!jobj || !('stars_count' in jobj))
          throw Error('unacceptable response');

        if (!Number.isInteger(jobj['stars_count']))
          throw Error('unparsable response');

        return jobj['stars_count']

      } catch (error) {
        console.error(`Error whilst ${currentTask}: `, error);
        process.exit(1);
      }
    })();
    
    console.log(`result: ${starsCount}`)
    
    // get all info out of the scope
    mpdscrobblerinfo = {
      'repo-stable': `stable: ${latestStableInfo.version}, released ${latestStableInfo.date}`,
      'repo-dev': `last dev commit made ${lastDevDate}`,
      'repo-stats': (starsCount == 1 ? '1 star' : `${starsCount} stars`)
    }
  }
  
  // Update
  var html = fs.readFileSync('../mpd-local-scrobbler.html', 'utf8');

  html = replaceHTMLElem(html, 'repo-stable', mpdscrobblerinfo["repo-stable"])
  html = replaceHTMLElem(html, 'repo-dev', mpdscrobblerinfo["repo-dev"])
  html = replaceHTMLElem(html, 'repo-stats', mpdscrobblerinfo["repo-stats"])

  fs.writeFileSync('../mpd-local-scrobbler.html', html);

  // mpd-rpc-py
  // repo: https://codeberg.org/faction/mpd-rpc-py

  // need to get:
  // latest dev commit date
  // star count

  console.log("generating new info for mpd-rpc-py...");
  var mpdrpcinfo = undefined

  {
    currentTask = "getting latest dev commit date";
    console.log(currentTask);

    let lastDevDate = await ( async () => {
      try {
        const r = await fetch('https://codeberg.org/api/v1/repos/faction/mpd-rpc-py/commits?sha=dev&stat=false&verification=false&files=false&page=1&limit=1', {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        });

        const data = await r.text();
        const jobj = JSON.parse(data);

        if (!Array.isArray(jobj) || !jobj[0] || !jobj[0]["created"])
          throw Error('unacceptable response');

        const date = new Date(jobj[0]["created"]);

        if (isNaN(date))
          throw Error('unparsable response');

        return getElapsedSince(date);

      } catch (error) {
        console.error(`Error whilst ${currentTask}: `, error);
        process.exit(1);
      }
    })();

    console.log(`result: ${lastDevDate}`)

    // =====

    currentTask = "getting repo star count";
    console.log(currentTask);

    let starsCount = await ( async () => {
      try {
        const r = await fetch('https://codeberg.org/api/v1/repos/faction/mpd-rpc-py', {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        });

        const data = await r.text();
        const jobj = JSON.parse(data);
        
        if (!jobj || !('stars_count' in jobj))
          throw Error('unacceptable response');

        if (!Number.isInteger(jobj['stars_count']))
          throw Error('unparsable response');

        return jobj['stars_count']

      } catch (error) {
        console.error(`Error whilst ${currentTask}: `, error);
        process.exit(1);
      }
    })();
    
    console.log(`result: ${starsCount}`)
    
    // get all info out of the scope
    mpdrpcinfo = {
      'repo-dev': `last dev commit made ${lastDevDate}`,
      'repo-stats': (starsCount == 1 ? '1 star' : `${starsCount} stars`)
    }
  }
  
  // Update
  var html = fs.readFileSync('../mpd-rpc-py.html', 'utf8');

  html = replaceHTMLElem(html, 'repo-dev', mpdrpcinfo["repo-dev"])
  html = replaceHTMLElem(html, 'repo-stats', mpdrpcinfo["repo-stats"])

  fs.writeFileSync('../mpd-rpc-py.html', html);
}

updatePages();