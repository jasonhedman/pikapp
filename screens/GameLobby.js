import React from 'react';
import {
  Block,
} from 'galio-framework';
import {
  Dimensions,
  Share,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import LobbyMember from '../components/LobbyMember';
import ScoreForm from '../components/ScoreForm';
import * as firebase from 'firebase';
import firestore from 'firebase/firestore'
import { withTheme, Headline, Button, Subheading, Text, Modal, Portal, Caption } from 'react-native-paper';
import LoadingOverlay from '../components/LoadingOverlay';
import { ScrollView } from 'react-native-gesture-handler';
const { width, height } = Dimensions.get("screen");
const orange = "#E68A54";
const green = "#56B49E";
const grey = "#83838A";

class GameScreen extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      modalVisible:false,
      teamModalVisible:false,
      teamData:null,
      team:"",
      complete:false,
      loading: false,
      newModalVisible:false,
      topTen: new Array(),
    }
  }
  
  getGame = () => {
    this.setState({loading:true, complete:false}, () => {
      let userRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid);
      userRef.get()
        .then((user) => {
          if(user.data().currentGame != null) {
            firebase.firestore().collection("games").doc(user.data().currentGame).get()
              .then((game) => {
                let gameData = game.data();
                gameData.id = game.id;
                this.setState({
                  game:gameData,
                  complete:true,
                  loading:false
                })
              })
          } else {
            this.setState({
              game: null,
              complete: true,
              loading:false
            })
          }
        })
    })
  }

  navToProfile = () => {
    this.props.navigation.navigate('Profile');
  }

  navToUserProfile = (id) => {
    this.props.navigation.navigate("UserProfile", {userId:id});
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

  componentDidMount(){
    firebase.firestore().collection("users").orderBy("points", "desc").limit(10).get()
      .then((users) => {
        firebase.firestore().collection("users").orderBy("points", "desc").limit(10).onSnapshot((users) => {
          let topTen = [];
          users.forEach(user => {
            let userData = user.data();
            userData.id = user.id
            topTen.push(userData);
          })
          this.setState({topTen});
        })
        let topTen = [];
        users.forEach(user => {
          let userData = user.data();
          userData.id = user.id
          topTen.push(userData);
        })
        this.setState({topTen});
      })
      .then(() => {
        let userRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid);
        let gameRef;
        userRef.get()
          .then((user) => {
            if(user.data().currentGame != null){
              gameRef = firebase.firestore().collection("games").doc(user.data().currentGame);
                gameRef.onSnapshot((game) => {
                  this.getGame();
                })
            }
          })
        userRef.onSnapshot((user) => {
          if(user.data().currentGame != null){
            gameRef = firebase.firestore().collection("games").doc(user.data().currentGame);
            gameRef.onSnapshot((game) => {
              this.getGame();
            })
          }
          this.getGame();
        })
        this.getGame();

      })
  }

  setTeamModalVisible = (team,visible) => {
    this.setState({teamModalVisible:visible,teamData:this.state.game.teams[team],team});
  }

  endGame = () => {
    users = this.state.game.teams.home.concat(this.state.game.teams.away);
    users.forEach((user) => {
      firebase.firestore().collection("users").doc(user.id).update({
        currentGame: null
      })
    });
  }

  setModalVisible = (modalVisible) => {
    this.setState({modalVisible});
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
    this.props.navigation.navigate("MapScreen");
  }

  makePlayers(team){
    let items = [];
    for(let i = 0; i < Math.min(this.state.game.teamSize , 3); i++){
      if(i < this.state.game.teams[team].length){
        items.push(<LobbyMember key={i} user={this.state.game.teams[team][i]} navToUserProfile={this.navToUserProfile} navToProfile={this.navToProfile}/>);
      } else {
        items.push(<LobbyMember key={i} user={null} />);
      }
    }
    return (
      <Block>
        <Text style={{color:this.props.theme.colors.white}}>{team.toUpperCase()}</Text>
        <Block column>
          {items}
          {
            this.state.game.teamSize > 3
            ? <Button
                mode='text'
                theme={{colors:{primary:this.props.theme.colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}
                style={{height:height*.05,marginBottom:height*.005}}
                onPress={() => this.setTeamModalVisible(team,true)}
              >
                See More
              </Button>
            : null
          }
          
        </Block>
      </Block>
    );
  }

  makePlayersFull = () => {
    let items = [];
    for(let i = 0; i <(this.state.game.teamSize > 8 ? 8 : this.state.game.teamSize); i++){
      if(i < this.state.teamData.length){
        items.push(<LobbyMember key={i} user={this.state.teamData[i]} navToUserProfile={this.props.navToUserProfile} navToProfile={this.props.navToProfile}/>);
      } else {
        items.push(<LobbyMember key={i} user={null} />);
      }
    }
    if(this.state.game.teamSize > 8){
      items.push(
        <Block center middle style={styles.containerAvailable}>
          <Text style={{color:this.props.theme.colors.grey}}>More Players...</Text>
        </Block>
      );
    }
    return (
      <Block>
        <Headline style={{color:this.props.theme.colors.white,textAlign:"center",height:height*.05,marginBottom:height*.005}}>{this.state.team.toUpperCase()}</Headline>
        <Block column center>
          {items}
        </Block>
      </Block>
    );
  }

  deleteGame = (gameId) => {
    users = this.state.game.teams.home.concat(this.state.game.teams.away);
    users.forEach((user) => {
      firebase.firestore().collection("users").doc(user.id).update({
        currentGame: null
      })
    })
    firebase.firestore().collection("games").doc(gameId).delete()
      .then(() => {
        this.setState({
          game: null,
          complete: true
        });
        this.props.navigation.navigate("MapScreen");
      })
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

  render(){
    if(this.props.navigation.getParam("new",null) != null){
      this.setState({newModalVisible:true}, () => {
        this.props.navigation.navigate('Lobby',{new:null});
      })
    }
    const colors = this.props.theme.colors;
      if(this.state.game != null){
        return (
          <>
            {
              this.state.loading
              ? <LoadingOverlay />
              : null
            }
            <Portal>
              <Modal contentContainerStyle={{backgroundColor:this.props.theme.colors.dBlue, width:width*.9,  marginLeft:"auto", marginRight:"auto", borderRadius:8, borderWidth:2, borderColor:colors.orange}} visible={this.state.modalVisible} onDismiss={() => {this.setModalVisible(false)}}>
                <ScoreForm setModalVisible={this.setModalVisible} navToMap={this.navToMap} game={this.state.game}/>
              </Modal>
            </Portal>
            <Portal>
              <Modal contentContainerStyle={{backgroundColor:this.props.theme.colors.dBlue, width:width*.9,  marginLeft:"auto", marginRight:"auto", borderRadius:8, borderWidth:2, borderColor:colors.orange, padding:10}} visible={this.state.newModalVisible} onDismiss={() => this.setState({newModalVisible:false})}>
                <Headline style={{textAlign:'center',color:colors.white,fontSize:20,marginTop:height*.025,marginBottom:height*.025}}>Reminder: After 1 hour of inactivity, this game will be removed. Press the 'Start Game' button when you begin gameplay and use the 'Submit Score' form to complete the game. </Headline>
                <Button mode="contained" dark={true} onPress={() => this.setState({newModalVisible:false})} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                  OK
                </Button>
              </Modal>
            </Portal>
            <Portal>
              <Modal contentContainerStyle={{backgroundColor:this.props.theme.colors.dBlue, width:width*.9, padding:5, paddingTop:10, marginLeft:"auto", marginRight:"auto", borderRadius:8, borderWidth:2, borderColor:colors.orange}} visible={this.state.teamModalVisible} onDismiss={() => {this.setTeamModalVisible(null,false)}}>
                  {this.state.teamData != null
                  ? this.makePlayersFull()
                  :null
                  }
              </Modal>
            </Portal>
            <Block column flex center middle style={{backgroundColor:colors.dBlue, width, height}}>
              <Block flex center middle  width={width*.9} style={{}}>
                <Headline style={{color:colors.white,textAlign:"center"}}>{`${this.state.game.intensity} ${this.state.game.sport[0].toUpperCase() + this.state.game.sport.substring(1)}`}</Headline>
                <Subheading style={{color:colors.grey,textAlign:"center"}}>{`Owner: @${this.state.game.ownerUsername}`}</Subheading>
                {this.state.complete ? this.makePlayers('home') : null
                }
                {this.state.complete ? this.makePlayers('away'): null
              }
                {
                  firebase.auth().currentUser.uid == this.state.game.owner
                  ? (
                    <Block row style={{justifyContent:"space-between", width:width*.8}}>
                        <Button mode="contained" dark={true} onPress={() => this.deleteGame(this.state.game.id)} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                          Cancel Game
                        </Button>
                        {
                          this.state.game.gameState == "created"
                          ? <Button disabled={this.state.game.teams.home.length == 0 || this.state.game.teams.away.length == 0} mode="contained" dark={true} onPress={() =>this.changeGameState('inProgress')} theme={{colors:{primary:colors.lGreen},fonts:{medium:this.props.theme.fonts.regular}}}>
                              Start Game
                            </Button>
                          : <Button disabled={this.state.game.teams.home.length == 0 || this.state.game.teams.away.length == 0} mode="contained" dark={true} onPress={() =>this.setModalVisible(true)} theme={{colors:{primary:colors.lGreen},fonts:{medium:this.props.theme.fonts.regular}}}>
                              Submit Score
                            </Button>
                        }
                    </Block>
                  )
                  : (
                    <Block>
                        <Button mode="contained" dark={true} onPress={() =>this.leaveGame()} theme={{colors:{primary:colors.lGreen},fonts:{medium:this.props.theme.fonts.regular}}}>
                          Leave Game
                        </Button>
                    </Block>
                  )
                }
              </Block>
            </Block>
          </>
        );
      } else {
        return (
          <Block column center flex style={{backgroundColor:colors.dBlue,width}}>
            <Block flex width={width*.9}>
                <Headline style={{color:"#FFF",textAlign:'center',marginTop:height*.1, marginBottom:20}}>Leaderboard</Headline>
                <Block flex>
                  <ScrollView>
                    {
                      this.state.topTen.map((user,key) => {
                          return (
                            <Block row center middle width={width*.9} style={{marginBottom:10}}>
                              <Text style={{color:"white", marginRight:10}}>{key+1}.</Text>
                              <TouchableOpacity 
                                onPress={() => {
                                  if(user.id == firebase.auth().currentUser.uid){
                                    this.props.navigation.navigate("Profile");
                                  } else {
                                    this.navToUserProfile(user.id);
                                  }
                                }} 
                                key={key} 
                                style={{flex:1}}
                              >
                                  <Block width={"100%"} row center middle style={key == 0 ? styles.firstPlace : key == 1 ? styles.secondPlace : key == 2 ? styles.thirdPlace : styles.defaultPlace}>
                                      <Block column>
                                          <Text style={{color:"#fff"}}>{user.name}</Text>
                                          <Text style={{color:"#fff"}}>@{user.username}</Text>
                                      </Block>
                                      <Text style={{color:"#fff"}}>{user.points}</Text>
                                  </Block>
                              </TouchableOpacity>
                            </Block>
                              
                          )
                      })
                    }
                  </ScrollView>
                </Block>
            </Block>
            <Block style={{borderTopWidth:1, borderTopColor:colors.orange, width, paddingTop:5}}>
              <Caption style={{color:colors.grey,textAlign:"center"}}>
                For Bonus Points:
              </Caption>
              <Block width={width}>
                <Button mode="contained" dark={true} onPress={() =>this.onShare()} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}} style={{marginRight:'auto',marginLeft:'auto'}}>
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
    justifyContent:'space-between',
    borderColor:orange,
    borderWidth:1,
    borderRadius:8, 
    padding: 10, 
    backgroundColor:orange,
  },
  secondPlace: {
    justifyContent:'space-between',
    borderColor:orange,
    borderWidth:1,
    borderRadius:8, 
    padding: 10, 
  },
  thirdPlace:{
    justifyContent:'space-between',
    borderColor:green,
    borderWidth:1,
    borderRadius:8, 
    padding: 10, 
  },
  defaultPlace:{
    justifyContent:'space-between',
    borderColor:grey,
    borderWidth:1,
    borderRadius:8, 
    padding: 10, 
  },
  containerAvailable: {
    padding:15,
    paddingRight:height*.01,
    marginBottom: height*.01,
    width: width*.8
  },
})

export default withTheme(GameScreen);