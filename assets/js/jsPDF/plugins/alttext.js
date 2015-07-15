/**
 * Prints a line of non-ASCII text as a series of images.
 * All doc.text methods can be replaced with this method.
 * Works like doc.text but requires a fontsize (default is 10).
 *
 * Add function to jsPDF instance (do not overwrite doc.text):
 *      var doc = new jsPDF();
 *      doc.alttext = nonASCIItext;
 *
 * @param {Number} x         Horizontal displacement
 * @param {Number} y         Vertical displacement
 * @param {String} ch_string Non-ASCII string to add as an image
 * @param {Number} fontsize  Similar sizing as doc.setFontSize()
 */
function nonASCIItext(x, y, ch_string, fontsize) {
    if (ch_string === null) return;

    // Test if there is non-ASCII characters in string
    var hasNonASCII = false,
        defaultFontSize = 10;
    for (var i=0; i<ch_string.length; i++) {
        if (ch_string.charCodeAt(i) > 128) {
            hasNonASCII = true;
        }
    }

    // If all chars are "ASCII" then use built-in doc.text function
    if (hasNonASCII === false) {
        if (fontsize) this.setFontSize(fontsize);
        this.text(x, y, ch_string);
        return;
    }

    /**
     * Create temp canvas and ctx once and store on doc object
     */
    if (this.charCtx === undefined) {
        // Canvas & ctx settings
        var background = "#fff",
            foreground = "#000",
            font = "bold 150px PMingLiU",
            width = '150';  // Height default is 150

        this.charCanvas = document.createElement('canvas');
        this.charCanvas.width = width;
        this.charCtx = this.charCanvas.getContext('2d');
        this.charCtx.font = font;
        this.charCtx.clear = function () {
            // Clear content using background color
            this.fillStyle = background;
            this.fillRect(0,0,width,width);
            this.fillStyle = foreground;
        };
    }

    // Convenience and iter tracking vars for loop
    var ctx = this.charCtx,
        xi = x,
        width = this.charCanvas.width,
        scale = (fontsize || defaultFontSize) / 450;

    // Make image for each character and add to document
    for (var i=0; i<ch_string.length; i++) {
        ctx.clear();
        ctx.fillText(ch_string.charAt(i), 0, 120);  // Draw character
        this.addImage(
            this.charCanvas.toDataURL("image/jpeg", 1.0),  // 1.0 highest quality,
            'JPEG',
            xi, y-width*scale*.9,  // Offset
            width*scale, width*scale  // Sizing
        );
        xi = xi + ctx.measureText(ch_string.charAt(i)).width*scale*1.1;  // 1.1 for a little extra space
    }
};
