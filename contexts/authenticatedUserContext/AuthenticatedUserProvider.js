import React from "react";
import PropTypes from "prop-types";
import * as firebase from "firebase";

import AuthenticatedUserContext from "./AuthenticatedUserContext";
import withLogging from "../loggingContext/withLogging";

class AuthenticatedUserProvider extends React.Component {
  constructor(props) {
    super(props);
    this.props._trace(this,"create component", "constructor");

    this.unsubscribe = null;

    this.state = {
      currentUserId: props.currentUserId,
      currentUser: firebase.auth().currentUser,
      currentUserProfile: null,
    };
    this.props._trace(this,`current user guid: ${props.currentUserId}`, "constructor");
  }

  componentDidMount() {
    this.props._trace(this,"component mounted", "componentDidMount");
    this.props._trace(this,"setup user snapshot", "componentDidMount");

    const unsubscribe = firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((userProfile) => {
        this.props._trace(this,"received user snapshot", "componentDidMount");
        const newUserProfile = userProfile.data();
        newUserProfile.id = userProfile.id; // EJH: Verify this. taken from something jason did. is id not in profile? perhaps not.
        this.setState({ currentUserProfile: newUserProfile });
      });
    this.unsubscribe = unsubscribe;
  }

  componentWillUnmount() {
    this.props._trace(this,"unmount component", "componentWillUnmount");
    if (this.unsubscribe) {
      this.props._trace(this,"unsubscribe user snapshot listener", "componentWillUnmount");
      this.unsubscribe();
    }
  }

  render() {
    this.props._trace(this,"render component", "render");
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
      return null;
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

export default withLogging(AuthenticatedUserProvider);
