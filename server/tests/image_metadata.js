const fs = require('fs')
const path = require('path')

var JPEGDecoder = require('jpg-stream/decoder');
var concat = require('concat-frames');

let fileName = path.join(__dirname, '../upload/upload_1feb3668512d091ddf04235ca75ed784.jpg')
// decode a JPEG file to RGB pixels
fs.createReadStream(fileName)
  .pipe(new JPEGDecoder)
  .on('meta', function(meta) {
    // meta contains an exif object as decoded by
    // https://github.com/devongovett/exif-reader
    console.log(meta)
  })
  .pipe(concat(function(frames) {
    // frames is an array of frame objects (one for JPEGs)
    // each element has a `pixels` property containing
    // the raw RGB pixel data for that frame, as
    // well as the width, height, etc.
  }));