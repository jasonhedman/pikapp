import React from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Block } from "galio-framework";

const { width, height } = Dimensions.get("window");

import * as firebase from "firebase";
import "firebase/firestore";

import {
  withTheme,
  Button,
  Headline,
  Subheading,
  Text,
} from "react-native-paper";
import ProfilePic from "../../components/Utility/ProfilePic";
import HeaderBlock from "../../components/Utility/HeaderBlock";
import ButtonBlock from "../../components/Utility/ButtonBlock";
import SportsBreakdown from "../../components/Profile/SportsBreakdown";

class UserProfile extends React.Component {
  constructor() {
    super();
    this.state = {
      user: {},
      lastThree: new Array(),
      complete: false,
      editModalVisible: false,
      loading: false,
      settingsVisible: false,
      error: false,
      currentUser: {},
      followedBy: [],
      followedByComplete: false,
    };
  }

  getFollowing = (followers) => {
    return followers.includes(firebase.auth().currentUser.uid);
  };

  setFollowedBy = (currentUserFollowing, userFollowers) => {
    let ids = currentUserFollowing.filter((value) =>
      userFollowers.includes(value)
    );
    if (ids.length == 0) {
      return;
    } else if (ids.length > 3) {
      Promise.all([
        firebase
          .firestore()
          .collection("users")
          .doc(ids[0])
          .get()
          .then((user) => {
            return user.data().username;
          }),
        firebase
          .firestore()
          .collection("users")
          .doc(ids[1])
          .get()
          .then((user) => {
            return user.data().username;
          }),
      ]).then((followedBy) => {
        followedBy.push(`${ids.length - 2} others`);
        this.setState({ followedBy, followedByComplete: true });
      });
    } else {
      Promise.all(
        ids.map((id, index) => {
          return firebase
            .firestore()
            .collection("users")
            .doc(id)
            .get()
            .then((user) => {
              return user.data().username;
            });
        })
      ).then((followedBy) => {
        this.setState({ followedBy, followedByComplete: true });
      });
    }
  };

  componentDidMount() {
    Promise.all([
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .get()
        .then((user) => {
          this.setState({
            currentUser: user.data(),
          });
          return user.data();
        }),
      firebase
        .firestore()
        .collection("users")
        .doc(this.props.route.params.userId)
        .get()
        .then((doc) => {
          this.props.navigation.setOptions({
            title: `${doc.data().username}`,
          });
          let following = this.getFollowing(doc.data().followers);
          let lastThree = [];
          for (
            let i = doc.data().gameHistory.length - 1;
            i >=
            (doc.data().gameHistory.length >= 3
              ? doc.data().gameHistory.length - 3
              : 0);
            i--
          ) {
            lastThree.push(
              firebase
                .firestore()
                .collection("games")
                .doc(doc.data().gameHistory[i])
                .get()
                .then((game) => {
                  return game.data();
                })
            );
          }
          Promise.all(lastThree).then((games) => {
            this.setState({
              lastThree: games,
              user: doc.data(),
              following,
              complete: true,
            });
          });
          return doc.data();
        }),
    ]).then(data => {
      this.setFollowedBy(data[0].friendsList, data[1].followers);
    });
  }

  addFriend = () => {
    let user = this.state.user;
    user.followers.push(firebase.auth().currentUser.uid);
    this.setState({ user, following: true }, () => {
      Promise.all([
        firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({
            friendsList: firebase.firestore.FieldValue.arrayUnion(
              this.props.route.params.userId
            ),
          }),
        firebase
          .firestore()
          .collection("users")
          .doc(this.props.route.params.userId)
          .update({
            followers: firebase.firestore.FieldValue.arrayUnion(
              firebase.auth().currentUser.uid
            ),
          }),
        firebase.firestore().collection("notifications").add({
          type: "follower",
          from: this.state.currentUser,
          to: this.state.user,
          time: new Date(),
        }),
        firebase
          .firestore()
          .collection("users")
          .doc(this.props.route.params.userId)
          .collection("social")
          .add({
            type: "follower",
            from: this.state.currentUser,
            to: this.state.user,
            time: new Date(),
          }),
      ]);
    });
  };

  removeFriend = () => {
    this.setState({ following: false }, () => {
      let user = this.state.user;
      user.followers = user.followers.filter(
        (friend) => friend != firebase.auth().currentUser.uid
      );
      this.setState({ user }, () => {
        firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({
            friendsList: firebase.firestore.FieldValue.arrayRemove(
              this.props.route.params.userId
            ),
          });
        firebase
          .firestore()
          .collection("users")
          .doc(this.props.route.params.userId)
          .update({
            followers: firebase.firestore.FieldValue.arrayRemove(
              firebase.auth().currentUser.uid
            ),
          });
      });
    });
  };

  navToUserProfile = (id) => {
    if (id != firebase.auth().currentUser.uid) {
      this.props.navigation.push("UserProfile", { userId: id });
    } else {
      this.props.navigation.navigate("Profile");
    }
  };

  navToUserList = (users, listType) => {
    this.props.navigation.push("UserList", { users, listType });
  };

  render() {
    const colors = this.props.theme.colors;
    if (this.state.complete) {
      if (!this.state.error) {
        return (
          <SafeAreaView style={{ backgroundColor: colors.dBlue, flex: 1 }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                backgroundColor: colors.dBlue,
                paddingHorizontal: 16,
              }}
              snapToStart={false}
            >
              <Block middle style={{ marginBottom: 12 }}>
                <Block 
                  row 
                  middle 
                  style={{ marginBottom: 8 }}
                >
                  <ProfilePic size={80} proPicUrl={this.state.user.proPicUrl} />
                  <Block
                    row
                    flex
                    center
                    style={{
                      justifyContent: "space-around",
                      paddingRight: 32,
                      paddingLeft: 32,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        this.navToUserList(
                          this.state.user.followers,
                          "Followers"
                        )
                      }
                    >
                      <Block column center middle>
                        <Subheading style={styles.subheading}>
                          Followers
                        </Subheading>
                        <Headline style={styles.stat}>
                          {this.state.user.followers.length}
                        </Headline>
                      </Block>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        this.navToUserList(
                          this.state.user.friendsList,
                          "Following"
                        )
                      }
                    >
                      <Block column center middle>
                        <Subheading style={styles.subheading}>
                          Following
                        </Subheading>
                        <Headline style={styles.stat}>
                          {this.state.user.friendsList.length}
                        </Headline>
                      </Block>
                    </TouchableOpacity>
                  </Block>
                </Block>
                <Block style={{ marginBottom: 12, width: "100%" }}>
                  <Text
                    style={{
                      color: "white",
                      fontFamily: "raleway",
                      fontSize: 14,
                    }}
                  >
                    {this.state.user.name}
                  </Text>
                  {this.state.followedByComplete ? (
                    <Text style={{ fontSize: 12, marginTop: 4 }}>
                      <Text style={{ color: colors.grey }}>Followed by </Text>
                      {this.state.followedBy.map((userId, index) => {
                        return (
                          <>
                            {index == this.state.followedBy.length - 1 &&
                            this.state.followedBy.length > 1 ? (
                              <Text key="and" style={{ color: colors.grey }}>
                                and{" "}
                              </Text>
                            ) : null}
                            <Text key={index} style={{ color: colors.white }}>
                              {userId}
                              {this.state.followedBy.length > 2 &&
                              index != this.state.followedBy.length - 1
                                ? ", "
                                : " "}
                            </Text>
                          </>
                        );
                      })}
                    </Text>
                  ) : null}
                </Block>
                <Block row style={{ marginBottom: 12 }}>
                  {this.state.following ? (
                    <Button
                      mode="contained"
                      onPress={this.removeFriend}
                      dark={true}
                      style={[styles.button, { borderColor: colors.white }]}
                      contentStyle={{}}
                      theme={{
                        colors: { primary: colors.dBlue },
                        fonts: { medium: this.props.theme.fonts.regular },
                      }}
                      uppercase={false}
                    >
                      Following
                    </Button>
                  ) : (
                    <Button
                      mode="contained"
                      onPress={this.addFriend}
                      dark={true}
                      style={[styles.button, { borderColor: colors.orange }]}
                      contentStyle={{}}
                      theme={{
                        colors: { primary: colors.orange },
                        fonts: { medium: this.props.theme.fonts.regular },
                      }}
                      uppercase={false}
                    >
                      Follow
                    </Button>
                  )}
                </Block>
                <Block row style={{ justifyContent: "space-between" }}>
                  <Block
                    style={[styles.statContainer, { marginRight: 8 }]}
                    column
                    center
                    middle
                  >
                    <Subheading style={styles.subheading}>
                      Games Played
                    </Subheading>
                    <Headline
                      style={styles.info}
                    >{`${this.state.user.gamesPlayed}`}</Headline>
                  </Block>
                  <Block
                    style={[styles.statContainer, { marginLeft: 8 }]}
                    column
                    center
                    middle
                  >
                    <Subheading style={styles.subheading}>Points</Subheading>
                    <Headline style={styles.info}>
                      {this.state.user.points}
                    </Headline>
                  </Block>
                </Block>
              </Block>
              <Headline
                style={[
                  styles.header,
                  { marginBottom: 12, textAlign: "center" },
                ]}
              >
                Sports
              </Headline>
              <SportsBreakdown user={this.state.user} />
            </ScrollView>
          </SafeAreaView>
        );
      } else {
        return (
          <Block
            flex
            center
            middle
            style={{ backgroundColor: colors.dBlue, width: width, padding: 16 }}
          >
            <Block
              center
              style={{
                borderWidth: 1,
                borderColor: colors.orange,
                borderRadius: 8,
                padding: 16,
                width: "100%",
              }}
            >
              <HeaderBlock
                text="User does not exist."
                backButton={true}
                backPress={() => this.props.navigation.goBack()}
              />
              <ButtonBlock
                text="Go Back"
                onPress={() => this.props.navigation.goBack()}
              />
            </Block>
          </Block>
        );
      }
    } else {
      return <Block flex style={{ backgroundColor: colors.dBlue }}></Block>;
    }
  }
}
const styles = StyleSheet.create({
  header: {
    color: "white",
    fontSize: 20,
  },
  button: {
    flex: 1,
    borderWidth: 1,
  },
  modalButton: {
    marginBottom: 12,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  statContainer: {
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
    borderColor: "#E68A54",
    padding: 8,
  },
  subheading: {
    color: "#83838A",
    fontSize: 14,
    marginTop: 0,
  },
  stat: {
    color: "white",
  },
  info: {
    color: "white",
    fontSize: 35,
    paddingTop: 5,
  },
});

export default withTheme(UserProfile);
