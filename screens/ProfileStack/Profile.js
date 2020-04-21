import React from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import {
  withTheme,
  Button,
  Headline,
  Subheading,
  IconButton,
  Caption,
  Text,
} from "react-native-paper";
import SlideModal from "react-native-modal";
import { Block } from "galio-framework";
import * as firebase from "firebase";
import "firebase/firestore";

import GameResult from "../../components/Profile/GameResult";
import SportsBreakdown from "../../components/Profile/SportsBreakdown";
import ProfilePic from "../../components/Utility/ProfilePic";
import onShare from "../../services/onShare";

const { width, height } = Dimensions.get("window");

import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";
import withLogging from "../../contexts/loggingContext/withLogging";
import NoResults from "../../components/Utility/NoResults";

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.props._trace(this, "construct component", "constructor");

    this.state = {
      proPicUrl: null,
      gameHistory: null,            // NOTE: This is the state that matters when re-rendering
      lastThreeGames: new Array(),  // this holds the actual games retrieved
      complete: false,              // indicates that last 3 games were loaded
      settingsVisible: false,
    };
  }

  asyncLoadLast3Games() {
    this.props._trace(this, "start", "asyncLoadLast3Games");
    const gameHistory = this.props._currentUserProfile.gameHistory
    this.setState({ gameHistory: gameHistory });

    // gets up to last 3 games for this user.
    let lastThreeGamePromises = [];
    for (
      let i = gameHistory.length - 1;
      i >= Math.max(gameHistory.length - 3, 0);
      i--
    ) {
      // NOTE: lastThreeGames is an array of promises, each pulling game data
      lastThreeGamePromises.push(
        firebase
          .firestore()
          .collection("games")
          .doc(gameHistory[i])
          .get()
          .then((game) => {
            return game.data();
          })
      );
    }

    // when all three are done, write the games to state
    Promise.all(lastThreeGamePromises).then((games) => {
      this.setState({
        lastThreeGames: games,
        complete: true,
      });
    })
    .catch(() => {
      this.setState({
        lastThreeGames: [],
        complete: true,
      });
    });
  }

  asyncLoadPic() {

    firebase
      .storage()
      .ref("profilePictures/" + firebase.auth().currentUser.uid)
      .getDownloadURL()
      .then((url) => {
        this.setState({ proPicUrl: url });
      })
      .catch(() => {
        this.setState({ proPicUrl: null });
      });

  }

  componentDidMount() {
    // load last 3 games
    this.asyncLoadLast3Games();

    // load pic
    this.asyncLoadPic();
  }

  // called when new props are delivered before a render. compare the saved gameHistory with the
  // current user game history. If they differ, then need to re-load the last 3 before drawing
  // so set the data to null (so there's no data). Then when compoentDidUpdate() is called, it'll
  // reload the data as necessary.
  static getDerivedStateFromProps(props, state) {
    if (props._currentUserProfile.gameHistory !== state.gameHistory) {
      return {
        gameHistory: null,
        externalData: null,
        complete: false,
      };
    }
    // No state update necessary
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.gameHistory === null) {
      this.asyncLoadLast3Games(this.props._currentUserProfile.gameHistory);
    }
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

  navToUserProfile = (id) => {
    if (id != firebase.auth().currentUser.uid) {
      this.props.navigation.navigate("UserProfile", { userId: id });
    }
  };

  navToUserList = (users, listType) => {
    this.props.navigation.navigate("UserList", { users, listType });
  };

  render() {
    this.props._trace(this, "render component", "render");
    let currentUserProfile = this.props._currentUserProfile;
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
    console.log(currentUserProfile.location.geopoint._lat)
    const colors = this.props.theme.colors;
    if (this.state.complete) {
      return (
        <>
          <SlideModal
            animationIn="slideInUp"
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
                mode="contained"
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
                mode="contained"
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
                mode="text"
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
              contentContainerStyle={{
                backgroundColor: colors.dBlue,
                paddingHorizontal: 16,
              }}
              snapToStart={false}
            >
              <Block middle style={{ marginBottom: 12 }}>
                <Block row middle style={{ marginBottom: 8 }}>
                  <ProfilePic size={80} proPicUrl={this.props._currentUserProfile.proPicUrl} />
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
                          this.props._currentUserProfile.followers,
                          "Followers"
                        )
                      }
                    >
                      <Block column center middle>
                        <Subheading style={styles.subheading}>
                          Followers
                        </Subheading>
                        <Headline style={styles.stat}>
                          {this.props._currentUserProfile.followers.length}
                        </Headline>
                      </Block>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        this.navToUserList(
                          this.props._currentUserProfile.friendsList,
                          "Following"
                        )
                      }
                    >
                      <Block column center middle>
                        <Subheading style={styles.subheading}>
                          Following
                        </Subheading>
                        <Headline style={styles.stat}>
                          {this.props._currentUserProfile.friendsList.length}
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
                    {this.props._currentUserProfile.name}
                  </Text>
                </Block>
                <Block row style={{ marginBottom: 12 }}>
                  <Button
                    mode="contained"
                    onPress={() =>
                      this.props.navigation.navigate("EditProfile")
                    }
                    dark={true}
                    style={[
                      styles.button,
                      { borderColor: colors.white, flex: 1 },
                    ]}
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
                    >{`${this.props._currentUserProfile.gamesPlayed}`}</Headline>
                  </Block>
                  <Block
                    style={[styles.statContainer, { marginLeft: 8 }]}
                    column
                    center
                    middle
                  >
                    <Subheading style={styles.subheading}>Points</Subheading>
                    <Headline style={styles.info}>
                      {this.props._currentUserProfile.points}
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
              <SportsBreakdown user={this.props._currentUserProfile} />
              <Headline
                style={[
                  styles.header,
                  { marginBottom: 12, textAlign: "center" },
                ]}
              >
                Last Three Games
              </Headline>
              {this.state.lastThreeGames.length > 0 ? (
                <Block column>
                  {this.state.lastThreeGames.map((game, index) => {
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
                <NoResults border={true} />
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
                  mode="contained"
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
    marginBottom: 8,
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

export default withLogging(withTheme(withAuthenticatedUser(Profile)));
