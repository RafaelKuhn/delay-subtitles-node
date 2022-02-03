// in my case, we need to read/write the file as-is
// if there's a problem, maybe try changin encoding to "utf-8"
const FILE_ENCODING = "binary";

const SRT_DATE_INTERVAL_SEPARATOR = "-->";

// node file system
const fs = require('fs');
// eol is the default line break (generally '\n' or '\r\n') of your operating system
const { EOL } = require('os');

const pathArg = process.argv[2];
const secondsToDelayArg = process.argv[3];


console.log("");
console.log("############################################");
console.log("######## NODE JS SUBTITLE DELAYER!! ########");
console.log("############################################");
console.log("");
console.log(`this script will read the .srt file path passed as 1st argument`);
console.log(`and offset all its subtitles by the number informed in the 2nd argument\n`);

if (!pathArg) {
	console.log("error: you should inform the path of subtitle file (.srt) as first argument of this!!");
	process.exit();
}

if (!secondsToDelayArg || isNaN(secondsToDelayArg)) {
	console.log("error: you should inform the amount of seconds to offset\nas a plain integer like 3 or 7 or -5!!");
	process.exit();
}

const secondsToDelay = parseInt(secondsToDelayArg);

fs.readFile(pathArg, { encoding: FILE_ENCODING }, (error, data) => {
	console.log(`trying to read file ${pathArg}\n`);

  if (error) {
		console.log(error);
    process.exit();
  }
	
  const lines = data.split(/\r?\n/);

	for (let i = 0; i < lines.length; i += 1) {
		const line = lines[i];
		
		// only operate on lines that have the timestamp separator '-->'
		if (!line.includes(SRT_DATE_INTERVAL_SEPARATOR)) {
			continue;
		}
		
		const interval = line.split(SRT_DATE_INTERVAL_SEPARATOR);

		// start of subtitle
		const tupleStartTimeAndMillis = interval[0].trim().split(",");
		const startTimeStr = tupleStartTimeAndMillis[0];
		const startTimeMillis = tupleStartTimeAndMillis[1];
		const startTime = startTimeStr.split(":");

		const startDate = new Date();
		startDate.setHours(parseInt(startTime[0]), parseInt(startTime[1]), parseInt(startTime[2]));
		startDate.setSeconds(startDate.getSeconds() + secondsToDelay);
		
		const formattedStart = `${padZero(startDate.getHours())}:${padZero(startDate.getMinutes())}:${padZero(startDate.getSeconds())},${startTimeMillis}`;

		// end of subtitle
		const tupleEndTimeAndMillis = interval[1].trim().split(",");
		const endTimeStr = tupleEndTimeAndMillis[0];
		const endTimeMillis = tupleEndTimeAndMillis[1]
		const endTime    = endTimeStr.split(":");

		const endDate = new Date();
		endDate.setHours(parseInt(endTime[0]), parseInt(endTime[1]), parseInt(endTime[2]));
		endDate.setSeconds(endDate.getSeconds() + secondsToDelay);

		const formattedEnd = `${padZero(endDate.getHours())}:${padZero(endDate.getMinutes())}:${padZero(endDate.getSeconds())},${endTimeMillis}`;

		// this will format line as
		// hh:mm:ss,mil --> hh:mm:ss,mil
		// 00:01:45,971 --> 00:01:48,440
		const newLine = `${formattedStart} ${SRT_DATE_INTERVAL_SEPARATOR} ${formattedEnd}`;

		// console.log(`\n\n#### UNCOMMENT TO DEBUG ####`);
		// console.log(`'now' should be delayed '${secondsToDelay}' seconds from 'previous'\n`);
		// console.log(`previous:\n${line}`);
		// console.log(`now:\n${newLine}`);

		lines[i] = newLine;
	}

	const newData = lines.join(EOL);

	// resolve file system save path
	const splitPath = pathArg.split(".");
	splitPath[splitPath.length-2] = splitPath[splitPath.length-2] + "-corrected";
	const correctedPath = splitPath.join(".")
	
	fs.writeFileSync(correctedPath, newData, { encoding: FILE_ENCODING });
	console.log(`great success! subs delayed in ${secondsToDelay} secs! file saved at\n${correctedPath}`);
})

function padZero(num) {
	num = num.toString();
	while (num.length < 2) {
		num = "0" + num;
	}
	return num;
}