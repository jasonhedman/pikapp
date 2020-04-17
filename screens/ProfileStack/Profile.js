import React from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  View,
  TouchableOpacity,
  Share,
  SafeAreaView,
} from "react-native";
import { Block } from "galio-framework";

import GameResult from "../../components/Profile/GameResult";
import SportsBreakdown from "../../components/Profile/SportsBreakdown";
import ProfilePic from "../../components/Utility/ProfilePic";
import SlideModal from "react-native-modal";

const { width } = Dimensions.get("window");

import * as firebase from "firebase";
import "firebase/firestore";
import onShare from "../../services/onShare";

import {
  withTheme,
  Button,
  Headline,
  Subheading,
  IconButton,
  Caption,
  Text,
  Portal,
  Modal,
} from "react-native-paper";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";

class Profile extends React.Component {
  constructor() {
    super();
    this.state = {
      user: {},
      lastThree: new Array(),
      complete: false,
      editModalVisible: false,
      loading: false,
      settingsVisible: false,
    };
  }

  componentDidMount() {
    let currentUserProfile = this.props._currentUserProfile;
    console.log(currentUserProfile);
        this.props.navigation.setOptions({
          title: `${currentUserProfile.username}`,
          headerRight: () => (
            <IconButton
              color={this.props.theme.colors.white}
              icon={"settings"}
              onPress={() => this.setState({ settingsVisible: true })}
              size={20}
            ></IconButton>
          ),
        });
        let lastThree = [];
        for (
          let i = currentUserProfile.gameHistory.length - 1;
          i >=
          (currentUserProfile.gameHistory.length >= 3
            ? currentUserProfile.gameHistory.length - 3
            : 0);
          i--
        ) {
          lastThree.push(
            firebase
              .firestore()
              .collection("games")
              .doc(currentUserProfile.gameHistory[i])
              .get()
              .then(game => {
                return game.data();
              })
          );
        }
        Promise.all(lastThree).then(games => {
          this.setState({
            lastThree: games,
            user: currentUserProfile,
            complete: true,
          });
        });
  }

  setImage = (proPicUrl, func) => {
    this.setState({ proPicUrl }, func);
  };

  signOut = () => {
    firebase.auth().signOut();
  };

  toChangePassword = () => {
    this.setState({ settingsVisible: false }, () => {
      this.props.navigation.navigate("ChangePassword");
    });
  };

  toChangeEmail = () => {
    this.setState({ settingsVisible: false }, () => {
      this.props.navigation.navigate("ChangeEmail");
    });
  };

  navToUserProfile = id => {
    if (id != firebase.auth().currentUser.uid) {
      this.props.navigation.navigate("UserProfile", { userId: id });
    } else {
      this.props.navigation.navigate("Profile");
    }
  };

  navToUserList = (users, listType) => {
    this.props.navigation.navigate("UserList", { users, listType });
  };

  render() {
    const colors = this.props.theme.colors;
    if (this.state.complete) {
      return (
        <>
          <SlideModal
            animationIn='slideInUp'
            transparent={true}
            isVisible={this.state.settingsVisible}
            onBackdropPress={() => this.setState({ settingsVisible: false })}
            style={{
              width,
              marginLeft: 0,
              padding: 0,
              marginBottom: 0,
              justifyContent: "flex-end",
              zIndex: 100,
            }}
            backdropColor={colors.dBlue}
            coverScreen={false}
          >
            <Block
              center
              middle
              style={{
                width,
                backgroundColor: colors.dBlue,
                borderTopWidth: 2,
                borderTopColor: colors.orange,
                alignItems: "center",
                padding: 16,
              }}
            >
              <Button
                mode='contained'
                dark={true}
                style={[styles.button]}
                onPress={this.toChangePassword}
                theme={{
                  colors: { primary: colors.orange },
                  fonts: { medium: this.props.theme.fonts.regular },
                }}
                uppercase={false}
              >
                Change Password
              </Button>
              <Button
                mode='contained'
                dark={true}
                style={[styles.button]}
                onPress={this.toChangeEmail}
                theme={{
                  colors: { primary: colors.orange },
                  fonts: { medium: this.props.theme.fonts.regular },
                }}
                uppercase={false}
              >
                Change Email
              </Button>
              <Button
                mode='text'
                dark={true}
                style={[
                  styles.button,
                  {
                    borderWidth: 0.5,
                    borderRadius: 8,
                    borderColor: colors.orange,
                    marginBottom: 0,
                  },
                ]}
                onPress={this.signOut}
                theme={{
                  colors: { primary: colors.orange },
                  fonts: { medium: this.props.theme.fonts.regular },
                }}
                uppercase={false}
              >
                Sign Out
              </Button>
            </Block>
          </SlideModal>
          <SafeAreaView style={{ backgroundColor: colors.dBlue, flex: 1 }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ backgroundColor: colors.dBlue, paddingHorizontal: 16 }}
              snapToStart={false}
            >
              <Block middle style={{ marginBottom: 12 }}>
                <Block row middle style={{ marginBottom: 8 }}>
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
                </Block>
                <Block row style={{ marginBottom: 12 }}>
                  <Button
                    mode='contained'
                    onPress={() =>
                      this.props.navigation.navigate("EditProfile")
                    }
                    dark={true}
                    style={[styles.button, { borderColor: colors.white, flex:1 }]}
                    contentStyle={{}}
                    theme={{
                      colors: { primary: colors.dBlue },
                      fonts: { medium: this.props.theme.fonts.regular },
                    }}
                    uppercase={false}
                  >
                    Edit Profile
                  </Button>
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
              <Headline
                style={[
                  styles.header,
                  { marginBottom: 12, textAlign: "center" },
                ]}
              >
                Last Three Games
              </Headline>
              {this.state.lastThree.length > 0 ? (
                <Block column>
                  {this.state.lastThree.map((game, index) => {
                    return (
                      <GameResult
                        game={game}
                        key={index}
                        user={firebase.auth().currentUser.uid}
                        navToUserProfile={this.navToUserProfile}
                      />
                    );
                  })}
                </Block>
              ) : (
                <Block
                  flex
                  center
                  middle
                  style={{
                    backgroundColor: colors.dBlue,
                    width: width,
                    paddingLeft: 16,
                    paddingRight: 16,
                  }}
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
                    <Headline
                      style={{
                        color: colors.white,
                        fontSize: 20,
                        marginBottom: 8,
                        textAlign: "center",
                      }}
                    >
                      You have not completed any games.
                    </Headline>
                    <Button
                      mode='contained'
                      dark={true}
                      onPress={() => this.props.navigation.navigate("MapStack")}
                      theme={{
                        colors: { primary: colors.orange },
                        fonts: { medium: this.props.theme.fonts.regular },
                      }}
                    >
                      Find a Game
                    </Button>
                  </Block>
                </Block>
              )}
            </ScrollView>
            <Block
              style={{
                borderTopWidth: 1,
                borderTopColor: colors.orange,
                paddingTop: 5,
              }}
            >
              <Caption style={{ color: colors.grey, textAlign: "center" }}>
                For Bonus Points:
              </Caption>
              <Block width={width}>
                <Button
                  mode='contained'
                  dark={true}
                  onPress={() => onShare()}
                  theme={{
                    colors: { primary: colors.orange },
                    fonts: { medium: this.props.theme.fonts.regular },
                  }}
                  style={{ marginRight: "auto", marginLeft: "auto" }}
                >
                  Share
                </Button>
              </Block>
            </Block>
          </SafeAreaView>
        </>
      );
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
    borderWidth: 1,
    marginBottom:8
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

export default withTheme(withAuthenticatedUser(Profile));
