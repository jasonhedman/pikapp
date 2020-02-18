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
import ProfilePic from "../components/ProfilePic";
import HeaderBlock from "../components/HeaderBlock";
import ButtonBlock from "../components/ButtonBlock";


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
          let following = doc.data().followers.includes(firebase.auth().currentUser.uid);
          let lastThree = [];
          for(let i = doc.data().gameHistory.length - 1; i >= (doc.data().gameHistory.length >= 3?doc.data().gameHistory.length-3:0);i--){
            firebase.firestore().collection("games").doc(doc.data().gameHistory[i].id).get()
              .then((game) => {
                lastThree.push(game.data());
                this.setState({lastThree});
              });
          }
          this.setState({user:doc.data(),following})
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
    // firebase.firestore().collection('users').doc(this.props.navigation.getParam('userId',null)).onSnapshot(() => {
    //   this.getData();
    // })
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
    user.followers.push(firebase.auth().currentUser.uid);
    this.setState({user,following:true}, () => {
      firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
        friendsList:firebase.firestore.FieldValue.arrayUnion(this.props.navigation.getParam('userId',null))
      })
      firebase.firestore().collection('users').doc(this.props.navigation.getParam('userId',null)).update({
        followers:firebase.firestore.FieldValue.arrayUnion(firebase.auth().currentUser.uid)
      })
    })
  }

  removeFriend = () => {
    this.setState({following:false}, () => {
      let user = this.state.user;
      user.followers = user.followers.filter(friend => friend != firebase.auth().currentUser.uid);
      this.setState({user}, () => {
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
          friendsList:firebase.firestore.FieldValue.arrayRemove(this.props.navigation.getParam('userId',null))
        })   
        firebase.firestore().collection('users').doc(this.props.navigation.getParam('userId',null)).update({
          followers:firebase.firestore.FieldValue.arrayRemove(firebase.auth().currentUser.uid)
        }) 
      });
    })
    
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
              
              <ScrollView style={{flex:1,backgroundColor:colors.dBlue,padding:16}} snapToStart={false}>
                <Block row style={{justifyContent:'flex-start',position:'absolute',top:56,left:0,zIndex:2}}>
                    <Button icon='keyboard-backspace' compact={true} onPress={() => this.props.navigation.goBack()} mode={'text'} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}} style={{marginRight:'auto'}} />
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
                          {
                            this.state.following
                            ? <Button mode="contained" onPress={this.removeFriend} dark={true} style={[styles.button,{borderColor:colors.white}]} contentStyle={{}} theme={{colors:{primary:colors.dBlue},fonts:{medium:this.props.theme.fonts.regular}}}>
                                Unfollow
                              </Button>
                            : <Button mode="contained" onPress={this.addFriend} dark={true} style={[styles.button,{borderColor:colors.orange}]} contentStyle={{}} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
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
                  <Headline style={[styles.header,{marginBottom:16,textAlign:"center"}]}>Stats Breakdown</Headline>
                  <SportsTabs user={this.state.user} />
                  <Headline style={[styles.header,{marginBottom:16,textAlign:"center"}]}>Last Three Games</Headline>
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
                      <Block flex center middle style={{backgroundColor:colors.dBlue, width:width, paddingLeft:16,paddingRight:16}}>
                        <Block center style={{borderWidth:1,borderColor:colors.orange,borderRadius:8,padding:16}}>
                          <Headline style={{color:colors.white,fontSize:20,textAlign:'center'}}>{this.state.user.name} has not completed any games.</Headline>
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
          <Block flex center middle style={{backgroundColor:colors.dBlue, width:width,padding:16}}>
            <Block center style={{borderWidth:1,borderColor:colors.orange,borderRadius:8,padding:16,width:'100%'}}>
              <HeaderBlock text='User does not exist.' backButton={true} backPress={() => this.props.navigation.goBack()} />
              <ButtonBlock text="Go Back" onPress={() => this.props.navigation.goBack()} />
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
    flex:1,
    borderWidth:1,
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

export default withTheme(UserProfile);
