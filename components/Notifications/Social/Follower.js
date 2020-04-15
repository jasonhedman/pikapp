import React from "react";
import { TouchableHighlight, Dimensions, TouchableOpacity } from "react-native";
import { Block } from "galio-framework";
import { withTheme, Text, Button } from "react-native-paper";
import firebase from "firebase";
import "firebase/firestore";
import moment from "moment";
import FollowButton from "../../Utility/FollowButton";

const { height, width } = Dimensions.get("window");

class Follower extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      follower: {},
      complete: false,
    };
  }

  componentDidMount = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(this.props.follower.id)
      .onSnapshot(follower => {
        this.setState({ follower: follower.data(), complete: true });
      });
  };

  render() {
    const colors = this.props.theme.colors;
    if (this.state.complete) {
      return (
        <TouchableOpacity onPress={() => {this.props.navigate('UserProfile', {userId: this.state.follower.id})}}>
          <Block
            style={{
              borderWidth: 1,
              borderColor: colors.grey,
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 8,
              marginBottom: 8,
            }}
          >
            <Block row middle style={{ justifyContent: "space-between" }}>
              <Block flex>
                <Text>
                  <Text style={{ color: colors.white }}>
                    @{this.state.follower.username}
                  </Text>
                  <Text style={{ color: colors.grey }}> started following you.</Text>
                </Text>
              </Block>
              <Block row>
                <FollowButton
                  user={this.state.follower}
                  currentUser={this.props.currentUser}
                />
              </Block>
            </Block>
          </Block>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  }
}

export default withTheme(Follower);
