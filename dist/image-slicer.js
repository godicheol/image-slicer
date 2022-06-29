(function() {
    'use strict';

    var exports = {};

    exports.slice = function(src, options, cb) {
        try {
            var image = new Image();
            var filename, extension, mimetype, quality, i, j, c, r, rarr, carr, rlen, clen, len, tw, th, nw, nh, x, y, w, h, rows, cols;
            var sx, sy, sw, sh, dx, dy, dw, dh;
            var output = [];
            var canvasArrayToBlob = function() {
                if (r < rlen) {
                    if (c < clen) {
                        rows[r][c].toBlob(function(blob) {
                            output[r][c] = new File([blob], filename+" ("+(r*clen+c)+")"+extension, {
                                type: blob.type
                            });
                            c++;
                            canvasArrayToBlob();
                        }, mimetype, quality);
                    } else {
                        c = 0;
                        r++;
                        canvasArrayToBlob();
                    }
                } else {
                    return cb(null, output);
                }
            }

            if (!options) {
                throw new Error("Options must be Object");
            }

            filename = options.filename ? options.filename : "sliced";
            quality = typeof(options.quality) === "number" ? options.quality : 0.92;
            mimetype = /^(image\/)/i.test(options.mimetype) ? options.mimetype : "image/png";
            extension = "."+mimetype.replace(/^(image\/)/i, "");
            rarr = options.rows ? options.rows : [];
            carr = options.cols ? options.cols : [];

            // sort array
            rarr = rarr.sort(function(a, b) {
                return a - b;
            });
            carr = carr.sort(function(a, b) {
                return a - b;
            });

            image.onload = function() {
                nw = image.naturalWidth;
                nh = image.naturalHeight;
                rarr.push(nh);
                carr.push(nw);
    
                // create list
                rlen = rarr.length;
                clen = carr.length;
                rows = [];
                th = 0;
                w = 0;
                h = 0;
                for (i = 0; i < rlen; i++) {
                    tw = 0;
                    cols = [];
                    h = rarr[i] - th;
                    for (j = 0; j < clen; j++) {
                        var canvas = document.createElement("canvas");
                        var ctx = canvas.getContext("2d");
                        w = carr[j] - tw;
                        x = tw;
                        y = th;
                        sx = x;
                        sy = y;
                        sw = w;
                        sh = h;
                        dx = 0;
                        dy = 0;
                        dw = w;
                        dh = h;
                        canvas.width = dw;
                        canvas.height = dh;
                        ctx.drawImage(
                            image,
                            sx, sy,
                            sw, sh,
                            dx, dy,
                            dw, dh
                        );
                        cols.push(canvas);
                        tw += w;
                        len++;
                    }
                    th += h;
                    rows.push(cols);
                    output.push([]);
                }
                r = 0;
                c = 0;
                canvasArrayToBlob();
            }
            image.onerror = function() {
                return cb(new Error("Load error"));
            }
            image.src = src;
        } catch(err) {
            return cb(err);
        }
    }

    if (typeof(window.imageSlicer) === "undefined") {
        window.imageSlicer = exports;
    }
})();