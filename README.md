# opschan

"opschan" is a tool which sends alerts to [opsgenie](https://www.atlassian.com/software/opsgenie) from Atlassian. It uses regex to test specific keywords on both journal's identifier or message to send the alerts. 

# Build

It's meant to be compiled into an executable and was developed with [bun](https://bun.sh/). You can convert it to executable with the command ``bun build --compile main.ts --outfile opschan``.

# configuration
To work with opschan you need to create a "config.yml" in the same directory where the application is based. Here's a template and example of the config file:
```yaml
opsgenie_api_key: {YOUR OPSGENIOE API INTEGRATION KEY}
eu_instance: true
log_output_file: log/output.log
log_error_file: log/error.log
monitor:
  - keywords: [".*"]
    identifier: ["^better$"]
    tags: ["Test"]
    priority: "P1"
    message: "Test Alert on ${hostname}"
    description: "Silly alert was triggered on host ${hostname} by ${identifier}\n\n${message}"
```

Breakdown of core configuration:
| Keyword|Required|Description|
|-|-|-|
|``opsgenie_api_key``|Yes|It stores your opsgenie API integration key|
|``eu_instance``|Yes|Opsgenie specifics: if you're have configure your opsgenie to use EU servers, set this field to true, otherwise to false|
|``log_output_file``|No|Where to store the output log|
|``log_error_file``|No|Where to store the error log|
|``monitor``|Yes|Configuration of what to do|

Breakdown of ``monitor``:
| Keyword|Description|
|-|-|
|``keywords``|List of regex words to check the message of the journald's entry|
|``identifier``|List of regex words to check the message of the journald's identifier|
|``tags``|List of tags for the opsgenie alert|
|``priority``|Priority of the opsgenie alert, the range is from P1 (most serious) to P5 (informational)|
|``message``|Alert's message|
|``description``|Alert's description|
>For ``message`` and ``description`` you can use ``${identifier}``, ``${message}``, and ``${hostname}`` to embed the journald's information into the alert
