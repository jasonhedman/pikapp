import React from "react";
import { TouchableOpacity } from "react-native";
import { Block } from "galio-framework";
import { Text, withTheme, Button } from "react-native-paper";
import ProfilePic from "../Utility/ProfilePic";
import firebase from "firebase";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";

class GameMessage extends React.Component {
  constructor() {
    super();
    this.state = {
      game: {},
      complete: false,
    };
  }

  componentDidMount() {
    const unsubscribe = firebase
      .firestore()
      .collection("games")
      .doc(this.props.message.gameId)
      .onSnapshot((game) => {
        this.setState({ game: game.data(), complete: true });
      });
    this.unsubscribe = unsubscribe;
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  joinGame = () => {
    Promise.all([
      firebase
        .firestore()
        .collection("games")
        .doc(this.props.message.gameId)
        .update({
          players: firebase.firestore.FieldValue.arrayUnion({
            dob: this.props._currentUserProfile.dob,
            id: this.props._currentUserProfile.id,
            name: this.props._currentUserProfile.name,
            username: this.props._currentUserProfile.username,
          }),
        }),
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({
          calendar: firebase.firestore.FieldValue.arrayUnion(
            this.props.message.gameId
          ),
        }),
    ]).then(() => {
      this.props.navigate("GameStack");
    });
  };

  viewGame = () => {
    this.props.navigate("MapScreen", {
      latitude: this.state.game.location.geopoint._lat,
      longitude: this.state.game.location.geopoint._long,
      markerId: this.state.game.id,
    });
  };

  render() {
    let colors = this.props.theme.colors;
    if (this.props.message.senderId == firebase.auth().currentUser.uid) {
      return (
        <Block style={{ flexDirection: "row-reverse", marginBottom: 8 }}>
          {this.props.messageBelow == undefined ||
          this.props.messageBelow.senderId != this.props.message.senderId ? (
            <Block style={{ marginTop: "auto" }}>
              <ProfilePic
                size={30}
                proPicUrl={this.props.message.sender.proPicUrl}
              />
            </Block>
          ) : null}
          <Block flex column style={{ paddingRight: 8 }}>
            {this.props.messageAbove == undefined ||
            this.props.messageAbove.senderId != this.props.message.senderId ? (
              <Text
                style={{
                  color: colors.grey,
                  marginLeft: "auto",
                  marginRight: !(
                    this.props.messageBelow == undefined ||
                    this.props.messageBelow.senderId !=
                      this.props.message.senderId
                  )
                    ? 34
                    : 0,
                  paddingBottom: 4,
                }}
              >{`@${this.props.message.sender.username}`}</Text>
            ) : null}
            <Block
              row
              middle
              style={[
                {
                  marginLeft: "auto",
                  padding: 10,
                  borderColor: colors.orange,
                  borderRadius: 8,
                  borderWidth: 1,
                },
                !(
                  this.props.messageBelow == undefined ||
                  this.props.messageBelow.senderId !=
                    this.props.message.senderId
                )
                  ? { marginRight: 34 }
                  : null,
              ]}
            >
              {this.state.complete ? (
                <>
                  <Block>
                    <Text
                      style={{
                        color: colors.white,
                        fontFamily: "ralewayBold",
                        marginBottom: 2,
                      }}
                    >
                      {`${
                        this.state.game.intensity[0].toUpperCase() +
                        this.state.game.intensity.substring(1)
                      } ${
                        this.state.game.sport[0].toUpperCase() +
                        this.state.game.sport.substring(1)
                      }`}
                    </Text>
                    <Text
                      style={{ color: colors.grey, marginBottom: 2 }}
                    >{`Time: ${this.state.game.startTime.timeString}`}</Text>
                    <Text
                      style={{ color: colors.grey }}
                    >{`Location: ${this.state.game.locationName}`}</Text>
                  </Block>
                  <Block style={{ marginLeft: 16 }}>
                    <Button
                      mode='contained'
                      dark={true}
                      onPress={this.joinGame}
                      theme={{
                        colors: { primary: colors.orange },
                        fonts: { medium: this.props.theme.fonts.regular },
                      }}
                      uppercase={false}
                      compact={true}
                      disabled={
                        this.props._currentUserProfile.calendar.includes(
                          this.props.message.gameId
                        ) || this.state.game.gameState != "created"
                      }
                      style={
                        this.props._currentUserProfile.calendar.includes(
                          this.props.message.gameId
                        ) || this.state.game.gameState != "created"
                          ? { opacity: 0.3, backgroundColor: colors.orange }
                          : null
                      }
                    >
                      Join
                    </Button>
                    <Button
                      mode='text'
                      dark={false}
                      onPress={this.viewGame}
                      theme={{
                        colors: { primary: colors.white },
                        fonts: { medium: this.props.theme.fonts.regular },
                      }}
                      uppercase={false}
                      compact={true}
                    >
                      View
                    </Button>
                  </Block>
                </>
              ) : null}
            </Block>
          </Block>
        </Block>
      );
    } else {
      return (
        <Block style={{ flexDirection: "row", marginBottom: 8 }}>
          {this.props.messageBelow == undefined ||
          this.props.messageBelow.senderId != this.props.message.senderId ? (
            <TouchableOpacity
              style={{ marginTop: "auto" }}
              onPress={() =>
                this.props.navigate("UserProfile", {
                  userId: this.props.message.senderId,
                })
              }
            >
              <ProfilePic
                size={30}
                proPicUrl={this.props.message.sender.proPicUrl}
              />
            </TouchableOpacity>
          ) : null}
          <Block flex column style={{ paddingLeft: 8 }}>
            {this.props.messageAbove == undefined ||
            this.props.messageAbove.senderId != this.props.message.senderId ? (
              <TouchableOpacity
                style={{ marginTop: "auto" }}
                onPress={() =>
                  this.props.navigate("UserProfile", {
                    userId: this.props.message.senderId,
                  })
                }
              >
                <Text
                  style={{
                    color: colors.grey,
                    marginRight: "auto",
                    marginLeft: !(
                      this.props.messageBelow == undefined ||
                      this.props.messageBelow.senderId !=
                        this.props.message.senderId
                    )
                      ? 34
                      : 0,
                    paddingBottom: 4,
                  }}
                >{`@${this.props.message.sender.username}`}</Text>
              </TouchableOpacity>
            ) : null}
            <Block
              row
              middle
              style={[
                {
                  marginRight: "auto",
                  padding: 10,
                  borderColor: colors.white,
                  borderRadius: 8,
                  borderWidth: 1,
                },
                !(
                  this.props.messageBelow == undefined ||
                  this.props.messageBelow.senderId !=
                    this.props.message.senderId
                )
                  ? { marginLeft: 34 }
                  : null,
              ]}
            >
              {this.state.complete ? (
                <>
                  <Block>
                    <Text
                      style={{
                        color: colors.white,
                        fontFamily: "ralewayBold",
                        marginBottom: 2,
                      }}
                    >
                      {`${
                        this.state.game.intensity[0].toUpperCase() +
                        this.state.game.intensity.substring(1)
                      } ${
                        this.state.game.sport[0].toUpperCase() +
                        this.state.game.sport.substring(1)
                      }`}
                    </Text>
                    <Text
                      style={{ color: colors.grey, marginBottom: 2 }}
                    >{`Time: ${this.state.game.startTime.timeString}`}</Text>
                    <Text
                      style={{ color: colors.grey }}
                    >{`Location: ${this.state.game.locationName}`}</Text>
                  </Block>
                  <Block style={{ marginLeft: 16 }}>
                    <Button
                      mode='contained'
                      dark={true}
                      onPress={this.joinGame}
                      theme={{
                        colors: { primary: colors.orange },
                        fonts: { medium: this.props.theme.fonts.regular },
                      }}
                      uppercase={false}
                      compact={true}
                      disabled={
                        this.props._currentUserProfile.calendar.includes(
                          this.props.message.gameId
                        ) || this.state.game.gameState != "created"
                      }
                      style={
                        this.props._currentUserProfile.calendar.includes(
                          this.props.message.gameId
                        ) || this.state.game.gameState != "created"
                          ? { opacity: 0.3, backgroundColor: colors.orange }
                          : null
                      }
                    >
                      Join
                    </Button>
                    <Button
                      mode='text'
                      dark={false}
                      onPress={this.viewGame}
                      theme={{
                        colors: { primary: colors.white },
                        fonts: { medium: this.props.theme.fonts.regular },
                      }}
                      uppercase={false}
                      compact={true}
                    >
                      View
                    </Button>
                  </Block>
                </>
              ) : null}
            </Block>
          </Block>
        </Block>
      );
    }
  }
}

export default withTheme(withAuthenticatedUser(GameMessage));
