# Delay Subtitles Node

## What this is

This will:<br>
🡆 offset all subtitles in an .srt file (path specified in 1st script argument)<br>
by an X amount of milliseconds (specified by 2nd script argument)<br>
🡆 save the new file as $filename-corrected.srt

## Usage
```$ node index.js path/to/subtitle.srt delay-ms```

## Examples
```$ node index.js ~/movies/bugs-bunny/bugs-bunny.srt 300```<br>
this will delay all Bugs Bunny's subtitles in 300 milliseconds<br>
and save it into the output file:<br>
~/movies/bugs-bunny/bugs-bunny-corrected.srt


```$ node index.js ~/movies/bugs-bunny/bugs-bunny.srt -300```<br>
this will advance all Bugs Bunny's subtitles in 300 milliseconds<br>
and save it into the output file:<br>
~/movies/bugs-bunny/bugs-bunny-corrected.srt


Delay must be an integer number