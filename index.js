// subtitles will be delayed by the second argument's value
const DEFAULT_SECONDS_TO_DELAY = 12;

// in my case, we need to read/write the file as-is
// if there's a problem, maybe try reading/writing as "utf-8"
const DEFAULT_FILE_ENCODING = "binary";

const fs = require('fs');
const { EOL } = require('os');

const SRT_INTERVAL_SEPARATOR = "-->";

const path = process.argv[2];
const secondsToDelay = process.argv[3] ? parseInt(process.argv[3]) : DEFAULT_SECONDS_TO_DELAY;

console.log("");
console.log("############################################");
console.log("######## NODE JS SUBTITLE DELAYER!! ########");
console.log("############################################");
console.log("");
console.log(`this will get the .srt file path passed as 1st argument of this script`);
console.log(`and delay all its contents by the number informed in the 2nd argument`);
console.log(`(if none informed, default is ${DEFAULT_SECONDS_TO_DELAY}) because I want it this way\n`);


if (!path) {
	console.log("error: you should inform the path of subtitle file (.srt) as first argument of this!!");
	process.exit();
}

fs.readFile(path, { encoding: DEFAULT_FILE_ENCODING }, (error, data) => {
	console.log(`trying to read file ${path}\n`);

  if (error) {
		console.log(error);
    process.exit();
  }
	
  const lines = data.split(EOL);

	for (let i = 0; i < lines.length; i += 1) {
		const line = lines[i];
		
		if (!line.includes(SRT_INTERVAL_SEPARATOR)) {
			continue;
		}
		
		const interval = line.split(SRT_INTERVAL_SEPARATOR);
		const startTimeStr = interval[0].trim().split(",")[0];
		const startTime = startTimeStr.split(":");

		const endTimeStr = interval[1].trim().split(",")[0];
		const endTime   = endTimeStr.split(":");

		const startDate = new Date();
		startDate.setHours(parseInt(startTime[0]));
		startDate.setMinutes(parseInt(startTime[1]));
		startDate.setSeconds(parseInt(startTime[2]));

		startDate.setSeconds(startDate.getSeconds() + secondsToDelay);
		const formattedStart = `${padNumberWithZeros(startDate.getHours(), 2)}:${padNumberWithZeros(startDate.getMinutes(), 2)}:${padNumberWithZeros(startDate.getSeconds(), 2)}`;

		const endDate = new Date();
		endDate.setHours(parseInt(endTime[0]));
		endDate.setMinutes(parseInt(endTime[1]));
		endDate.setSeconds(parseInt(endTime[2]));

		endDate.setSeconds(endDate.getSeconds() + secondsToDelay);
		const formattedEnd = `${padNumberWithZeros(endDate.getHours(), 2)}:${padNumberWithZeros(endDate.getMinutes(), 2)}:${padNumberWithZeros(endDate.getSeconds(), 2)}`;


		// THIS IS WRONG
		const newLine = line.replace(startTimeStr, formattedStart).replace(endTimeStr, formattedEnd);

		// console.log(`\n\n#### UNCOMMENT TO DEBUG ####`);
		// console.log(`'now' should be delayed '${secondsToDelay}' seconds from 'previous'\n`);
		// console.log(`previous:\n${line}`);
		// console.log(`now:\n${newLine}`);

		lines[i] = newLine;
	}

	const newData = lines.join(EOL);

	// resolve file save path
	const splitPath = path.split(".");
	splitPath[splitPath.length-2] = splitPath[splitPath.length-2] + "-corrected";
	const correctedPath = splitPath.join(".")
	
	fs.writeFileSync(correctedPath, newData, { encoding: DEFAULT_FILE_ENCODING });
	console.log(`great success! subs delayed in ${secondsToDelay} secs! file saved at\n${correctedPath}`);
})

function padNumberWithZeros(num, size) {
	num = num.toString();
	while (num.length < size) {
		num = "0" + num;
	}

	return num;
}