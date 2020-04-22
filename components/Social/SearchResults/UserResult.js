import React from "react";
import {
  TouchableOpacity,
} from "react-native";
import { withTheme, Text } from "react-native-paper";

import { Block } from "galio-framework";
import "firebase/firestore";
import ProfilePic from "../../Utility/ProfilePic";

class UserResult extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const colors = this.props.theme.colors;
    return (
      <TouchableOpacity
        onPress={() => this.props.navigate("UserProfile", { userId: this.props.user.id })}
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
          <Block column style={{ marginLeft: 8 }}>
            <Text style={{ color: "#fff" }}>{this.props.user.name}</Text>
            <Text style={{ color: "#fff" }}>@{this.props.user.username}</Text>
          </Block>
        </Block>
      </TouchableOpacity>
    );
  }
}

export default withTheme(UserResult);
