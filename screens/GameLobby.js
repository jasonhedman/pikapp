import React from 'react';
import {
  Block,
} from 'galio-framework';
import {
  Dimensions,
  Share,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import LobbyMember from '../components/LobbyMember';
import * as firebase from 'firebase';
import firestore from 'firebase/firestore'
import { withTheme, Headline, Button, Subheading, Text, Modal, Portal, Caption } from 'react-native-paper';
import LoadingOverlay from '../components/LoadingOverlay';
import { ScrollView } from 'react-native-gesture-handler';
import HeaderBlock from '../components/HeaderBlock';
import InvitePlayers from '../components/InvitePlayers';
import HelperText from '../components/HelperText';
const { width, height } = Dimensions.get("screen");
const orange = "#E68A54";
const green = "#56B49E";
const grey = "#83838A";

class GameScreen extends React.Component {
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
      user: {}
    }
  }

  getGame = () => {
    this.setState({ loading: true, complete: false }, () => {
      let userRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid);
      userRef.get()
        .then((user) => {
          let userData = user.data();
          userData.id = user.id;
          if (userData.currentGame != null) {
            firebase.firestore().collection("games").doc(userData.currentGame).get()
              .then((game) => {
                let gameData = game.data();
                gameData.id = game.id;
                this.setState({
                  user: userData,
                  game: gameData,
                  complete: true,
                  loading: false
                })
              })
          } else {
            this.setState({
              user: userData,
              game: null,
              complete: true,
              loading: false
            })
          }
        })
    })
  }

  navToProfile = () => {
    this.props.navigation.navigate('ProfileStack');
  }

  navToUserProfile = (id) => {
    this.props.navigation.navigate("UserProfile", { userId: id });
  }

  onShare = async () => {
    try {
      const result = await Share.share({
        message: 'Join me on PikApp Mobile, the newest way to organize and join pickup sports games.',
        url: "https://apps.apple.com/us/app/pikapp-mobile/id1475855291"
      });

      if (result.action === Share.sharedAction) {
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
          points: firebase.firestore.FieldValue.increment(1)
        })
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  componentDidMount() {
    firebase.firestore().collection("users").orderBy("points", "desc").limit(10).onSnapshot((users) => {
      let topTen = [];
      users.forEach(user => {
        let userData = user.data();
        userData.id = user.id
        topTen.push(userData);
      })
      this.setState({ topTen });
    })
    let userRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid);
    let gameRef;
    userRef.onSnapshot((user) => {
      this.setState({ user: user.data() }, () => {
        if (user.data().currentGame != null) {
          gameRef = firebase.firestore().collection("games").doc(user.data().currentGame);
          gameRef.onSnapshot((game) => {
            this.getGame();
          })
        } else {
          this.setState({ game: null })
        }
      })
    })
  }

  setTeamModalVisible = (team, visible) => {
    this.setState({ teamModalVisible: visible, teamData: this.state.game.teams[team], team });
  }

  endGame = () => {
    users = this.state.game.players;
    users.forEach((user) => {
      firebase.firestore().collection("users").doc(user.id).update({
        currentGame: null
      })
    });
  }

  setModalVisible = (modalVisible) => { 
    this.setState({ modalVisible });
  }

  setInviteModalVisible = (inviteModalVisible) => {
    this.setState({ inviteModalVisible })
  }

  changeGameState = (newState) => {
    firebase.firestore().collection("games").doc(this.state.game.id).update({
      gameState: newState,
      updated: new Date()
    })
      .then(() => {
        this.setState(prevState => {
          let game = Object.assign({}, prevState.game);
          game.gameState = newState;
          return { game };
        })
      })
  }

  navToMap = () => {
    this.props.navigation.navigate("MapStack");
  }

  makePlayers() {
    let items = [];
    console.log(this.state.game.players.length)
    for (let i = 0; i < Math.min(this.state.game.players.length, 6); i++) {
      items.push(<LobbyMember game={this.state.game} key={i} user={this.state.game.players[i]} navToUserProfile={this.navToUserProfile} navToProfile={this.navToProfile} bringingEquipment={this.state.game.equipment.includes(this.state.game.players[i].id)} />);
    }
    return (
      <Block style={{ width: '100%' }}>
        <Block row style={{ justifyContent: 'space-between' }}>
          <Text style={{ color: this.props.theme.colors.white }}>Players</Text>
          <Text style={{ color: this.props.theme.colors.white }}>Equipment</Text>
        </Block>
        <Block column style={{ width: '100%' }}>
          {items}
          {
            this.state.game.players.length > 6
              ? <Button
                mode='text'
                theme={{ colors: { primary: this.props.theme.colors.orange }, fonts: { medium: this.props.theme.fonts.regular } }}
                style={{ padding: 4, marginBottom: 12 }}
                onPress={() => this.setTeamModalVisible(team, true)}
              >
                See More
              </Button>
              : <LobbyMember key={this.state.game.players.length} user={null} />
          }
        </Block>
      </Block>
    );
  }

  makePlayersFull = () => {
    let items = [];
    for (let i = 0; i < this.state.game.players.length; i++) {
      items.push(<LobbyMember key={i} user={this.state.teamData[i]} navToUserProfile={this.props.navToUserProfile} navToProfile={this.props.navToProfile} />);
    }
    return (
      <>
        <HeaderBlock text={this.state.team.toUpperCase()} backButton={true} backPress={() => { this.setTeamModalVisible(null, false) }} />
        <ScrollView>
          <Block column center style={{ width: '100%' }}>
            {items}
          </Block>
        </ScrollView>
      </>
    );
  }

  deleteGame = (gameId) => {
    let users = this.state.game.players;
    users.forEach((user) => {
      firebase.firestore().collection("users").doc(user.id).update({
        currentGame: null
      })
    });
    firebase.firestore().collection("games").doc(gameId).delete()
      .then(() => {
        this.setState({
          game: null,
          complete: true
        });
        this.props.navigation.navigate("MapStack");
      });
  }

  leaveGame = () => {
    firebase.firestore().collection("games").doc(this.state.game.id).get()
      .then((game) => {
        firebase.firestore().collection("games").doc(this.state.game.id).update({
          "teams.home": game.data().teams.home.filter(user => user.id != firebase.auth().currentUser.uid),
          "teams.away": game.data().teams.away.filter(user => user.id != firebase.auth().currentUser.uid),
        })
          .then(() => {
            firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).update({
              currentGame: null
            })
          })
      })
  }

  toSocialScreen = () => {
    this.props.navigation.navigate('SocialStack');
  }

  completeGame = () => {
    let users = this.state.game.players;
    Promise.all([
      firebase.firestore().collection("games").doc(this.state.game.id).update({
        gameState:'completed'
      }),
      users.map((user) => {
        return firebase.firestore().collection('users').doc(user.id).update({
          gamesPlayed: firebase.firestore.FieldValue.increment(1),
          points: firebase.firestore.FieldValue.increment(3),
          currentGame: null,
          "sports.basketball.gamesPlayed": firebase.firestore.FieldValue.increment(this.state.game.sport == 'basketball' ? 1 : 0),
          "sports.football.gamesPlayed": firebase.firestore.FieldValue.increment(this.state.game.sport == 'football' ? 1 : 0),
          "sports.volleyball.gamesPlayed": firebase.firestore.FieldValue.increment(this.state.game.sport == 'volleyball' ? 1 : 0),
          "sports.soccer.gamesPlayed": firebase.firestore.FieldValue.increment(this.state.game.sport == 'soccer' ? 1 : 0),
          "sports.spikeball.gamesPlayed": firebase.firestore.FieldValue.increment(this.state.game.sport == 'spikeball' ? 1 : 0),
          gameHistory: firebase.firestore.FieldValue.arrayUnion(this.state.game.id)
        });
      }),
    ])
    .then(() => {
      this.setState({
        game: null,
        complete: true
      });
      this.setModalVisible(false);
    })
  }

  render() {
    const colors = this.props.theme.colors;
    if (this.state.game != null) {
      return (
        <>
          {
            this.state.loading
              ? <LoadingOverlay />
              : null
          }
          <Portal>
            <Modal contentContainerStyle={[{ backgroundColor: this.props.theme.colors.dBlue, borderColor: colors.orange }, styles.modalStyle]} visible={this.state.modalVisible} onDismiss={() => { this.setModalVisible(false) }}>
              <Block center middle>
                <Subheading style={{color:"white", textAlign:'center', marginBottom:8}} >
                  Are you sure you you would like to complete this game?
                </Subheading>
                <Button mode="contained" dark={true} onPress={this.completeGame} theme={{ colors: { primary: colors.orange }, fonts: { medium: this.props.theme.fonts.regular } }}>
                  Complete
                    </Button>
              </Block>
            </Modal>
          </Portal>
          <Portal>
            <Modal contentContainerStyle={[{ backgroundColor: this.props.theme.colors.dBlue, borderColor: colors.orange }, styles.modalStyle]} visible={this.state.inviteModalVisible} onDismiss={() => { this.setInviteModalVisible(false) }}>
              <InvitePlayers setModalVisible={this.setInviteModalVisible} game={this.state.game} user={this.state.user} toSocialScreen={this.toSocialScreen} />
            </Modal>
          </Portal>
          <Portal>
            <Modal contentContainerStyle={[{ backgroundColor: colors.dBlue, borderColor: colors.orange }, styles.modalStyle]} visible={this.state.teamModalVisible} onDismiss={() => { this.setTeamModalVisible(null, false) }}>
              {this.state.teamData != null
                ? this.makePlayersFull()
                : null
              }
            </Modal>
          </Portal>
          <Block column flex center middle style={{ backgroundColor: colors.dBlue, width, height, padding: 16 }}>
            <Headline style={{ color: colors.white, textAlign: "center" }}>{`${this.state.game.intensity[0].toUpperCase() + this.state.game.intensity.substring(1)} ${this.state.game.sport[0].toUpperCase() + this.state.game.sport.substring(1)}`}</Headline>
            <Subheading style={{ color: colors.grey, textAlign: "center" }}>{`Owner: @${this.state.game.owner.username}`}</Subheading>
            {this.state.complete ? this.makePlayers() : null}
            {
              firebase.auth().currentUser.uid == this.state.game.owner.id
                ? (
                  <Block row style={{ justifyContent: "space-between", width: '100%', marginBottom:4 }}>
                    <Button mode="contained" dark={true} onPress={() => this.deleteGame(this.state.game.id)} theme={{ colors: { primary: colors.orange }, fonts: { medium: this.props.theme.fonts.regular } }}>
                      Cancel
                        </Button>
                    <Button mode="contained" onPress={() => this.setInviteModalVisible(true)} theme={{ colors: { primary: colors.white }, fonts: { medium: this.props.theme.fonts.regular } }}>
                      Invite
                        </Button>
                    {
                      this.state.game.gameState == "created"
                        ? <Button disabled={this.state.game.players.length < 2 || this.state.game.equipment.length == 0} dark={true} mode="contained" onPress={() => this.changeGameState('inProgress')} theme={{ colors: { primary: colors.lGreen }, fonts: { medium: this.props.theme.fonts.regular } }} style={this.state.game.players.length < 2 || this.state.game.equipment.length == 0 ? { opacity: .3, backgroundColor: colors.lGreen } : {}}>
                          Start
                            </Button>
                        : <Button dark={true} mode="contained" onPress={() => this.setModalVisible(true)} theme={{ colors: { primary: colors.lGreen }, fonts: { medium: this.props.theme.fonts.regular } }}>
                          Complete
                            </Button>
                    }
                  </Block>
                )
                : (
                  <Block row style={{ justifyContent: "space-between", width: '100%', marginBottom:4 }}>
                    <Button mode="contained" dark={true} onPress={() => this.setInviteModalVisible(true)} theme={{ colors: { primary: colors.orange }, fonts: { medium: this.props.theme.fonts.regular } }}>
                      Invite
                    </Button>
                    <Button mode="contained" dark={true} onPress={() => this.leaveGame()} theme={{ colors: { primary: colors.lGreen }, fonts: { medium: this.props.theme.fonts.regular } }}>
                      Leave Game
                    </Button>
                  </Block>
                )
            }
            <HelperText text="A player must bring equipment to start the game." visible={!(this.state.game.equipment.length > 0)} />
            <HelperText text="More players must join to start the game." visible={this.state.game.players.length > 2} />
          </Block>
        </>
      );
    } else {
      return (
        <Block column center flex style={{ backgroundColor: colors.dBlue, width, height, padding: 16, paddingTop: 32 }}>
          <HeaderBlock text='Leaderboard' />
          <Block flex style={{ width: '100%' }}>
            <ScrollView style={{ width: '100%' }}>
              {
                this.state.topTen.map((user, key) => {
                  return (
                    <Block row center middle style={{ marginBottom: 12, width: '100%' }} key={key}>
                      <Text style={{ color: "white", marginRight: 12 }}>{key + 1}.</Text>
                      {/* <TouchableOpacity 
                            onPress={() => {
                              if(user.id == firebase.auth().currentUser.uid){
                                this.props.navigation.navigate("Profile");
                              } else {
                                this.navToUserProfile(user.id);
                              }
                            }} 
                            key={key} 
                            style={{flex:1}}
                          > */}
                      <Block row center middle flex style={key == 0 ? styles.firstPlace : key == 1 ? styles.secondPlace : key == 2 ? styles.thirdPlace : styles.defaultPlace}>
                        <Block column>
                          <Text style={{ color: "#fff" }}>{user.name}</Text>
                          <Text style={{ color: "#fff" }}>@{user.username}</Text>
                        </Block>
                        <Text style={{ color: "#fff" }}>{user.points}</Text>
                      </Block>
                      {/* </TouchableOpacity> */}
                    </Block>
                  )
                })
              }
            </ScrollView>
          </Block>
          <Block style={{ borderTopWidth: 1, borderTopColor: colors.orange, width, paddingTop: 5 }}>
            <Caption style={{ color: colors.grey, textAlign: "center" }}>
              For Bonus Points:
              </Caption>
            <Block center middle style={{ width: '100%' }}>
              <Button mode="contained" dark={true} onPress={() => this.onShare()} theme={{ colors: { primary: colors.orange }, fonts: { medium: this.props.theme.fonts.regular } }}>
                Share
                </Button>
            </Block>
          </Block>
        </Block>
      );
    }
  }
}

const styles = StyleSheet.create({
  firstPlace: {
    justifyContent: 'space-between',
    borderColor: orange,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: orange,
    width: '100%'
  },
  secondPlace: {
    justifyContent: 'space-between',
    borderColor: orange,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    width: '100%'
  },
  thirdPlace: {
    justifyContent: 'space-between',
    borderColor: green,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    width: '100%'
  },
  defaultPlace: {
    justifyContent: 'space-between',
    borderColor: grey,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    width: '100%'
  },
  modalStyle: {
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 8,
    borderWidth: 2,
    width: width - 32,
    padding: 16
  }
})

export default withTheme(GameScreen);