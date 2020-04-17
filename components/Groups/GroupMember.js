import React from "react";
import { StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { Block } from "galio-framework";
import * as firebase from "firebase";
import { withTheme, Text, IconButton } from "react-native-paper";
import ProfilePic from "../Utility/ProfilePic";
import FollowButton from "../Utility/FollowButton";

class GroupMember extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      proPicUrl: null,
      complete: false,
      visible: false,
    };
  }

  componentDidMount() {
    firebase
      .firestore()
      .collection("users")
      .doc(this.props.user)
      .onSnapshot((user) => {
        this.setState({ user: user.data(), complete: true });
      });
  }

  render() {
    let colors = this.props.theme.colors;
    if (this.state.complete != false) {
      return (
        <TouchableOpacity
          onPress={() => {
            if (this.props.user != firebase.auth().currentUser.uid) {
              this.props.navToUserProfile(this.state.user.id);
            }
          }}
        >
          <Block row middle style={styles.container}>
            <Block flex row middle>
              <ProfilePic
                size={40}
                addEnabled={false}
                proPicUrl={this.props.picture}
              />
              <Block flex column style={{ marginLeft: 12 }}>
                <Text style={{ color: "#FFF" }}>{this.state.user.name}</Text>
                <Text style={{ color: "#FFF" }}>
                  @{this.state.user.username}
                </Text>
                <Text style={{ color: colors.grey }}>
                  {this.props.group.owner == this.props.user
                    ? "Owner"
                    : this.props.group.coOwners.includes(this.props.user)
                    ? "Co-Owner"
                    : this.props.group.admins.includes(this.props.user)
                    ? "Admin"
                    : "Member"}
                </Text>
              </Block>
            </Block>

            {this.props.user != firebase.auth().currentUser.uid ? (
              <Block row middle>
                <IconButton
                  icon="dots-horizontal"
                  color="white"
                  onPress={() => this.props.openActionsModal(this.state.user)}
                />
                <FollowButton
                  user={this.state.user}
                  followers={this.state.user.followers}
                  currentUser={this.props.currentUser}
                />
              </Block>
            ) : null}
          </Block>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#E68A54",
    padding: 8,
    marginBottom: 8,
    width: "100%",
  },
  containerAvailable: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#FFF",
    padding: 16,
    marginBottom: 8,
    width: "100%",
  },
});

export default withTheme(GroupMember);
