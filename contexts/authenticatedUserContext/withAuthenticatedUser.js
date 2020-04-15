import React from "react";
import AuthenticatedUserContext from "./AuthenticatedUserContext";

// This is a HOC (React High Order Component) that wraps an export such that it
// takes the component argument and "wraps" it in the context consumer. The context
// consume exposes the context "value" through the function inside the consumer.
// NOTE: The thing insidet he Consumer is NOT an element. It is a function.
// the function generates the wrapped component and injects props for the context bits.
function withAuthenticatedUser(WrappedComponent) {
  return class extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      return (
        <AuthenticatedUserContext.Consumer>
          {(value) => (
            <WrappedComponent
              _currentUserId={value.currentUserId}
              _currentUser={value.currentUser}
              _currentUserProfile={value.currentUserProfile}
              {...this.props}
            />
          )}
        </AuthenticatedUserContext.Consumer>
      );
    }
  };
}

export default withAuthenticatedUser;
