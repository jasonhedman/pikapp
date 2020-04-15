import React from "react";
import {
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Block } from "galio-framework";
import { TabView, TabBar } from "react-native-tab-view";
import {
  withTheme,
  TextInput,
  Text,
  ActivityIndicator,
  Subheading,
} from "react-native-paper";
import { getDistance } from "geolib";
import HeaderBlock from "../../components/Utility/HeaderBlock";

import NearbyUsers from "../../components/Utility/NearbyUsers";
import FriendsList from "../../components/Utility/FriendsList";
import MutualFriends from "../../components/Utility/MutualFriends";

import * as firebase from "firebase";
import "firebase/firestore";

const { height, width } = Dimensions.get("window");

class SearchPlayers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      users: new Array(),
      filteredUsers: new Array(),
      user: {},
      index: 0,
      routes: [
        { key: "friends", title: "Friends" },
        { key: "nearby", title: "Nearby" },
        { key: "mutual", title: "Mutual" },
      ],
    };
  }

  componentDidMount() {
    firebase
      .firestore()
      .collection("users")
      .get()
      .then((allUsers) => {
        let users = [];
        allUsers.forEach((user) => {
          if (user.id == firebase.auth().currentUser.uid) {
            this.setState({ user: user.data() });
          } else {
            users.push(user.data());
          }
        });
        this.setState({ users });
      });
  }

  onSearch = (search) => {
    let filteredUsers = this.state.users.filter((user) => {
      return user.username.includes(search.toLowerCase());
    });
    filteredUsers.sort((a, b) => {
      return (
        a.username.indexOf(search.toLowerCase()) -
        b.username.indexOf(search.toLowerCase())
      );
    });
    this.setState({ search, filteredUsers });
  };

  navToUserProfile = (user) => {
    if (user.id != firebase.auth().currentUser.uid) {
      this.props.navigation.navigate("UserProfile", { userId: user.id });
    } else {
      this.props.navigation.navigate("ProfileStack");
    }
  };

  onIndexChange = (index) => this.setState({ index });

  renderScene = ({ route }) => {
    switch (route.key) {
      case "nearby":
        return <NearbyUsers onPress={this.navToUserProfile} />;
      case "friends":
        return <FriendsList onPress={this.navToUserProfile} />;
      case "mutual":
        return <MutualFriends onPress={this.navToUserProfile} />;
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
      <>
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          height={height}
          width={width}
        >
          <Block
            column
            flex
            style={{
              backgroundColor: colors.dBlue,
              padding: 16,
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
                <ScrollView style={{ width: "100%" }}>
                  {this.state.filteredUsers.map((user, key) => {
                    return (
                      <TouchableOpacity
                        onPress={() => this.navToUserProfile(user)}
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
              ) : (
                <TabView
                  navigationState={this.state}
                  renderScene={this.renderScene}
                  renderTabBar={this.renderTabBar}
                  onIndexChange={this.onIndexChange}
                  sceneContainerStyle={{ paddingVertical: 8 }}
                />
              )}
            </Block>
          </Block>
        </TouchableWithoutFeedback>
      </>
    );
  }
}

export default withTheme(SearchPlayers);
