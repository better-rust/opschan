import * as fs from "fs";
import moment from "moment"

let streamOutput: (undefined | number) = undefined; 
let streamError: (undefined | number) = undefined; 

export const output = (message: string) => {
  const timeFriendly = moment().format("YYYY-MM-DD HH:mm:ss");
  const outputMessage = `${timeFriendly} | LOG | ${message}`;

  if (streamOutput) {
    try {
      fs.writeFileSync(streamOutput as number, outputMessage + "\n");
    } catch (e) {
      if (e instanceof Error && e.message !== "") {
        console.error(`failed to log, closing log, error: ${e.message}`);
      } else {
        console.error(`failed to log, closing log`);
      }

      streamOutput = undefined;
    }
  }

  console.log(outputMessage);
}

export const error = (message: string) => {
  const timeFriendly = moment().format("YYYY-MM-DD HH:mm:ss");
  const outputMessage = `${timeFriendly} | ERROR | ${message}`;

  if (streamError) {
    try {
      fs.writeFileSync(streamError as number, outputMessage + "\n");
    } catch (e) {
      if (e instanceof Error && e.message !== "") {
        console.error(`failed to log, closing log, error: ${e.message}`);
      } else {
        console.error(`failed to log, closing log`);
      }

      streamError = undefined;
    }
  }

  console.error(outputMessage);
}

export const initialize = (outputFilename: (undefined | string), errorFilename: (undefined | string)) => {
  if (outputFilename) {
    try {
      streamOutput = fs.openSync(outputFilename, "as");
    } catch (e) {
      if (e instanceof Error && e.message !== "") {
        error(`failed to create/open log file ${outputFilename}, error: ${e.message}`);
      } else {
        error(`failed to create/open log file ${outputFilename}`);
      }
    }
  }
 
  if (errorFilename) {
    try {
      streamError = fs.openSync(errorFilename, "as");
    } catch (e) {
      if (e instanceof Error && e.message) {
        error(`failed to create/open log file ${errorFilename}, error: ${e.message}`);
      } else {
        error(`failed to create/open log file ${errorFilename}`);
      }
    }
  }
}

