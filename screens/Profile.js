import React from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  View,
  TouchableOpacity,
  Share
} from "react-native";
import { Block } from "galio-framework";

import GameResult from "../components/GameResult";
import TeamMember from "../components/TeamMember";
import SportsTabs from "../components/SportsTabs";
import SportsBreakdown from "../components/SportsBreakdown";
import EditProfile from "../components/EditProfile";
import ProfilePic from "../components/ProfilePic";
import SlideModal from 'react-native-modal';
import LoadingOverlay from '../components/LoadingOverlay';

const { width, height } = Dimensions.get("window");
import Chance from 'chance';

import * as firebase from 'firebase';
import 'firebase/firestore';

import {withTheme,Button,Headline, Subheading, IconButton, Caption} from 'react-native-paper';



class Profile extends React.Component {
  constructor(){
    super();
    this.state = {
      user: {},
      proPicUrl: null,
      lastThree: new Array(),
      complete:false,
      editModalVisible:false,
      loading:false,
      settingsVisible:false
    }
  }

  testUser = () => {
    let sports = {
      basketball: 21,
      spikeball: 21,
      football: 35,
      soccer: 3,
      volleyball: 3
    }
    let chance = new Chance()
    let first = chance.first({nationality:'en'});
    let last = chance.last({nationality:'en'});
    let username;
    switch(chance.integer({min:0, max:6})){
      case 0:
        username = first.toLowerCase() + last.toLowerCase();
        break;
      case 1:
        username = first[0].toLowerCase() + last.toLowerCase();
        break;
      case 2:
        username = first[0].toLowerCase() + last.toLowerCase() + chance.integer({min:1,max:999});
        break;
      case 3:
        username = first[0].toLowerCase() + last[0].toLowerCase() + chance.integer({min:1,max:999});
        break;
      case 4:
        username = first.toLowerCase() + last.toLowerCase() + chance.integer({min:1,max:999});
        break;
      case 5:
        username = first.toLowerCase();
        break;
      case 6:
        username = last.toLowerCase();
    }
    let sportsResults = {
      basketball: {
        wins:0,
        losses:0,
        ptsFor: 0,
        ptsAgainst:0
      },
      football: {
        wins:0,
        losses:0,
        ptsFor: 0,
        ptsAgainst:0
      },
      spikeball: {
        wins:0,
        losses:0,
        ptsFor: 0,
        ptsAgainst:0
      },
      volleyball: {
        wins:0,
        losses:0,
        ptsFor: 0,
        ptsAgainst:0
      },
      soccer: {
        wins:0,
        losses:0,
        ptsFor: 0,
        ptsAgainst:0
      },
    }
    let wins = 0;
    let losses = 0;
    let points = 0;
    for(let i = 0; i < 30; i++){
      let sport = Object.keys(sports)[chance.integer({min:0, max: Object.keys(sports).length-1})]
      let win = chance.bool();
      if(win){
        wins+=1;
        sportsResults[sport].wins += 1;
        points += 5;
        sportsResults[sport].ptsFor += sports[sport];
        sportsResults[sport].ptsAgainst += chance.integer({min:0,max:sports[sport]-1});
      } else {
        losses+=1;
        sportsResults[sport].losses += 1;
        points += -2;
        sportsResults[sport].ptsFor += chance.integer({min:0,max:sports[sport]-1});
        sportsResults[sport].ptsAgainst += sports[sport];
      }
    }
    let user = {
      name: "" + first + " " + last,
      currentGame:null,
      username: username,
      dob: new Date(),
      gameHistory: [],
      wins: wins,
      losses: losses,
      points:points,
      email: first+last+'@mail.com',
      notifications: [],
      sports:sportsResults,
      friendsList:[],
      followers:[],
      created: true
    }
    firebase.auth().createUserWithEmailAndPassword(first+last+'@mail.com','letmein123')
      .then((cred) => {
        firebase.firestore().collection('users').doc(cred.user.uid).set(user)
      })
  }

  getData(){
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
      .then((doc) => {
        if(doc.exists){
          let lastThree = [];
          for(let i = doc.data().gameHistory.length - 1; i >= (doc.data().gameHistory.length >= 3?doc.data().gameHistory.length-3:0);i--){
            firebase.firestore().collection("games").doc(doc.data().gameHistory[i].id).get()
              .then((game) => {
                lastThree.push(game.data());
                this.setState({lastThree});
              });
          }
          this.setState({user:doc.data()})
        } else {
          console.error("No such user")
        }
      })
      .then(() => {
        var cuid = firebase.auth().currentUser.uid;
        firebase.storage().ref("profilePictures/" + cuid).getDownloadURL()
          .then((url) => {
            this.setState({proPicUrl: url,complete:true});
          })
          .catch((err) => {
            this.setState({complete:true});
          })
      })
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
    // this.testUser();
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).onSnapshot(() => {
      this.getData();
    })
  }

  setImage = (proPicUrl,func) => {
    this.setState({proPicUrl}, func);
  }
  
  // getLastTen(){
  //   if(this.state.user.gameHistory != undefined){
  //     let wins = 0;
  //     let i;
  //     for(i = this.state.user.gameHistory.length - 1; i > this.state.user.gameHistory.length - 10; i--){
  //       if(i < 0){
  //         return `${wins}-${this.state.user.gameHistory.length - wins}`;
  //       }
  //       if(this.state.user.gameHistory[i].win){
  //         wins++;
  //       }
  //     }
  //     return `${wins}-${10-wins}`
  //   } else {
  //     return null;
  //   }
  // }

  signOut = () => {
    firebase.auth().signOut()
      .then(() => {
        this.props.navigation.navigate('AuthLoading');
      })
  }

  toChangePassword = () => {
    this.setState({settingsVisible:false}, () => {
      this.props.navigation.navigate('ChangePassword')
    })
  }

  toChangeEmail = () => {
    this.setState({settingsVisible:false}, () => {
      this.props.navigation.navigate('ChangeEmail')
    })
  }

  navToUserProfile = (id) => {
    if(id != firebase.auth().currentUser.uid){
      this.props.navigation.navigate("UserProfile", {userId:id});
     } else {
      this.props.navigation.navigate('Profile')
     }
  }

  navToUserList = (users, listType) => {
    this.props.navigation.navigate('UserList',{users,listType});
  }


  render() {
    const colors = this.props.theme.colors;
    if(this.state.complete){
      return (
        <>
          <SlideModal
            transparent={true}
            isVisible={this.state.editModalVisible}
            style={{width,height,marginLeft:0,padding:0}}
            backdropColor={colors.dBlue}
            backdropOpacity={1}
            coverScreen={true}
          >
            <EditProfile close={() => this.setState({editModalVisible:false})} setImage={this.setImage} finishUpload={() => {this.setState({loading:false})}} closeModal={(func) => this.setState({editModalVisible:false,loading:true},func)} user={this.state.user} proPicUrl={this.state.proPicUrl} />
          </SlideModal>
          <SlideModal
            animationType="slide"
            transparent={true}
            isVisible={this.state.settingsVisible}
            onBackdropPress={() => this.setState({settingsVisible:false})}
            style={{width,marginLeft:0,padding:0,marginBottom:0, justifyContent:'flex-end',zIndex:100}}
            backdropColor={colors.dBlue}
            coverScreen={false}

          >
            <Block center middle style={{width,backgroundColor:colors.dBlue,borderTopWidth:2,borderTopColor:colors.orange, alignItems:'center',flex:0, padding:16}}>
                <Button mode="contained" dark={true} style={[styles.button]} onPress={this.toChangePassword} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                  Change Password
                </Button>
                <Button mode="contained" dark={true} style={[styles.button]} onPress={this.toChangeEmail} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                  Change Email
                </Button>
                <Button mode="text" dark={true} style={[styles.button,{borderWidth:.5,borderRadius:8, borderColor:colors.orange,marginBottom:0}]} onPress={this.signOut} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                  Sign Out
                </Button>
            </Block>
          </SlideModal>
          <View style={{backgroundColor:colors.dBlue,flex:1}}>
            {
              this.state.loading
              ? <LoadingOverlay />
              : null
            }
            
            <ScrollView style={{flex:1,backgroundColor:colors.dBlue,padding:16}} snapToStart={false}>
              <Block row style={{justifyContent:'flex-end',position:'absolute',top:56,right:0,zIndex:2}}>
                  <IconButton color={colors.white} icon={'settings'} onPress={() => this.setState({settingsVisible:true})}></IconButton>
              </Block>
              <Block style={{marginTop:56,marginBottom:32}}>
                <Block center middle style={{marginBottom:16}}>
                  <Headline style={styles.header}>{this.state.user.name}</Headline>
                  <Subheading style={styles.header}>{`@${this.state.user.username}`}</Subheading>
                  <Block row style={{alignItems:'center',marginTop:16,marginBottom:16}}>
                    <ProfilePic size={80} proPicUrl={this.state.proPicUrl}/>
                    <Block column flex style={{paddingRight:32,paddingLeft:32}}>
                      <Block row flex style={{justifyContent:'space-around', marginBottom:8}}>
                        <TouchableOpacity onPress={() => this.navToUserList(this.state.user.followers, "Followers")}>
                          <Block column center middle>
                            <Subheading style={styles.subheading}>Followers</Subheading>
                            <Headline style={styles.stat}>{this.state.user.followers.length}</Headline>
                          </Block>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.navToUserList(this.state.user.friendsList, "Following")}>
                          <Block column center middle>
                            <Subheading style={styles.subheading}>Following</Subheading>
                            <Headline style={styles.stat}>{this.state.user.friendsList.length}</Headline>
                          </Block>
                        </TouchableOpacity>
                      </Block>
                      <Button mode="contained" onPress={() => this.setState({editModalVisible:true})} style={styles.button} dark={true} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                        Edit Profile
                      </Button>
                    </Block>
                  </Block>
                  <Block row style={{width,justifyContent:"space-around",}}>
                    {/* <Block style={styles.statContainer} column center middle>
                      <Subheading style={styles.subheading}>Overall</Subheading>
                      <Headline style={styles.info}>{`${this.state.user.wins}-${this.state.user.losses}`}</Headline>
                    </Block> */}
                    <Block style={styles.statContainer} column center middle>
                      <Subheading style={styles.subheading}>Points</Subheading>
                      <Headline style={styles.info}>{this.state.user.points}</Headline>
                    </Block>
                    <Block style={styles.statContainer} column center middle>
                      <Subheading style={styles.subheading}>Games Played</Subheading>
                      <Headline style={styles.info}>{this.state.user.gamesPlayed}</Headline>
                    </Block>
                  </Block>
                </Block>
                <Headline style={[styles.header,{marginBottom:16,textAlign:"center"}]}>Sports Breakdown</Headline>
                <SportsBreakdown user={this.state.user} />
                {/* <SportsTabs user={this.state.user} /> */}
                <Headline style={[styles.header,{marginBottom:16,textAlign:"center"}]}>Last Three Games</Headline>
                {
                  this.state.lastThree.length > 0
                  ? (
                    <Block column>
                      {
                        this.state.lastThree.map((game,index) => {
                          return <GameResult game={game} key={index} user={firebase.auth().currentUser.uid} navToUserProfile={this.navToUserProfile}/>
                        })
                      }
                    </Block>
                  )
                  : (
                    <Block flex center middle style={{backgroundColor:colors.dBlue, width:width, paddingLeft:16,paddingRight:16}}>
                      <Block center style={{borderWidth:1,borderColor:colors.orange,borderRadius:8,padding:16, width:'100%'}}>
                        <Headline style={{color:colors.white,fontSize:20,marginBottom:8,textAlign:'center'}}>You have not completed any games.</Headline>
                        <Button
                          mode="contained" 
                          dark={true}                 
                          onPress={() => this.props.navigation.navigate("MapStack")}
                          theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}
                        > 
                          Find a Game
                        </Button>
                      </Block>
                    </Block>
                  )
                }
              </Block>
            </ScrollView>
            <Block style={{borderTopWidth:1, borderTopColor:colors.orange, paddingTop:5}}>
              <Caption style={{color:colors.grey,textAlign:"center"}}>
                For Bonus Points:
              </Caption>
              <Block width={width}>
                <Button mode="contained" dark={true} onPress={() =>this.onShare()} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}} style={{marginRight:'auto',marginLeft:'auto'}}>
                  Share
                </Button>
              </Block>
              
            </Block>
          </View>
        </>
      );
    } else {
      return (
        <Block flex style={{backgroundColor:colors.dBlue}}>

        </Block>
      )
    }
  }
}
const styles = StyleSheet.create({
  header: {
    color: "white"
  },
  button: {
    marginBottom: 12,
  },
  modalButton: {
    marginBottom: 12,
    padding:4,
    justifyContent:"center",
    alignItems:"center"
  },
  statContainer:{
    borderWidth:1,
    borderRadius:8,
    flex:1,
    borderColor: '#E68A54',
    padding:8,
    marginRight:8,
    marginLeft:8
  },
  subheading:{
    color:"#83838A",
    fontSize:14,
    marginTop:0
  },
  stat:{
    color:"white",
  },
  info:{
    color:"white",
    fontSize:35,
    paddingTop:5
  }
})

export default withTheme(Profile);
