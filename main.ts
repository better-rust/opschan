import * as path from "path";
import Journalctl from "journalctl";
import * as log from "./log";
import * as config from "./config";
import * as opsgenie from "./opsgenie";

const fixWorkingDirectory = () => {
  let currentExecutablePath = process.execPath;
  let executableName = path.basename(currentExecutablePath);

  // if the source is executed from bun or node, assume it's under development
  if (executableName === "bun" || executableName === "node") {
    return;
  }

  process.chdir(path.dirname(currentExecutablePath));
}

const main = async () => {
  fixWorkingDirectory();

  if (!config.loadConfig()) {
    return;
  }

  const configObject = config.get();

  log.initialize(configObject.log_output_file, configObject.log_error_file);

  log.output("started");

  const journalctl = new Journalctl({
    since: "now", 
    output: "json",
  });

  journalctl.on("error", (e) => {
    if (e instanceof Error && e.message) {
      log.error(`error occured while reading from journald, ${e.message}`);
    } else {
      log.error("error occured while reading from journald");
    }
  });

  journalctl.on("event", (event: {
      MESSAGE?: (undefined | string),
      _HOSTNAME?: (undefined | string),
      SYSLOG_IDENTIFIER?: (undefined | string),
    }) => {
    if (!configObject.monitor || !event.MESSAGE || !event.SYSLOG_IDENTIFIER) {
      return;
    }

    for (const index in configObject.monitor) {
      const monitorEntry = configObject.monitor[index];

      if (!monitorEntry.keywords || !monitorEntry.identifier || !monitorEntry.description || !monitorEntry.priority || !monitorEntry.message) {
        continue;
      }

      for (const index in monitorEntry.identifier) {
        if (monitorEntry.identifier[index].test(event.SYSLOG_IDENTIFIER)) {
          let identiferKeyword = monitorEntry.identifier[index];

          for (const index in monitorEntry.keywords) {
            if (monitorEntry.keywords[index].test(event.MESSAGE)) {
              log.output(`keyword "${monitorEntry.keywords[index]}" on identifier "${identiferKeyword}" caught", sending alert`);

              opsgenie.sendAlert(monitorEntry,
                event.SYSLOG_IDENTIFIER ? event.SYSLOG_IDENTIFIER : "",
                event._HOSTNAME ? event._HOSTNAME : "",
                event.MESSAGE ? event.MESSAGE : ""
              );
            }
          }

          break;
        }
      }
    }
  });
}

(async () => {
  await main();
})();

