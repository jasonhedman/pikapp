import React from "react";
import PropTypes from "prop-types";
import uuid from "uuid/v4";

import LogglyContext from "./LogglyContext";

const LOGGLY_COLLECTOR_DOMAIN = "logs-01.loggly.com";

// Loggly Provider wraps the app level component and set up
// a "logger" in the context that can be used in nested components
// that access props.logger by using the withLogging HOC
class LogglyProvider extends React.Component {
  constructor(props) {
    super(props);
    this.sessionId = uuid();
    this.oldConsoleLog = null;

    this.consoleLog = this.consoleLog.bind(this);
    this.log = this.log.bind(this);
  }

  render() {
    const contextValue = { logger: this.log };
    return (
      <LogglyContext.Provider value={contextValue}>
        {this.props.children}
      </LogglyContext.Provider>
    );
  }

  componentWillMount() {
    // Override real console log if logFromConsole
    if (
      this.props.token &&
      this.props.logFromConsole &&
      typeof console &&
      console.log
    ) {
      this.oldConsoleLog = console.log;
      console.log = this.log;
    }
  }

  componentWillUnmount() {
    // Restore real console log
    if (this.oldConsoleLog) {
      console.log = this.oldConsoleLog;
      this.oldConsoleLog = null;
    }
  }

  consoleLog(data) {
    if (this.oldConsoleLog) {
      this.oldConsoleLog(data);
    } else if (typeof console && console.log) {
      console.log(data);
    }
  }

  log(data) {
    // Log to the console, note the console may be overridden to point to this
    // function, if so the real console.log is stored in this.oldConsoleLog.
    const data_type = typeof data;
    if (this.props.logToConsole) {
      if (data && data_type === "object" && data.trace) {
        let component_name = "???";
        if (data.component) {
          component_name = `${data.component}`;
        }

        let method_name = "";
        if (data.method) {
          method_name = `.${data.method}()`;
        }

        this.consoleLog(`TRACE: ${component_name}${method_name}: ${data.trace}`);
      } else {
        this.consoleLog(data);
      }
    }

    // If there is no token, then don't even try to log to Loggly.
    if (!this.props.token) {
      this.consoleLog("No loggly token present, can't log to loggly.");
      return;
    }

    // Don't log if the message is not an object or pure string.
    if (!data || !(data_type === "object" || data_type === "string")) {
      this.consoleLog(`Can't log ${data_type} of message to loggly. Skipping.`);
      return;
    }
    const message = data_type === "string" ? { text: data } : data;

    // Add our unique Session ID
    message.sessionId = this.sessionId;

    // Add the tags
    const tags = [];
    if (typeof message.tags === "string") {
      tags.push(message.tags);
    }
    if (Array.isArray(message.tags)) {
      tags.push(...message.tags);
    }
    if (Array.isArray(this.props.tags)) {
      tags.push(...this.props.tags);
    }

    const tag = tags.join();
    message.tags = tags;

    // Build the url from the token and tags
    const logglyUrl = `https://${LOGGLY_COLLECTOR_DOMAIN}/inputs/${this.props.token}/tag/${tag}`;

    try {
      // Write it and catch all exceptions.
      const xmlHttp = new XMLHttpRequest();
      xmlHttp.open("POST", logglyUrl, true);
      xmlHttp.setRequestHeader("Content-Type", "text/plain");
      xmlHttp.send(JSON.stringify(message));
    } catch (ex) {
      this.consoleLog(
        `Failed to log to loggly because of this exception:\n ${ex}`
      );
      this.consoleLog("Failed log data:", message);
    }
  }
}

LogglyProvider.propTypes = {
  token: PropTypes.string,
  logFromConsole: PropTypes.bool,
  logToConsole: PropTypes.bool,
  tags: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.element,
};

LogglyProvider.defaultProps = {
  token: null,
  logFromConsole: false,
  tags: [],
  children: null,
  logToConsole: false,
};

export default LogglyProvider;
