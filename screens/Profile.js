import React from "react";
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  View
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

import {TabView,SceneMap} from 'react-native-tab-view';

const defaultUser = require("../assets/images/defaultUser.jpg")

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
  componentDidMount(){
    this.getData();
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).onSnapshot(() => {
      this.getData();
    })
  }

  setImage = (proPicUrl,func) => {
    this.setState({proPicUrl}, func);
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

  render() {
    const fonts = this.props.theme.fontss;
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
            style={{width,marginLeft:0,padding:0,marginTop: height*.7,marginBottom:0}}
            backdropColor={colors.dBlue}
          >
            <Block flex center middle style={{width,backgroundColor:colors.dBlue,borderTopWidth:2,borderTopColor:colors.orange, alignItems:'center'}}>
                <Button mode="contained" dark={true} style={[styles.button]} onPress={this.toChangePassword} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                  Change Password
                </Button>
                <Button mode="contained" dark={true} style={[styles.button]} onPress={this.toChangeEmail} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                  Change Email
                </Button>
                <Button mode="text" dark={true} style={[styles.button,{borderWidth:.5,borderRadius:8, borderColor:colors.orange}]} onPress={this.signOut} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
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
            
            <ScrollView style={{flex:1,backgroundColor:colors.dBlue}} snapToStart={false}>
              <Block row style={{justifyContent:'flex-end',position:'absolute',top:height*.1,right:0,zIndex:2}}>
                  <IconButton color={colors.white} icon={'settings'} onPress={() => this.setState({settingsVisible:true})}></IconButton>
              </Block>
              <Block style={{marginRight:"auto",marginLeft:"auto",marginTop:height*.1}} width={width*.9}>
                <Block center middle style={{marginBottom:height*.025}}>
                  <Headline style={styles.header}>{this.state.user.name}</Headline>
                  <Subheading style={styles.header}>{`@${this.state.user.username}`}</Subheading>
                  <Block center middle style={{width:height*.1,height:height*.1,borderRadius:height*.05,borderWidth:2,borderColor:this.props.theme.colors.orange,marginBottom:height*.015}}>
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
                  <Button mode="contained" onPress={() => this.setState({editModalVisible:true})} style={styles.button} dark={true} theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}>
                    Edit Profile
                  </Button>
                  <Block row style={{width,justifyContent:"space-around",}}>
                    <Block style={styles.statContainer} column center middle>
                      <Subheading style={styles.subheading}>Overall</Subheading>
                      <Headline style={styles.info}>{`${this.state.user.wins}-${this.state.user.losses}`}</Headline>
                    </Block>
                    <Block style={styles.statContainer} column center middle>
                      <Subheading style={styles.subheading}>Last 10 Games</Subheading>
                      <Headline style={styles.info}>6-4</Headline>
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
                          return <GameResult game={game} key={index} user={firebase.auth().currentUser.uid} />
                        })
                      }
                    </Block>
                  )
                  : (
                    <Block flex center middle style={{backgroundColor:colors.dBlue, width:width}}>
                      <Block center style={{borderWidth:1,borderColor:colors.orange,borderRadius:8,width:width*.9}}>
                        <Headline style={{color:colors.white,fontSize:20,marginTop:height*.025,marginBottom:height*.025,textAlign:'center'}}>You have not completed any games.</Headline>
                        <Button
                          mode="contained" 
                          dark={true}                 
                          onPress={() => this.props.navigation.navigate("MapStack")}
                          theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}
                          style={{marginBottom:height*.025}}
                        > 
                          Find a Game
                        </Button>
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
        <Block flex style={{backdropColor:colors.dBlue}}>

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
  },
  info:{
    color:"white",
    fontSize:35,
    marginBottom: 15,
    paddingTop:5
  }
})

export default withTheme(Profile);
