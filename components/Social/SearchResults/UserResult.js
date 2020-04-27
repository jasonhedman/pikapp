import React from "react";
import { TouchableOpacity } from "react-native";
import { withTheme, Text } from "react-native-paper";

import { Block } from "galio-framework";
import firebase from "firebase";
import ProfilePic from "../../Utility/ProfilePic";
import FollowButton from "../../Utility/FollowButton";

class UserResult extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.user.followers === undefined) {
      console.log(this.props.user.name);
    }
    this.state = {
      // following: this.props.user.followers.includes(
      //   firebase.auth().currentUser.uid
      // ),
    };
  }

  follow = () => {};

  unfollow = () => {};

  render() {
    const colors = this.props.theme.colors;
    return (
      <TouchableOpacity
        onPress={() =>
          this.props.navigate("UserProfile", { userId: this.props.user.id })
        }
        style={{ width: "100%" }}
      >
        <Block
          row
          center
          style={{
            borderColor: colors.orange,
            borderWidth: 1,
            borderRadius: 8,
            padding: 8,
            width: "100%",
            marginBottom: 10,
          }}
        >
          <ProfilePic proPicUrl={this.props.user.proPicUrl} size={35} />
          <Block flex column style={{ marginLeft: 8 }}>
            <Text style={{ color: "#fff" }}>{this.props.user.name}</Text>
            <Text style={{ color: "#fff" }}>@{this.props.user.username}</Text>
          </Block>
          <Block>
            <FollowButton user={this.props.user} />
          </Block>
        </Block>
      </TouchableOpacity>
    );
  }
}

export default withTheme(UserResult);
