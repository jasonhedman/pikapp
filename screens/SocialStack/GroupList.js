import React from "react";
import { SafeAreaView } from "react-native";
import { Block } from "galio-framework";
import firebase from "firebase";

import { withTheme } from "react-native-paper";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";
import trace from "../../services/trace";

import GroupPreview from "../../components/Groups/GroupPreview";

class GroupList extends React.Component {
  constructor(props) {
    super(props);

    trace(this, "construct component", "constructor");
    this.state = {
      groups: new Array(),
    };
  }

  componentDidMount() {
    trace(this, "get group from user profile", "componentDidMount");
    const groupIds = this.props._currentUserProfile.groups;

    Promise.all(
      groupIds.map((groupId) => {
        return firebase
          .firestore()
          .collection("groups")
          .doc(groupId)
          .get()
          .then((group) => {
            return group.data();
          });
      })
    ).then((groups) => {
      trace(this, "set groups state", "componentDidMount");
      this.setState({ groups: groups });
    });
  }

  render() {
    trace(this, "render component", "render");
    const colors = this.props.theme.colors;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.dBlue }}>
        <Block flex style={{ padding: 16 }}>
          {this.state.groups.map((group, index) => {
            return (
              <GroupPreview
                key={index}
                group={group}
                navigate={this.props.navigation.navigate}
              />
            );
          })}
        </Block>
      </SafeAreaView>
    );
  }
}

export default withTheme(withAuthenticatedUser(GroupList));
