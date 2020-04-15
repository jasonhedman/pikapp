import React from "react";
import LogglyContext from "./LogglyContext";

// This is a HOC (React High Order Component) that wraps an export such that it
// has a logger extracted from the context so that it isn't passed around all over
// the place (a cross cutting concern).  All it does is extract the logger and
// present it as a regular prop.
function withLogging(WrappedComponent) {
  return class extends React.Component {
    // static contextType = LogglyContext;

    constructor(props) {
      super(props);
    }

    render() {
      return (
        <LogglyContext.Consumer>
          {(value) => (
            <WrappedComponent _logger={value.logger} {...this.props} />
          )}
        </LogglyContext.Consumer>
      );
    }
  };
}

export default withLogging;
