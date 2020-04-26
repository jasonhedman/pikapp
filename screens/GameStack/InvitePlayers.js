import React from "react";

import {
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import NearbyUsers from "../../components/Utility/NearbyUsers";
import FriendsList from "../../components/Utility/FriendsList";
import MutualFriends from "../../components/Utility/MutualFriends";
import { Block } from "galio-framework";
import { TabView, TabBar } from "react-native-tab-view";
import * as firebase from "firebase";
require("firebase/functions");
import moment from "moment";
import * as geofirex from "geofirex";
const geo = geofirex.init(firebase);

import {
  withTheme,
  Text,
  Headline,
  Button,
  ActivityIndicator,
} from "react-native-paper";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";

const { height } = Dimensions.get("screen");

class InvitePlayers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: new Array(),
      nearby: new Array(),
      followingComplete: false,
      nearbyComplete: false,
      nearbySortedKeys: new Array(),
      friendsSortedKeys: new Array(),
      index: 0,
      routes: [
        { key: "friends", title: "Friends" },
        { key: "nearby", title: "Nearby" },
        { key: "mutual", title: "Mutual" },
      ],
    };
  }

  componentDidMount() {
    const query = geo
      .query(firebase.firestore().collection("users"))
      .within(this.props._currentUserProfile.location, 10, "location");
    this.subscription = query.subscribe((nearby) =>
      this.setState({ nearby, nearbyComplete: true })
    );
  }

  componentWillUnmount(){
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

  onPress = (user) => {
    firebase
      .firestore()
      .collection("notifications")
      .add({
        type: "invite",
        game: {
          sport: this.props.route.params.game.sport,
          location: this.props.route.params.game.location,
        },
        from: this.props._currentUserProfile,
        to: user,
        time: moment().toDate(),
        expire: moment
          .unix(parseInt(this.props.route.params.game.startTime.time.seconds))
          .add(1, "h")
          .toDate(),
      });
  };

  onIndexChange = (index) => this.setState({ index });

  renderScene = ({ route }) => {
    switch (route.key) {
      case "nearby":
        return <NearbyUsers onPress={this.onPress} />;
      case "friends":
        return <FriendsList onPress={this.onPress} />;
      case "mutual":
        return <MutualFriends onPress={this.onPress} />;
      default:
        return null;
    }
  };

  renderTabBar = (props) => {
    let colors = this.props.theme.colors;
    return (
      <TabBar
        {...props}
        renderLabel={({ route, focused, color }) => (
          <Text style={{ color }}>{route.title}</Text>
        )}
        activeColor={colors.orange}
        inactiveColor={colors.grey}
        indicatorStyle={{ backgroundColor: colors.orange }}
        style={{ backgroundColor: null }}
      />
    );
  };

  render() {
    const colors = this.props.theme.colors;
    return (
      <Block
        column
        flex
        style={{ backgroundColor: colors.dBlue, width: "100%", padding:8 }}
      >
        <TabView
          navigationState={this.state}
          renderScene={this.renderScene}
          renderTabBar={this.renderTabBar}
          onIndexChange={this.onIndexChange}
          sceneContainerStyle={{ paddingVertical: 8 }}
        />
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  scrollview: {
    width: "100%",
    maxHeight: height * 0.5,
    borderRadius: 8,
  },
});

export default withTheme(withAuthenticatedUser(InvitePlayers));
