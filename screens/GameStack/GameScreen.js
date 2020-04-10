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
import LobbyMember from '../../components/Lobby/LobbyMember';
import * as firebase from 'firebase';
import firestore from 'firebase/firestore'
import { withTheme, Headline, Button, Subheading, Text, Modal, Portal, Caption, IconButton } from 'react-native-paper';
import LoadingOverlay from '../../components/Utility/LoadingOverlay';
import { ScrollView } from 'react-native-gesture-handler';
import HeaderBlock from '../../components/Utility/HeaderBlock';
import InvitePlayers from '../../components/Lobby/InvitePlayers';
import HelperText from '../../components/Utility/HelperText';
const { width, height } = Dimensions.get("screen");
import moment from 'moment';
import GamePreview from '../../components/Lobby/GamePreview';
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
      userLoaded: false,
      loading: false,
      newModalVisible: false,
      topTen: new Array(),
      user: null,
      games: new Object()
    }
  }

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
    firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).onSnapshot((user) => {
      this.setState({ user: user.data(),userLoaded:true})
    })
  }

  render() {
    const colors = this.props.theme.colors;
    if(this.state.userLoaded){
      if (this.state.user != null && this.state.user.calendar.length > 0) {
        this.props.navigation.setOptions({
          title: "Games"
        })
        return (
          <>
            {
              this.state.loading
                ? <LoadingOverlay />
                : null
            }
            <Block column flex center style={{ backgroundColor: colors.dBlue, width, height, paddingHorizontal: 16 }}>
              <ScrollView style={{width:'100%'}}>
              {
                this.state.user.calendar.map((game, index) => {
                  return (
                    <GamePreview key={index} game={game} navigate={this.props.navigation.navigate} />
                  )
                })
              }
              </ScrollView>
            </Block>
          </>
        );
      } else {
        this.props.navigation.setOptions({
          title: "Leaderboard"
        })
        return (
          <Block column center flex style={{ backgroundColor: colors.dBlue, width, height, padding: 16, paddingTop: 32 }}>
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
    } else {
      return (
        <Block flex style={{backgroundColor:colors.dBlue}}></Block>
      )
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