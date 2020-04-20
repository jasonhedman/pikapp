import React from "react";
import PropTypes from "prop-types";
import * as firebase from "firebase";

import AuthenticatedUserContext from "./AuthenticatedUserContext";
import trace from "../../services/trace";

class AuthenticatedUserProvider extends React.Component {
  constructor(props) {
    super(props);
    trace(this, "create component", "constructor");

    this.unsubscribe = null;

    this.state = {
      currentUserId: this.props.currentUserId,
      currentUser: firebase.auth().currentUser,
      currentUserProfile: null,
    };
    trace(
      this,
      `current user guid: ${this.props.currentUserId}`,
      "constructor"
    );
  }

  asyncUserSnapshot() {
    if (this.unsubscribe) {
      trace(
        this,
        "unsubscribe old user snapshot listener",
        "asyncUserSnapshot"
      );
      this.unsubscribe();
    }

    const unsubscribe = firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((userProfile) => {
        trace(
          this,
          "received user snapshot - update user profile",
          "asyncUserSnapshot"
        );
        const newUserProfile = userProfile.data();
        this.setState({ currentUserProfile: newUserProfile });
      });

    this.unsubscribe = unsubscribe;
  }

  componentDidMount() {
    trace(this, "component mounted", "componentDidMount");
    trace(this, "setup user snapshot", "componentDidMount");
    this.asyncUserSnapshot();
  }

  // called when new props are delivered before a render. compare the saved gameHistory with the
  // current user game history. If they differ, then need to re-load the last 3 before drawing
  // so set the data to null (so there's no data). Then when compoentDidUpdate() is called, it'll
  // reload the data as necessary.
  static getDerivedStateFromProps(props, state) {
    if (props.currentUserId !== state.currentUserId) {
      trace(this, "user id changed", "getDerivedStateFromProps");
      return {
        currentUserId: props.currentUserId,
        currentUserProfile: null,
      };
    }
    // No state update necessary
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.currentUserProfile === null) {
      trace(this, "reload user because id changed", "componentDidUpdate");
      this.asyncUserSnapshot();
    }
  }

  componentWillUnmount() {
    trace(this, "unmount component", "componentWillUnmount");
    if (this.unsubscribe) {
      trace(this, "unsubscribe user snapshot listener", "componentWillUnmount");
      this.unsubscribe();
    }
  }

  render() {
    trace(this, "render component", "render");
    const contextValue = {
      currentUserId: this.state.currentUserId,
      currentUser: this.state.currentUser,
      currentUserProfile: this.state.currentUserProfile,
    };

    if (this.state.currentUserProfile) {
      return (
        <AuthenticatedUserContext.Provider value={contextValue}>
          {this.props.children}
        </AuthenticatedUserContext.Provider>
      );
    } else {
      // return nothing until currentUserProfile is set to something
      return (
        <AuthenticatedUserContext.Provider></AuthenticatedUserContext.Provider>
      );
    }
  }
}

// identify "required" props for the component
AuthenticatedUserProvider.propTypes = {
  currentUserId: PropTypes.string,
  children: PropTypes.element,
};

// set up default values for the required props
AuthenticatedUserProvider.defaultProps = {
  currentUserId: null,
  children: null,
};

export default AuthenticatedUserProvider;
