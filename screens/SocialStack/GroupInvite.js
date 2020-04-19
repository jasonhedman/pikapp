import React from "react";
import {
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Block } from "galio-framework";
import { TabView, TabBar } from "react-native-tab-view";
import { withTheme, TextInput, Text, Subheading } from "react-native-paper";
import { getDistance } from "geolib";
const moment = require("moment");

import * as firebase from "firebase";
import "firebase/firestore";
import NearbyUsers from "../../components/Utility/NearbyUsers";
import FriendsList from "../../components/Utility/FriendsList";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";

class GroupInvite extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      users: new Array(),
      filteredUsers: new Array(),
      notifications: new Array(),
      visible: false,
      focusUser: null,
      user: {},
      mutualFriends: [],
      mutualFriendsLoaded: false,
      nearbyComplete: false,
      nearby: {},
      nearbySortedKeys: new Array(),
      index: 0,
      routes: [
        { key: "friends", title: "Friends" },
        { key: "nearby", title: "Nearby" },
      ],
    };
  }

  componentDidMount() {
    let currentUser;
    firebase
      .firestore()
      .collection("users")
      .get()
      .then((allUsers) => {
        let users = {};
        allUsers.forEach((user) => {
          if (user.id != firebase.auth().currentUser.uid) {
            users[user.id] = user.data();
          }
        });
        this.setState({ users, complete: true });
        return users;
      })
  }

  onSearch = (search) => {
    let filteredUsers = Object.keys(this.state.users).filter((user) => {
      return this.state.users[user].username.includes(search.toLowerCase());
    });
    filteredUsers.sort((a, b) => {
      return (
        this.state.users[a].username.indexOf(search.toLowerCase()) -
        this.state.users[b].username.indexOf(search.toLowerCase())
      );
    });
    this.setState({ search, filteredUsers });
  };

  openModal = () => {
    this.setState({ visible: true });
  };

  closeModal = () => {
    this.setState({ visible: false });
  };

  onUserPress = (user) => {
    this.setState({ focusUser: user, visible: true });
  };

  navToUserProfile = (id) => {
    if (id != firebase.auth().currentUser.uid) {
      this.props.navigation.navigate("UserProfile", { userId: id });
    } else {
      this.props.navigation.navigate("ProfileStack");
    }
  };

  onIndexChange = (index) => this.setState({ index });

  renderScene = ({ route }) => {
    switch (route.key) {
      case "nearby":
        return <NearbyUsers onPress={this.invite} />;
      case "friends":
        return <FriendsList onPress={this.invite} />;
      default:
        return null;
    }
  };

  renderTabBar = (props) => {
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

  invite = (user) => {
    Promise.all([
      firebase.firestore().collection("notifications").add({
        type: "groupInvite",
        group: this.props.route.params.group,
        from: this.props._currentUserProfile,
        to: user,
        time: moment().toDate(),
      }),
      firebase
        .firestore()
        .collection("users")
        .doc(user.id)
        .collection("groupInvitations")
        .add({
          group: this.props.route.params.group,
          from: this.props._currentUserProfile,
          time: new Date(),
        }),
      firebase
        .firestore()
        .collection("groups")
        .doc(this.props.route.params.group.id)
        .update({
          invites: firebase.firestore.FieldValue.arrayUnion(user.id),
        }),
    ]);
  };

  render() {
    const colors = this.props.theme.colors;
    return (
      <>
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          style={{ flex: 1 }}
        >
          <Block
            column
            flex
            style={{
              backgroundColor: colors.dBlue,
              paddingHorizontal: 16,
            }}
          >
            <TextInput
              mode={"outlined"}
              theme={{
                colors: {
                  text: colors.white,
                  placeholder: colors.white,
                  underlineColor: colors.orange,
                  selectionColor: colors.orange,
                  primary: colors.orange,
                },
              }}
              placeholder={"Search By Username..."}
              onChangeText={this.onSearch}
              value={this.state.search}
              style={{ marginBottom: 16 }}
            />
            <Block flex>
              {this.state.search != "" ? (
                <>
                  <Subheading
                    style={{
                      color: colors.white,
                      textAlign: "center",
                      marginBottom: 16,
                    }}
                  >
                    Search Results
                  </Subheading>
                  <ScrollView style={{ width: "100%" }}>
                    {this.state.filteredUsers.map((userId, key) => {
                      let user = this.state.users[userId];
                      return (
                        <TouchableOpacity
                          onPress={() => this.invite(user)}
                          key={key}
                          style={{ width: "100%" }}
                        >
                          <Block
                            row
                            middle
                            style={{
                              justifyContent: "space-between",
                              borderColor: colors.orange,
                              borderWidth: 1,
                              borderRadius: 8,
                              padding: 10,
                              marginBottom: 10,
                            }}
                          >
                            <Block column>
                              <Text style={{ color: "#fff" }}>{user.name}</Text>
                              <Text style={{ color: "#fff" }}>
                                @{user.username}
                              </Text>
                            </Block>
                            <Text style={{ color: "#fff" }}>{`${
                              user.points
                            } point${user.points == 1 ? "" : "s"}`}</Text>
                          </Block>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </>
              ) : (
                <>
                  <TabView
                    navigationState={this.state}
                    renderScene={this.renderScene}
                    renderTabBar={this.renderTabBar}
                    onIndexChange={this.onIndexChange}
                    sceneContainerStyle={{ paddingVertical: 8 }}
                  />
                </>
              )}
            </Block>
          </Block>
        </TouchableWithoutFeedback>
      </>
    );
  }
}

export default withTheme(withAuthenticatedUser(GroupInvite));
