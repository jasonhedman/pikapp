import React from "react";
import { Block } from "galio-framework";
import {
  Dimensions,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import LobbyMember from "../../components/Lobby/LobbyMember";
import * as firebase from "firebase";
import {
  withTheme,
  Button,
  Subheading,
  Text,
  Modal,
  Portal,
  IconButton,
} from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import HeaderBlock from "../../components/Utility/HeaderBlock";
import InvitePlayers from "../../components/Lobby/InvitePlayers";
import HelperText from "../../components/Utility/HelperText";
const { width, height } = Dimensions.get("screen");
import moment from "moment";
const orange = "#E68A54";
const green = "#56B49E";
const grey = "#83838A";

class GameLobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      inviteModalVisible: false,
      teamModalVisible: false,
      teamData: null,
      team: "",
      complete: false,
      loading: false,
      newModalVisible: false,
      topTen: new Array(),
      user: {},
      games: new Object(),
      cancelModalVisible: false,
    };
  }

  navToProfile = () => {
    this.props.navigation.navigate("ProfileStack");
  };

  navToUserProfile = (id) => {
    this.props.navigation.navigate("UserProfile", { userId: id });
  };

  componentDidMount() {
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((user) => {
        this.setState({ user: user.data() });
      });
    firebase
      .firestore()
      .collection("games")
      .doc(this.props.route.params.gameId)
      .onSnapshot((game) => {
        if (game.data().gameState == "created") {
          this.setState({ game: game.data(), complete: true }, () => {
            this.props.navigation.setOptions({
              title: `${
                this.state.game.intensity[0].toUpperCase() +
                this.state.game.intensity.substring(1)
              } ${
                this.state.game.sport[0].toUpperCase() +
                this.state.game.sport.substring(1)
              }`,
              headerRight: () => (
                <IconButton
                  icon="message"
                  color={this.props.theme.colors.orange}
                  onPress={() =>
                    this.props.navigation.navigate("Messages", {
                      collection: "games",
                      doc: this.props.route.params.gameId,
                    })
                  }
                  size={20}
                />
              ),
            });
          });
        } else {
          this.props.navigation.navigate("GameLandingScreen");
        }
      });
  }

  setTeamModalVisible = (team, visible) => {
    this.setState({
      teamModalVisible: visible,
      teamData: this.state.game.teams[team],
      team,
    });
  };

  setModalVisible = (modalVisible) => {
    this.setState({ modalVisible });
  };

  setCancelModalVisible = (cancelModalVisible) => {
    this.setState({ cancelModalVisible });
  };

  setInviteModalVisible = (inviteModalVisible) => {
    this.setState({ inviteModalVisible });
  };

  navToMap = () => {
    this.props.navigation.navigate("MapStack");
  };

  makePlayers() {
    let items = [];
    for (let i = 0; i < Math.min(this.state.game.players.length, 6); i++) {
      items.push(
        <LobbyMember
          game={this.state.game}
          gameId={this.props.route.params.gameId}
          key={i}
          user={this.state.game.players[i]}
          navToUserProfile={this.navToUserProfile}
          navToProfile={this.navToProfile}
          bringingEquipment={this.state.game.equipment.includes(
            this.state.game.players[i].id
          )}
        />
      );
    }
    return items;
  }

  makePlayersFull = () => {
    let items = [];
    for (let i = 0; i < this.state.game.players.length; i++) {
      items.push(
        <LobbyMember
          key={i}
          user={this.state.teamData[i]}
          navToUserProfile={this.props.navToUserProfile}
          navToProfile={this.props.navToProfile}
        />
      );
    }
    return (
      <>
        <HeaderBlock
          text={this.state.team.toUpperCase()}
          backButton={true}
          backPress={() => {
            this.setTeamModalVisible(null, false);
          }}
        />
        <ScrollView>
          <Block column center style={{ width: "100%" }}>
            {items}
          </Block>
        </ScrollView>
      </>
    );
  };

  deleteGame = () => {
    Promise.all([
      this.state.game.players.forEach((user) => {
        firebase
          .firestore()
          .collection("users")
          .doc(user.id)
          .update({
            calendar: firebase.firestore.FieldValue.arrayRemove(
              this.props.route.params.gameId
            ),
          });
      }),
      firebase
        .firestore()
        .collection("games")
        .doc(this.props.route.params.gameId)
        .update({
          gameState: "cancelled",
        }),
    ]).then(() => {
      this.props.navigation.navigate("GameLandingScreen");
      this.navToMap();
    });
  };

  leaveGame = () => {
    Promise.all([
      firebase
        .firestore()
        .collection("games")
        .doc(this.props.route.params.gameId)
        .collection("messages")
        .add({
          content: `@${this.state.user.username} left the game`,
          created: new Date(),
          senderId: null,
          senderName: null,
        }),
      firebase
        .firestore()
        .collection("games")
        .doc(this.props.route.params.gameId)
        .update({
          players: firebase.firestore.FieldValue.arrayRemove({
            id: firebase.auth().currentUser.uid,
            name: this.state.user.name,
            username: this.state.user.username,
            dob: this.state.user.dob,
          }),
        }),
    ])
      .then(() => {
        firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({
            calendar: firebase.firestore.FieldValue.arrayRemove(
              this.props.route.params.gameId
            ),
          });
      })
      .then(() => {
        this.props.navigation.navigate("GameLandingScreen");
        this.navToMap();
      });
  };

  toSocialScreen = () => {
    this.props.navigation.navigate("SocialStack");
  };

  completeGame = () => {
    let users = this.state.game.players;
    Promise.all([
      firebase
        .firestore()
        .collection("games")
        .doc(this.props.route.params.gameId)
        .update({
          gameState: "completed",
        }),
      users.map((user) => {
        return firebase
          .firestore()
          .collection("users")
          .doc(user.id)
          .update({
            gamesPlayed: firebase.firestore.FieldValue.increment(1),
            points: firebase.firestore.FieldValue.increment(3),
            calendar: firebase.firestore.FieldValue.arrayRemove(
              this.props.route.params.gameId
            ),
            "sports.basketball.gamesPlayed": firebase.firestore.FieldValue.increment(
              this.state.game.sport == "basketball" ? 1 : 0
            ),
            "sports.football.gamesPlayed": firebase.firestore.FieldValue.increment(
              this.state.game.sport == "football" ? 1 : 0
            ),
            "sports.frisbee.gamesPlayed": firebase.firestore.FieldValue.increment(
              this.state.game.sport === "frisbee" ? 1 : 0
            ),
            "sports.volleyball.gamesPlayed": firebase.firestore.FieldValue.increment(
              this.state.game.sport == "volleyball" ? 1 : 0
            ),
            "sports.soccer.gamesPlayed": firebase.firestore.FieldValue.increment(
              this.state.game.sport == "soccer" ? 1 : 0
            ),
            "sports.spikeball.gamesPlayed": firebase.firestore.FieldValue.increment(
              this.state.game.sport == "spikeball" ? 1 : 0
            ),
            gameHistory: firebase.firestore.FieldValue.arrayUnion(
              this.props.route.params.gameId
            ),
          });
      }),
    ]).then(() => {
      this.setState({
        game: null,
        complete: false,
      });
      this.props.navigation.navigate("GameLandingScreen");
      this.setModalVisible(false);
      this.navToMap();
    });
  };

  render() {
    const colors = this.props.theme.colors;
    if (this.state.complete && this.state.game != null) {
      return (
        <>
          <Portal>
            <Modal
              contentContainerStyle={[
                {
                  backgroundColor: this.props.theme.colors.dBlue,
                  borderColor: colors.orange,
                },
                styles.modalStyle,
              ]}
              visible={this.state.modalVisible}
              onDismiss={() => {
                this.setModalVisible(false);
              }}
            >
              <Block center middle>
                <Subheading
                  style={{
                    color: "white",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Are you sure you you would like to complete this game?
                </Subheading>
                <Button
                  mode="contained"
                  dark={true}
                  onPress={this.completeGame}
                  theme={{
                    colors: { primary: colors.orange },
                    fonts: { medium: this.props.theme.fonts.regular },
                  }}
                >
                  Complete
                </Button>
              </Block>
            </Modal>
          </Portal>
          <Portal>
            <Modal
              contentContainerStyle={[
                {
                  backgroundColor: this.props.theme.colors.dBlue,
                  borderColor: colors.orange,
                },
                styles.modalStyle,
              ]}
              visible={this.state.cancelModalVisible}
              onDismiss={() => {
                this.setCancelModalVisible(false);
              }}
            >
              <Block center middle>
                <Subheading
                  style={{
                    color: "white",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Are you sure you you would like to cancel this game?
                </Subheading>
                <Button
                  mode="contained"
                  dark={true}
                  onPress={this.deleteGame}
                  theme={{
                    colors: { primary: colors.orange },
                    fonts: { medium: this.props.theme.fonts.regular },
                  }}
                >
                  Cancel
                </Button>
              </Block>
            </Modal>
          </Portal>
          <Portal>
            <Modal
              contentContainerStyle={[
                {
                  backgroundColor: this.props.theme.colors.dBlue,
                  borderColor: colors.orange,
                },
                styles.modalStyle,
              ]}
              visible={this.state.inviteModalVisible}
              onDismiss={() => {
                this.setInviteModalVisible(false);
              }}
            >
              <InvitePlayers
                setModalVisible={this.setInviteModalVisible}
                game={this.state.game}
                user={this.state.user}
                toSocialScreen={this.toSocialScreen}
              />
            </Modal>
          </Portal>
          <Portal>
            <Modal
              contentContainerStyle={[
                { backgroundColor: colors.dBlue, borderColor: colors.orange },
                styles.modalStyle,
              ]}
              visible={this.state.teamModalVisible}
              onDismiss={() => {
                this.setTeamModalVisible(null, false);
              }}
            >
              {this.state.teamData != null ? this.makePlayersFull() : null}
            </Modal>
          </Portal>
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.dBlue }}>
            <Block
              center
              column
              flex
              style={{ width, paddingHorizontal: 16, paddingBottom: 0 }}
            >
              <Text
                style={{ color: colors.grey, textAlign: "center" }}
              >{`Time: ${
                moment().diff(
                  moment.unix(parseInt(this.state.game.startTime.time.seconds))
                ) < 0
                  ? this.state.game.startTime.timeString
                  : "Now"
              }`}</Text>
              {this.state.complete ? (
                <Block flex style={{ width: "100%" }}>
                  <Block row style={{ justifyContent: "space-between" }}>
                    <Text style={{ color: this.props.theme.colors.white }}>
                      Players
                    </Text>
                    <Text style={{ color: this.props.theme.colors.white }}>
                      Equipment
                    </Text>
                  </Block>
                  <Block style={{ flex: -1 }}>
                    <ScrollView style={{ width: "100%" }}>
                      {this.makePlayers()}
                    </ScrollView>
                  </Block>
                  {firebase.auth().currentUser.uid ==
                  this.state.game.owner.id ? (
                    <Block
                      row
                      style={{
                        justifyContent: "space-between",
                        width: "100%",
                        marginBottom: 8,
                        marginTop: 4,
                      }}
                    >
                      <Button
                        mode="contained"
                        dark={true}
                        onPress={() => this.setCancelModalVisible(true)}
                        theme={{
                          colors: { primary: colors.orange },
                          fonts: { medium: this.props.theme.fonts.regular },
                        }}
                        uppercase={false}
                      >
                        Cancel
                      </Button>
                      <Button
                        mode="contained"
                        onPress={() => this.setInviteModalVisible(true)}
                        theme={{
                          colors: { primary: colors.white },
                          fonts: { medium: this.props.theme.fonts.regular },
                        }}
                        uppercase={false}
                      >
                        Invite
                      </Button>
                      {
                        <Button
                          dark={true}
                          mode="contained"
                          onPress={() => this.setModalVisible(true)}
                          theme={{
                            colors: { primary: colors.lGreen },
                            fonts: { medium: this.props.theme.fonts.regular },
                          }}
                          uppercase={false}
                        >
                          Complete
                        </Button>
                      }
                    </Block>
                  ) : (
                    <Block
                      row
                      style={{
                        justifyContent: "space-between",
                        width: "100%",
                        marginBottom: 4,
                      }}
                    >
                      <Button
                        mode="text"
                        dark={false}
                        onPress={() => this.leaveGame()}
                        theme={{
                          colors: { primary: colors.white },
                          fonts: { medium: this.props.theme.fonts.regular },
                        }}
                        uppercase={false}
                      >
                        Leave Game
                      </Button>
                      <Button
                        mode="contained"
                        dark={true}
                        onPress={() => this.setInviteModalVisible(true)}
                        theme={{
                          colors: { primary: colors.orange },
                          fonts: { medium: this.props.theme.fonts.regular },
                        }}
                        uppercase={false}
                      >
                        Invite
                      </Button>
                    </Block>
                  )}
                </Block>
              ) : null}
              <HelperText
                text="No players are bringing equipment"
                visible={!(this.state.game.equipment.length > 0)}
              />
            </Block>
          </SafeAreaView>
        </>
      );
    } else {
      return (
        <Block
          flex
          style={{ backgroundColor: this.props.theme.colors.dBlue }}
        ></Block>
      );
    }
  }
}

const styles = StyleSheet.create({
  firstPlace: {
    justifyContent: "space-between",
    borderColor: orange,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: orange,
    width: "100%",
  },
  secondPlace: {
    justifyContent: "space-between",
    borderColor: orange,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    width: "100%",
  },
  thirdPlace: {
    justifyContent: "space-between",
    borderColor: green,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    width: "100%",
  },
  defaultPlace: {
    justifyContent: "space-between",
    borderColor: grey,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    width: "100%",
  },
  modalStyle: {
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 8,
    borderWidth: 2,
    width: width - 32,
    padding: 16,
  },
});

export default withTheme(GameLobby);
