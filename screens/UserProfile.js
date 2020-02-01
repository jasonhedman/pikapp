import React from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  View,
  TouchableOpacity
} from "react-native";
import { Block } from "galio-framework";

import GameResult from "../components/GameResult";
import TeamMember from "../components/TeamMember";
import SportsTabs from "../components/SportsTabs";
import EditProfile from "../components/EditProfile";

import SlideModal from 'react-native-modal';

import LoadingOverlay from '../components/LoadingOverlay';

const { width, height } = Dimensions.get("window");

import * as firebase from 'firebase';
import 'firebase/firestore';

import {withTheme,Text,Avatar,Button,Headline, Subheading, IconButton} from 'react-native-paper';


const defaultUser = require("../assets/images/defaultUser.jpg")

class UserProfile extends React.Component {
  constructor(){
    super();
    this.state = {
      user: {},
      proPicUrl: null,
      lastThree: new Array(),
      complete:false,
      editModalVisible:false,
      loading:false,
      settingsVisible:false,
      error:false
    }
  }

  getData(){
    firebase.firestore().collection('users').doc(this.props.navigation.getParam('userId',null)).get()
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
          this.setState({error:true})
        }
      })
      .then(() => {
        var cuid = this.props.navigation.getParam('userId',null);
        firebase.storage().ref("profilePictures/" + cuid).getDownloadURL()
          .then((url) => {
            this.setState({proPicUrl: url,complete:true});
          })
          .catch((err) => {
            this.setState({complete:true});
          })
      })
  }
  componentDidMount(){
    this.getData();
    firebase.firestore().collection('users').doc(this.props.navigation.getParam('userId',null)).onSnapshot(() => {
      this.getData();
    })
  }
  
  getLastTen(){
    if(this.state.user.gameHistory != undefined){
      let wins = 0;
      let i;
      for(i = this.state.user.gameHistory.length - 1; i > this.state.user.gameHistory.length - 10; i--){
        if(i < 0){
          return `${wins}-${this.state.user.gameHistory.length - wins}`;
        }
        if(this.state.user.gameHistory[i].win){
          wins++;
        }
      }
      return `${wins}-${10-wins}`
    } else {
      return null;
    }
  }

  addFriend = () => {
    let user = this.state.user;
    user.followers.push(this.props.navigation.getParam('userId',null));
    this.setState({user}, () => {
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
        friendsList:firebase.firestore.FieldValue.arrayUnion(this.props.navigation.getParam('userId',null))
      })
      firebase.firestore().collection('users').doc(this.props.navigation.getParam('userId',null)).update({
        followers:firebase.firestore.FieldValue.arrayUnion(firebase.auth().currentUser.uid)
      })
    })
  }

  removeFriend = () => {
    let user = this.state.user;
    user.friendsList = user.friendsList.filter(friend => friend != this.props.navigation.getParam('userId',null));
    this.setState({user}, () => {
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
        friendsList:firebase.firestore.FieldValue.arrayRemove(this.props.navigation.getParam('userId',null))
      })   
      firebase.firestore().collection('users').doc(this.props.navigation.getParam('userId',null)).update({
        followers:firebase.firestore.FieldValue.arrayRemove(firebase.auth().currentUser.uid)
      }) 
    });
  }

  navToUserProfile = (id) => {
    if(id != firebase.auth().currentUser.uid){
      this.props.navigation.push("UserProfile", {userId:id});
     } else {
      this.props.navigation.navigate('Profile')
     }
  }

  navToUserList = (users, listType) => {
    this.props.navigation.push('UserList',{users,listType});
  }



  render() {
    const fonts = this.props.theme.fontss;
    const colors = this.props.theme.colors;
    if(this.state.complete){
      if(!(this.state.error)){
        return (
          <>
            <View style={{backgroundColor:colors.dBlue,flex:1}}>
              {
                this.state.loading
                ? <LoadingOverlay />
                : null
              }
              
              <ScrollView style={{flex:1,backgroundColor:colors.dBlue}} snapToStart={false}>
                  <Block column style={{height: height*.1,justifyContent:'flex-end'}}>
                      <Button icon='navigate-before' onPress={() => this.props.navigation.goBack()} mode={'text'} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}} style={{marginRight:'auto'}}>
                          Back
                      </Button>
                  </Block>
                <Block style={{marginRight:"auto",marginLeft:"auto",marginBottom:20}} width={width*.9}>
                  <Block center middle style={{marginBottom:height*.025}}>
                    <Headline style={styles.header}>{this.state.user.name}</Headline>
                    <Subheading style={styles.header}>{`@${this.state.user.username}`}</Subheading>
                    <Block row style={{alignItems:'center',marginTop:height*.015,marginBottom:height*.015}}>
                      <Block center middle style={{width:height*.1,height:height*.1,borderRadius:height*.1/2,borderWidth:2,borderColor:this.props.theme.colors.orange,marginBottom:height*.015}}>
                        {
                          this.state.proPicUrl != null
                          ? <Avatar.Image
                              theme={{colors:{primary:colors.dBlue}}}
                              source={{uri:this.state.proPicUrl}}
                              size={height*.1-4}
                            />
                          : <Avatar.Image
                              theme={{colors:{primary:colors.dBlue}}}
                              source={defaultUser}
                              size={height*.1-4}
                            />
                        }
                      </Block>
                      <Block column flex style={{paddingRight:30,paddingLeft:30}}>
                        <Block row flex style={{justifyContent:'space-around'}}>
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
                        {
                          this.state.user.followers.includes(firebase.auth().currentUser.uid)
                          ? <Button mode="contained" onPress={this.removeFriend} dark={true} style={{marginBottom: height*.025,justifyContent:"center",alignItems:"center",borderWidth:1,borderColor:colors.white}} theme={{colors:{primary:colors.dBlue},fonts:{medium:this.props.theme.fonts.regular}}}>
                                  Unfollow
                              </Button>
                          : <Button mode="contained" onPress={this.addFriend} dark={true} style={{marginBottom: height*.025,justifyContent:"center",alignItems:"center"}} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                                  Follow
                              </Button>
                          }
                      </Block>
                    </Block>
                    <Block row style={{width,justifyContent:"space-around",}}>
                      <Block style={styles.statContainer} column center middle>
                        <Subheading style={styles.subheading}>Overall</Subheading>
                        <Headline style={styles.info}>{`${this.state.user.wins}-${this.state.user.losses}`}</Headline>
                      </Block>
                      <Block style={styles.statContainer} column center middle>
                        <Subheading style={styles.subheading}>Points</Subheading>
                        <Headline style={styles.info}>{this.state.user.points}</Headline>
                      </Block>
                      <Block style={styles.statContainer} column center middle>
                        <Subheading style={styles.subheading}>Last 10</Subheading>
                        <Headline style={styles.info}>{this.getLastTen()}</Headline>
                      </Block>
                    </Block>
                  </Block>
                  <Headline style={[styles.header,{marginBottom:height*.015,textAlign:"center"}]}>Stats Breakdown</Headline>
                  <SportsTabs style={{height:100}} user={this.state.user} />
                  <Headline style={[styles.header,{marginBottom:height*.015,textAlign:"center"}]}>Last Three Games</Headline>
                  {
                    this.state.lastThree.length > 0
                    ? (
                      <Block column>
                        {
                          this.state.lastThree.map((game,index) => {
                            return <GameResult navToUserProfile={this.navToUserProfile} game={game} key={index} user={this.props.navigation.getParam('userId',null)} />
                          })
                        }
                      </Block>
                    )
                    : (
                      <Block flex center middle style={{backgroundColor:colors.dBlue, width:width}}>
                        <Block center style={{borderWidth:1,borderColor:colors.orange,borderRadius:8,width:width*.9,padding:10}}>
                          <Headline style={{color:colors.white,fontSize:20,marginTop:height*.025,marginBottom:height*.025,textAlign:'center'}}>{this.state.user.name} has not completed any games.</Headline>
                        </Block>
                      </Block>
                    )
                  }
                </Block>
              </ScrollView>
            </View>
          </>
        );
      } else {
        return (
          <Block flex center middle style={{backgroundColor:colors.dBlue, width:width}}>
            <Block center style={{borderWidth:1,borderColor:colors.orange,borderRadius:8,width:width*.9,padding:10}}>
              <Headline style={{color:colors.white,fontSize:20,marginTop:height*.025,marginBottom:height*.025,textAlign:'center'}}>User does not exist.</Headline>
              <Button
                mode="contained" 
                dark={true}                 
                onPress={() => this.props.navigation.goBack()}
                theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}
                style={{marginBottom:height*.025}}
              > 
                Go Back
              </Button>
            </Block>
          </Block>
        );
      }
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
    marginBottom: height*.025,
    justifyContent:"center",
    alignItems:"center"
  },
  statContainer:{
    borderWidth:1,
    borderRadius:8,
    borderColor: '#E68A54',
    width:width*.29,
    paddingTop:height*.01
  },
  subheading:{
    color:"#83838A",
    fontSize:14,
    marginTop:0
  },
  stat:{
    color:"white",
    marginBottom:10
  },
  info:{
    color:"white",
    fontSize:35,
    marginBottom: 15,
    paddingTop:5
  }
})

export default withTheme(UserProfile);
