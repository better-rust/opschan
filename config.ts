import * as fs from "fs";
import yaml from "yaml";
import * as log from "./log";

const configFilename = "config.yml";

export type ConfigMonitorObject = {
  keywords?: undefined | RegExp[],
  identifier?: undefined | RegExp[],
  tags?: undefined | string[],
  priority?: undefined | string,
  message?: undefined | string,
  description?: undefined | string,
}

export type ConfigObject = {
  opsgenie_api_key?: undefined | string,
  eu_instance?: undefined | boolean,
  log_output_file?: undefined | string,
  log_error_file?: undefined | string,
  monitor?: undefined | ConfigMonitorObject[],
};

let configObject: (undefined | ConfigObject) = undefined;

export const get = () => {
  if (!configObject) {
    throw new Error("config file is not loaded");
  }

  return configObject;
}

const checkRequiredConfigFields = (): boolean => {
  if (!configObject) {
    return false;
  }

  if (!configObject.opsgenie_api_key || typeof configObject.opsgenie_api_key !== "string") {
    log.error("expected field \"opsgenie_api_key\" to be string");
    return false;
  }

  if (!configObject.eu_instance || typeof configObject.eu_instance !== "boolean") {
    log.error("expected field \"eu_instance\" to be boolean");
    return false;
  }

  if (!configObject.monitor || typeof configObject.monitor !== "object") {
    log.error("expected field \"monitor\" to be object");
    return false;
  }

  for (const index in configObject.monitor) {
    let value = configObject.monitor[index];

    if (!value.keywords || !(Array.isArray(value.keywords) && value.keywords.every(entry => typeof entry === "string"))) {
      log.error("in the field \"monitor\", one entry's field \"keyword\" is not array of strings");
      return false;
    }

    if (!value.identifier || !(Array.isArray(value.identifier) && value.identifier.every(entry => typeof entry === "string"))) {
      log.error("in the field \"monitor\", one entry's field \"identifier\" is not array of strings");
      return false;
    }

    try {
      value.keywords = value.keywords.map(value => new RegExp(value));
    } catch (e) {
      if (e instanceof Error && e.message) {
        log.error(`in the field monitor's field "keywords", error: ${e.message}`);
      } else {
        log.error("in the field monitor's field \"keywords\", invalid regex");
      }

      return false;
    }

    try {
      value.identifier = value.identifier.map(value => new RegExp(value));
    } catch (e) {
      if (e instanceof Error && e.message) {
        log.error(`in the field monitor's field "identifier", error: ${e.message}`);
      } else {
        log.error("in the field monitor's field \"identifier\", invalid regex");
      }

      return false;
    }

    if (!value.tags || !(Array.isArray(value.tags) && value.tags.every(entry => typeof entry === "string"))) {
      log.error("in the field \"monitor\", one entry's field \"tags\" is not array of strings");
      return false;
    }

    if (!value.priority || typeof value.priority !== "string") {
      log.error("in the field \"monitor\", one entry's field \"priority\" is not string");
      return false;
    }

    const acceptedPriority = [ "P1", "P2", "P3", "P4", "P5" ];

    if (acceptedPriority.every((acceptedValue) => {
      return acceptedValue !== value.priority;
    })) {
      log.error(`in the field "monitor", one entry's field "priority" is not valid, value "${value.priority}" is not P1-P5`);
      return false;
    }

    if (!value.message || typeof value.message !== "string") {
      log.error("in the field \"monitor\", one entry's field \"message\" is not string");
      return false;
    }

    if (!value.description || typeof value.description !== "string") {
      log.error("in the field \"monitor\", one entry's field \"description\" is not string");
      return false;
    }
  }

  return true;
}

const checkOptionalConfigFields = (): boolean => {
  if (!configObject) {
    return false;
  }

  if (configObject.log_output_file && typeof configObject.log_output_file !== "string") {
    log.error("expected field \"log_output_file\" to be string");
    return false;
  }

  if (configObject.log_error_file && typeof configObject.log_error_file !== "string") {
    log.error("expected field \"log_error_file\" to be string");
    return false;
  }

  return true;
}

export const loadConfig = (): boolean => {
  let fileContent: string = "";

  try {
    fileContent = fs.readFileSync(configFilename).toString();

    if (!fileContent) {
      throw new Error("Empty file");
    }
  } catch (e) {
    if (e instanceof Error && e.message) {
      log.error(`failed to load config file ${configFilename}, error: ${e.message}`);
    } else {
      log.error(`failed to load config file ${configFilename}`);
    }

    return false;
  }

  try {
    configObject = yaml.parse(fileContent);

    if (!configObject) {
      throw new Error("Invalid YAML file");
    }
  } catch (e) {
    if (e instanceof Error && e.message) {
      log.error(`failed to parse config file ${configFilename}, error: ${e.message}`);
    } else {
      log.error(`failed to parse config file ${configFilename}`);
    }

    return false;
  }

  if (!checkRequiredConfigFields()) {
    return false;
  }

  if (!checkOptionalConfigFields()) {
    return false;
  }

  return true;
}

