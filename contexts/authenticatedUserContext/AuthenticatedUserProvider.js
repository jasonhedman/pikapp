import React from "react";
import PropTypes from "prop-types";
import * as firebase from "firebase";

import AuthenticatedUserContext from "./AuthenticatedUserContext";

class AuthenticatedUserProvider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUserId: props.currentUserId,
      currentUser: firebase.auth().currentUser,
      currentUserProfile: null,
    };

    console.log("**** setup profile");
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((userProfile) => {
        console.log("**** got user data");
        const newUserProfile = userProfile.data();
        newUserProfile.id = userProfile.id;         // EJH: Verify this. taken from something jason did. is id not in profile? perhaps not.
          this.setState({ currentUserProfile: newUserProfile });
      });
  }

  render() {
    console.log("render user provider");
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

export default AuthenticatedUserProvider;
