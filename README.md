# Ghost-Series-Display
Displays posts in a series for the Ghost publishing platform.

## Integration to Your Site
You must have a Content API key for your site first. You will likely need to generate a new 
Content API key. TODO: Link to that process. Once your key is ready, 
there are a couple options to integrate Series Display with your Ghost site.

### Basic Method: Code Injection
The easiest way to integrate with your site is to inject code via the Admin site.

Copy the `ghost-series-display.min.js` file to your site's server.
We recommend finding the `assets` directory likely already included with your theme and copying the 
file to a sensible location there (e.g., `assets/js/`).

Next, you will need to add some code via your Admin site.

1. Login to your Admin site.
2. Navigate to the Settings area.
3. Choose Code Injection.
4. Add the JS code (example below) to the Site Footer.

### Advanced Method: Theme Edits
If you are comfortable editing your site's theme, you can integrate directly. 
However, doing so will only affect that specific theme, whereas the Code Injection method works for 
any theme (barring some possible needed tweaks to the embed script for insertions).

1. Install the `ghost-series-display` package via NPM to your theme project: 
```
npm i ghost-series-display --save-dev
```
2. Update your theme's build script to include one of the scripts from the `ghost-series-display` package.
Below is an example for adding its UMD script to the `Casper` theme.
```js
function js(done) {
    pump([
        src([
            'assets/js/lib/*.js',
            'assets/js/*.js'
        ], {sourcemaps: true}),
        uglify(),
        concat('casper.js'),
        dest('assets/built/', {sourcemaps: '.'}),
        
        src('node_modules/ghost-series-display/dist/umd/ghost-series-display.min.js'),
        dest('assets/built/', {sourcemaps: '.'}),
        
        livereload()
    ], handleError(done));
}
```
3. Open your theme's main template (usually `default.hbs`).
4. Add a block for page scripts just before the `ghost_foot` helper.
```html
    {{{block "pageScripts"}}}

    {{ghost_foot}}
</body>
```
5. Open your theme's post template (e.g., `post.hbs`).
6. Add the integration script code inside a content block matching the name used in your main template.
```html
{{#contentFor "pageScripts"}}
<script src="https://unpkg.com/@tryghost/content-api@1.6.0/umd/content-api.min.js"></script>
<script>
    // Series Display
    (function(opts) {
        ...
    })({
        document: window.document, 
        src:      '{{asset "built/ghost-series-display.min.js"}}', 
        apiKey:   '0123456789abcdef0123456789', 
        apiUrl:   `${window.location.protocol}//${window.location.host}`
    });
</script>
{{/contentFor}}
```

### Integration Script Examples
These examples require you to verify (or change) the location of the Series Display script file 
and your generated Ghost Content API key. Additionally, if your Admin site is separate from your 
content site, you will need to change that argument with the apporporiate URL 
(e.g., `https://admin.mysite.com`). All 3 values are near the end of the script.

If you would rather copy the Series Display script file to your server, you must change the 
`src` property near the end of the integration script. An example of such a change could be:

```js
{
    document: window.document, 
    src:      '/assets/built/ghost-series-display.min.js', 
    apiKey:   '0123456789abcdef0123456789', 
    apiUrl:   `${window.location.protocol}//${window.location.host}`
}
```

*Note: If you already included a reference to the Ghost Content API script file before, 
or it is included in your theme, you do not need to include the first line of the inclusion
script code.*

#### Basic Example

Our first example is the most basic to get things running. It uses default options and works
well for the Casper theme (or any theme that has an element with class `.gh-content` for the 
post content).

```js
<script src="https://unpkg.com/@tryghost/content-api@1.6.0/umd/content-api.min.js"></script>
<script>
    // Series Display
    (function(opts) {
        var api = new GhostContentAPI({ url: opts.apiUrl, key: opts.apiKey, version: 'v4' });
        
        function loadSeriesDisplay(document, src, api) {
            return new Promise((resolve, reject) => {
                var script = document.createElement('script');
                script.onload = () => resolve(new GhostSeriesDisplay.SeriesDisplay(api));
                script.onerror = reject;
                script.async = true;
                script.src = src;
                document.head.append(script);
            });
        }
        
        loadSeriesDisplay(opts.document, opts.src, api)
            .then((seriesDisplay) => {
                // Minimum needed to display series info.
                seriesDisplay.displaySeriesInfo(document);
            });
    })({
        document: window.document, 
        src:      'https://unpkg.com/ghost-series-display/dist/umd/ghost-series-display.min.js', 
        apiKey:   '0123456789abcdef0123456789', 
        apiUrl:   `${window.location.protocol}//${window.location.host}`
    });
</script>
```

#### Customized Example

Another example uses custom options for the display of our series info.

```js
<script src="https://unpkg.com/@tryghost/content-api@1.6.0/umd/content-api.min.js"></script>
<script>
    // Series Display
    (function(opts) {
        var api = new GhostContentAPI({ url: opts.apiUrl, key: opts.apiKey, version: 'v4' });
        
        function loadSeriesDisplay(document, src, api) {
            return new Promise((resolve, reject) => {
                var script = document.createElement('script');
                script.onload = () => resolve(new GhostSeriesDisplay.SeriesDisplay(api));
                script.onerror = reject;
                script.async = true;
                script.src = src;
                document.head.append(script);
            });
        }
        
        loadSeriesDisplay(opts.document, opts.src, api)
            .then((seriesDisplay) => {
                // Do not show info for a single post series (need at least 2 posts in the series).
                // Show series info at the top of the post AND after the post's read more nav.
                // * Our theme uses the .post class for its post element. 
                var options = {
                    hideSinglePostSeries: true,
                    insertions: [
                        {
                            selector: '.post',
                            position: GhostSeriesDisplay.ElementInsertionPosition.BEGIN
                        },
                        {
                            selector: '.post ~ nav.read-more',
                            position: GhostSeriesDisplay.ElementInsertionPosition.AFTER
                        }
                    ]
                }
                seriesDisplay.displaySeriesInfo(document);
            });
    })({
        document: window.document, 
        src:      'https://unpkg.com/ghost-series-display/dist/umd/ghost-series-display.min.js', 
        apiKey:   '0123456789abcdef0123456789', 
        apiUrl:   `${window.location.protocol}//${window.location.host}`
    });
</script>
```
