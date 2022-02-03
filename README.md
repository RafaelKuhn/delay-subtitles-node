# Delay Subtitles Node

## What this is

This will offset all subtitles in an .srt subtitles file (specified by 1st script argument)<br>
by an x amount of seconds (specified by 2nd script argument)<br>
and save the new file as $filename-corrected.srt

## Usage
$ node index.js path/to/subtitle.srt delay

Delay must be an integer number (if not specified, will fallback to some other dunno number)
