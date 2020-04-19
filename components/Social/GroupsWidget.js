import React from "react";
import { TouchableOpacity } from "react-native";
import { Block } from "galio-framework";
import firebase from "firebase";

import { withTheme, Text, Button } from "react-native-paper";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";
import withLogging from "../../contexts/loggingContext/withLogging";

import GroupPreview from "../Groups/GroupPreview";

class GroupsWidget extends React.Component {
  constructor(props) {
    super(props);

    this.props._trace(this, "construct component", "constructor");
    this.state = {
      groups: new Array(),
    };
  }

  componentDidMount() {
    this.props._trace(this, "get group from user profile", "componentDidMount");
    const groupIds = [];
    for (
      let i = this.props._currentUserProfile.groups.length - 1;
      i >= Math.max(this.props._currentUserProfile.groups.length - 3, 0);
      i--
    ) {
      groupIds.push(this.props._currentUserProfile.groups[i]);
    }
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
      this.props._trace(this, "set groups state", "componentDidMount");
      this.setState({ groups: groups });
    });
  }

  render() {
    this.props._trace(this, "render component", "render");
    const colors = this.props.theme.colors;
    return (
      <Block style={{ marginTop: 16 }}>
        <TouchableOpacity onPress={() => this.props.navigate("GroupList")}>
          <Text
            style={{
              color: "white",
              fontFamily: "ralewayBold",
              marginBottom: 4,
            }}
          >
            Your Groups ►
          </Text>
        </TouchableOpacity>
        {this.state.groups.map((group, index) => {
          return (
            <GroupPreview
              key={index}
              group={group}
              navigate={this.props.navigate}
            />
          );
        })}
        <Block middle>
          <TouchableOpacity
            style={{ padding: 4 }}
            onPress={() => this.props.navigate("GroupList")}
          >
            <Text
              style={{
                color: colors.orange,
                fontFamily: "ralewayBold",
                marginBottom: 4,
              }}
            >
              See More
            </Text>
          </TouchableOpacity>
        </Block>
      </Block>
    );
  }
}

export default withLogging(withTheme(withAuthenticatedUser(GroupsWidget)));
