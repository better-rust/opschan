import axios from "axios";
import * as config from "./config";
import * as log from "./log";

const HTTP_ACCEPTED_STATUS_CODE = 202;

export const sendAlert = async (data: config.ConfigMonitorObject, identifier: string, hostname: string, message: string) => {
  const configObject = config.get();
  const url = configObject.eu_instance ? "https://api.eu.opsgenie.com/v2/alerts" : "https://api.opsgenie.com/v2/alerts";
  const headers = {
    "Authorization": `GenieKey ${configObject.opsgenie_api_key}`
  };

  const alert_name = data.message ? data.message.replaceAll("${identifier}", identifier)
    .replaceAll("${hostname}", hostname)
    .replaceAll("${message}", message) : "N/A";
  const description = data.description ? data.description.replaceAll("${identifier}", identifier)
    .replaceAll("${hostname}", hostname)
    .replaceAll("${message}", message) : "N/A";

  try {
    const response = await axios.post(url, {
      message: alert_name,
      description: description,
      tags: data.tags,
      priority: data.priority
    }, { headers });

    if (response.status != HTTP_ACCEPTED_STATUS_CODE) {
      log.error(`opgsgenie didn't accept the alert, returned status code is ${response.status}`);
    }
  } catch (e) {
    if (e instanceof Error && e.message) {
      log.error(`failed to send alert to opsgenie, error: ${e.message}`);
    } else {
      log.error("failed to send alert to opsgenie");
    }
  }
}

