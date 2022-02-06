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
Doing so will only affect that specific theme.

1. Copy the `ghost-series-display.min.js` script to your theme's `assets` directory for JS (e.g., `assets/js/`).
2. Open your theme's `default.hbs` template (or equivalent used by all child templates).
3. Add the JS code (example below) near the closing body tag: `</body>`. Typically, this is just before or after a script or ghost foot partial (e.g., `{{ghost_foot}}`).

### Integration Script Examples
Our first example is the most basic to get things running. 
It requires you to verify (or chnage) the location of the Series Display script file 
you copied to your server and your generated Ghost Content API key. 
Additionally, if your Admin site is separate from your content site, you will need to 
update code with the that URL (e.g., `https://admin.mysite.com`).
All 3 values are near the end of the script.

*Note: If you already included a reference to the Ghost Content API script before, 
or it is included in your theme, you do not need to include the first line.*

```js
<script src="https://unpkg.com/@tryghost/content-api@1.6.0/umd/content-api.min.js"></script>
<script>
    // Series Display
    (function(src, apiKey, apiUrl) {
        var api = new GhostContentAPI({ url: apiUrl, key: apiKey, version: 'v4' });
        
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
        
        loadSeriesDisplay(document, src, api)
            .then((seriesDisplay) => {
                // Minimum needed to display series info.
                seriesDisplay.displaySeriesInfo(document);
            });
    })(
        '/assets/js/ghost-series-display.min.js',              // location to the series display script
        '0123456789abcdef0123456789',                          // your Ghost Content API key
        `${window.location.protocol}//${window.location.host}` // URL to your Ghost Admin site
    );
</script>
```
