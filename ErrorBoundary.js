import React from "react";

import FallbackComponent from "./FallbackComponent";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, hasError: false };
  }

  static defaultProps = {
    FallbackComponent: FallbackComponent,
  };

  static getDerivedStateFromError(error) {
    return { error, hasError: true };
  }

  componentDidCatch(error, info) {
    if (typeof this.props.onError === "function") {
      this.props.onError.call(this, error, info.componentStack);
    }
  }

  resetError = () => {
    this.setState({ error: null, hasError: false });
  };

  render() {
    const { FallbackComponent } = this.props;

    return this.state.hasError ? (
      <FallbackComponent
        error={this.state.error}
        resetError={this.resetError}
      />
    ) : (
      this.props.children
    );
  }
}

export default ErrorBoundary;
