import React from "react";
import { FlatList, Dimensions } from "react-native";
import { withTheme, Text, ActivityIndicator } from "react-native-paper";
import { getDistance } from "geolib";

import { Block } from "galio-framework";
const { height, width } = Dimensions.get("screen");
import * as firebase from "firebase";
import "firebase/firestore";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";
import UserPreview from "./UserPreview";
import NoResults from "../Utility/NoResults";

class MutualFriendsWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mutualFriends: new Array(),
      mutualFriendsComplete: false,
    };
  }

  componentDidMount() {
    let findMutualFriends = firebase
      .functions()
      .httpsCallable("findMutualFriends");
    findMutualFriends({
      user: this.props._currentUserProfile,
      id: this.props._currentUserProfile.id,
    }).then((result) => {
      this.setState({
        mutualFriends: result.data,
        mutualFriendsComplete: true,
      });
    });
  }

  render() {
    const colors = this.props.theme.colors;
    return (
      <Block style={{ marginTop: 4 }}>
        <Text
          style={{ color: "white", fontFamily: "ralewayBold", marginBottom: 4 }}
        >
          Mutual Friends
        </Text>
        {this.state.mutualFriendsComplete ? (
          this.state.mutualFriends.length > 0 ? (
            <FlatList
              data={this.state.mutualFriends}
              renderItem={({ item, index }) => (
                <UserPreview
                  user={item}
                  navToUserProfile={this.props.navToUserProfile}
                />
              )}
              keyExtractor={(item) => item.id}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={{ width, marginLeft: -8 }}
            />
          ) : (
            <NoResults users={true} border={true} />
          )
        ) : (
          <ActivityIndicator
            animating={true}
            color={this.props.theme.colors.orange}
            size={"small"}
          />
        )}
      </Block>
    );
  }
}

export default withTheme(withAuthenticatedUser(MutualFriendsWidget));
