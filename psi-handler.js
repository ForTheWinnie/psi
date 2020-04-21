var prettyjson = require('prettyjson'); // Un-uglify JSON output
var {google} = require('googleapis');
var key = require('./ga-key.json'); // Downloaded JSON file

var viewID = 'ID'; // Google Analytics view ID
var analytics = google.analyticsreporting('v4'); // Used for pulling report
var jwtClient = new google.auth.JWT(key.client_email, // For authenticating and permissions
                                    null,
                                    key.private_key,
                                    ['https://www.googleapis.com/auth/analytics.readonly'],
                                    null);

// google.options({ auth: oauth2Client });
// var request ={
//   'headers': {'Content-Type': 'application/json'},
//   'auth': oauth2Client,
//   'resource': req,
// };
 
jwtClient.authorize(function (err, tokens) {
  if (err) {
    console.log('Reeeeejected');
    console.log(err);
    return;
  } else {
    oauth2Client.setCredentials({
      access_token: result.access_token
    });
    console.log('Yup, we got authorized!');
  }
});
 
// Set up what we data we want to pull from Google Analytics
metrics_columns = [{
  expression: 'ga:pageviews'
}];
 
dimensions_rows = [{
  name: 'ga:sourceMedium'
}];
 
date_filters = [{
  startDate: 'today',
  endDate: 'today',
}];
 
sort = [{
  fieldName: 'ga:pageviews',
  sortOrder: "DESCENDING"
}];
 
var req = {
  reportRequests: [{
    viewId: viewID,
    dateRanges: date_filters,
    metrics: metrics_columns,
    dimensions: dimensions_rows,
    orderBys: sort
  }],
};
 
// Options for prettifying JSON output
var pretty_json_options = {
  noColor: false
};
 
// Pull report and output the data
analytics.reports.batchGet({
    auth: jwtClient,
    resource: req
  },
  function (err, response) {
    if (err) {
      console.log('Failed to get Report');
      console.log(err);
      return;
    }
    // response.data is where the good stuff is located
    console.log('Success - got something back from the Googlez');
    console.log(prettyjson.render(response.data, pretty_json_options));
  }
);
////////

const fs = require('fs');
console.log("====    LET'S SEE....      =======");
fs.readFile('data.json', (err, data) => {  
  if (err) throw err;
  let jsonURLs = (JSON.parse(data));
  for(var i = 0; i < jsonURLs.length; i++){
    setDelay(1000);
    let currURL = jsonURLs[i].path;
      console.log("currURL: " + currURL); 
      run(currURL); 
  }
});


function setDelay(ms) {
  var start = Date.now(),
    now = start;
  while (now - start < ms) {
    now = Date.now();
  }
}

function setUpQuery(currURL) {
  const api = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
  const parameters = {
    url: currURL,
    strategy: 'desktop', 
    key: 'psikey'
  };
  let query = `${api}?`;
  for (key in parameters) {
    query += `${key}=${parameters[key]}&`;
  }
  console.log("query: " + query);
  return query;
}

  function showInitialContent(id) {
    // ga('create', 'UA-ID-1', 'auto'); 
    // ga('set', 'metric1', json.lighthouseResult.categories.performance.score);

    console.log("======================METRIC PERF: " + json.lighthouseResult.categories.performance.score);
    console.log(`Page tested: ${id}`);
  }
  
  function showCruxContent(cruxMetrics) {
    console.log("PageSpeed Insights Data======================");
    for (key in cruxMetrics) {
      console.log(`${key}: ${cruxMetrics[key]}`);
    }
  }

  function showLighthouseContent(lighthouseMetrics) {
    console.log("Lighthouse Results======================");
    for (key in lighthouseMetrics) {
      console.log(`${key}: ${lighthouseMetrics[key]}`);
    }
  }

  function run(currURL) {
    const url = setUpQuery(currURL);
    const fetch = require("node-fetch");
    fetch(url)
      .then(response => response.json())
      .then(json => {
        // See https://developers.google.com/speed/docs/insights/v5/reference/pagespeedapi/runpagespeed#response
        // to learn more about each of the properties in the response object.
        showInitialContent(json.id);
        const cruxMetrics = {
          "Score": (json.lighthouseResult.categories.performance.score)*100,	
          "First Contentful Paint": json.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.category,
          "First Input Delay": json.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.category
        };
        showCruxContent(cruxMetrics);
        const lighthouse = json.lighthouseResult;
        const lighthouseMetrics = {
          'First Contentful Paint': lighthouse.audits['first-contentful-paint'].displayValue,
          'Speed Index': lighthouse.audits['speed-index'].displayValue,
          'Time To Interactive': lighthouse.audits['interactive'].displayValue,
          'First Meaningful Paint': lighthouse.audits['first-meaningful-paint'].displayValue,
          'First CPU Idle': lighthouse.audits['first-cpu-idle'].displayValue,
          'Estimated Input Latency': lighthouse.audits['estimated-input-latency'].displayValue
        };
        showLighthouseContent(lighthouseMetrics);
      });
  }