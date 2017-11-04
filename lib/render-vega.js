const vg = require('vega');
const vl = require('vega-lite');
const lz = require('lz-string');
const schema = require('vega-schema-url-parser').default;

function handleRequest({key, salt, mode}) {
  if (!key) return Promise.reject('empty key!');
  var spec = lz.decompressFromEncodedURIComponent(key);
  try {
    spec = JSON.parse(spec);
  } catch (err) {
    return Promise.reject('invalid key!');
  }

  // check schema for spec if possible
  if (spec['$schema']) {
    let {library, version} = schema(spec['$schema']);
    if (library === 'vega-lite' && version.slice(0, 2) !== 'v2')
      return Promise.reject(`${library} ${version} not supported!`);
    if (library === 'vega' && version.slice(0, 2) !== 'v3')
      return Promise.reject(`${library} ${version} not supported!`);
    salt = library;
  }

  if (salt === 'vega-lite' || !salt) {
    try {
      spec = vl.compile(spec).spec;
    } catch (err) {
      // do nothing
    }
  }

  if (mode === 'html') {
    return Promise.resolve(renderHtml(spec));
  }
  var runtime;
  try {
    runtime = vg.parse(spec);
  } catch (err) {
    return Promise.reject(err);
  }
  var view = new vg.View(runtime).renderer('none').initialize();
  if (mode === 'svg') return streamSvg(view);
  return streamImage(view);
}

function streamImage(view) {
  return view
    .toCanvas()
    .then(function(canvas) {
      return {body: canvas.toBuffer(), mime: 'image/png'};
    })
    .catch(function(err) {
      console.error(err);
    });
}

function streamSvg(view) {
  return view
    .toSVG()
    .then(body => {
      return {body, mime: 'image/svg+xml'};
    })
    .catch(function(err) {
      console.error(err);
    });
}

function renderHtml(spec) {
  let body = `<script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/1.0.13/webcomponents-loader.js"></script>
<link rel="import" href="https://rawgit.com/PolymerVis/vega-element/polymer2/vega-element-cdn.html">
<vega-element tooltip hover vega-spec='${JSON.stringify(
    spec
  )}'></vega-element>`;
  return {body, mime: 'text/html'};
}

module.exports = handleRequest;
