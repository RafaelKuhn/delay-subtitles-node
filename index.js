// in my case, we need to read/write the file as-is
// if there's a problem, maybe try changing encoding to "utf-8"
const FILE_ENCODING = "binary";

const ARROW = "-->";

// node file system
const fs = require('fs');
// eol is the default line break (generally '\n' or '\r\n') of your operating system
const { EOL } = require('os');

const firstArg = process.argv[2];
const secondArg = process.argv[3];


console.log("");
console.log("############################################");
console.log("######## NODE JS SUBTITLE DELAYER!! ########");
console.log("############################################");
console.log("");
console.log(`this script will read the .srt file path passed as 1st argument`);
console.log(`and offset all its subtitles by the amount of ms passed as 2nd argument\n`);

if (!firstArg) {
	console.log("error: you should inform the path of subtitle file (.srt) as first argument of this!!");
	process.exit(1);
}

if (!secondArg || isNaN(secondArg)) {
	console.log("error: you should inform the amount of milliseconds to offset\nas an integer");
	process.exit(1);
}

const msToDelay = parseInt(secondArg);

fs.readFile(firstArg, { encoding: FILE_ENCODING }, (error, data) => {
	console.log(`trying to read file ${firstArg}\n`);

  if (error) {
		console.log(error);
    process.exit(1);
  }
	
  const lines = data.split(/\r?\n/);

	for (let i = 0; i < lines.length; i += 1) {
		const line = lines[i];
		
		// only operate on lines that have the timestamp separator '-->'
		if (!line.includes(ARROW)) {
			continue;
		}
		
		const interval = line.split(ARROW);

		// start of subtitle
		const tupleStartTimeAndMillis = interval[0].trim().split(",");
		const startTimeStr = tupleStartTimeAndMillis[0];
		const startTimeMillis = tupleStartTimeAndMillis[1];
		const startTime = startTimeStr.split(":");

		const startDate = new Date();
		startDate.setHours(
			parseInt(startTime[0]),									// hours
			parseInt(startTime[1]), 								// mins
			parseInt(startTime[2]), 								// secs
			parseInt(startTimeMillis) + msToDelay); // millis
		
		const formattedStart = dateToSRTDate(startDate);

		// end of subtitle
		const endTimeAndMillisTuple = interval[1].trim().split(",");
		const endTimeStr    = endTimeAndMillisTuple[0];
		const endTimeMillis = endTimeAndMillisTuple[1]
		const endTimeTuple  = endTimeStr.split(":");

		const endDate = new Date();
		endDate.setHours(
			parseInt(endTimeTuple[0]), 						// hours
			parseInt(endTimeTuple[1]), 						// mins
			parseInt(endTimeTuple[2]), 						// secs
			parseInt(endTimeMillis) + msToDelay); // millis

		const formattedEnd = dateToSRTDate(endDate);

		// this will format line as:	hh:mm:ss,mil --> hh:mm:ss,mil
		// example: 							  	00:01:45,971 --> 00:01:48,440
		const newLine = `${formattedStart} ${ARROW} ${formattedEnd}`;

		// console.log(`\n\n#### UNCOMMENT TO DEBUG ####`);
		// console.log(`'now' should be delayed '${msToDelay}' seconds from 'previous'\n`);
		// console.log(`previous:\n${line}`);
		// console.log(`now:\n${newLine}`);

		lines[i] = newLine;
	}

	const newData = lines.join(EOL);

	// resolve file system save path
	const splitPath = firstArg.split(".");
	splitPath[splitPath.length-2] = splitPath[splitPath.length-2] + "-corrected";
	const correctedPath = splitPath.join(".")
	
	fs.writeFileSync(correctedPath, newData, { encoding: FILE_ENCODING });
	console.log(`great success! subs delayed in ${msToDelay} secs! file saved at\n${correctedPath}`);
})

/** @param {Date} date @returns {String} */
function dateToSRTDate(date) {
	return `${padTwoZeros(date.getHours())}:${padTwoZeros(date.getMinutes())}:${padTwoZeros(date.getSeconds())},${padThreeZeros(date.getMilliseconds())}`;
}

function padTwoZeros(num) {
	return padZeros(num, 2);
}

function padThreeZeros(num) {
	return padZeros(num, 3);
}

function padZeros(num, charAmount) {
	num = num.toString();
	while (num.length < charAmount) {
		num = "0" + num;
	}
	return num;
}