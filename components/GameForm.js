import React from "react";
import {
  StyleSheet,
  Dimensions,
} from "react-native";
import { Block} from "galio-framework";

import { argonTheme } from "../constants";

import {withTheme,Headline,Button,Menu,IconButton} from 'react-native-paper';

import * as Location from 'expo-location';

import * as firebase from 'firebase';
import 'firebase/firestore';
const { width, height } = Dimensions.get("screen");

class GameForm extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      sport: null,
      intensity: null,
      teamSize: null,
      user:null
    }
  }

  componentDidMount(){
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
      .then((user) => {
        this.setState({user:user.data()})
      })
  }


  onCreate = () => {
    Location.getCurrentPositionAsync()
      .then((pos)=>{
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
          .then((doc) => {
            if(doc.exists){
              firebase.firestore().collection('games').add({
                intensity: this.state.intensity,
                location: pos.coords,
                sport:this.state.sport,
                teamSize: this.state.teamSize,
                owner: doc.id,
                ownerUsername: doc.data().username,
                teams: {
                  home: [{
                    id: firebase.auth().currentUser.uid,
                    name: this.state.user.name,
                    username: this.state.user.username,
                    record: `${this.state.user.wins}-${this.state.user.losses}`,
                    dob:this.state.user.dob
                  }],
                  away: []
                },
                gameState: "created",
                updated:new Date(),
                time: new Date()
              })
                .then((game) => {
                  firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
                    currentGame: game.id
                  })
                    .then(() => {
                      firebase.firestore().collection('notifications').add({
                        game: {
                          intensity: this.state.intensity,
                          location: pos.coords,
                          sport:this.state.sport,
                          teamSize: this.state.teamSize,
                          owner: doc.id,
                          ownerUsername: doc.data().username,
                          gameState: "created"
                        },
                        userId:firebase.auth().currentUser.uid,
                        action:"created",
                        user:this.state.user,
                        time: new Date(),
                        date: new Date().toDateString()
                      })
                      this.props.navToGame();
                    })
                })
            } else {
              console.error("No such user")
            }
          })
    })

  }

  render() {
    const colors = this.props.theme.colors;
    return (
      <Block middle center styles={[styles.registerContainer]}>
        <Headline style={{color:colors.white, marginTop:height*.015, height:height*.05, marginBottom:height*.015}}>
          Create Game
        </Headline>
        <IconButton color={colors.orange} icon="close" size={15} style={{position:'absolute',top:0,right:0}} onPress={this.props.closeModal}/>
        <Menu
          visible={this.state.sportVisible}
          onDismiss={() => {this.setState({sportVisible:false})}}
          style={{marginLeft:(width*.8-120)/2,marginTop:height*.05}}
          anchor={
              <Block height={height*.05} width={width*.8} style={{ marginBottom: height*.025 }}>
                  <Button style={{height:height*.05,display:"flex",justifyContent:"center",alignItems:"center"}} dark={false} icon="arrow-drop-down" mode="text" onPress={() => {this.setState({sportVisible:true})}} theme={{colors:{primary:colors.white},fonts:{medium:this.props.theme.fonts.regular}}}>
                      {this.state.sport != null ? this.state.sport : "Sport"}
                  </Button>
              </Block>
          }
        >
          <Menu.Item onPress={() => {this.setState({sport:"basketball",sportVisible:false})}} title="Basketball" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />
          <Menu.Item onPress={() => {this.setState({sport:"soccer",sportVisible:false})}} title="Soccer" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />
          <Menu.Item onPress={() => {this.setState({sport:"spikeball",sportVisible:false})}} title="Spikeball" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />
          <Menu.Item onPress={() => {this.setState({sport:"football",sportVisible:false})}} title="Football" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />
          <Menu.Item onPress={() => {this.setState({sport:"volleyball",sportVisible:false})}} title="Volleyball" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />
        </Menu>
        <Menu
          visible={this.state.intensityVisible}
          onDismiss={() => {this.setState({intensityVisible:false})}}
          style={{marginLeft:(width*.8-120)/2,marginTop:height*.05}}
          anchor={
              <Block height={height*.05} width={width*.8} style={{ marginBottom: height*.025 }}>
                  <Button style={{height:height*.05,display:"flex",justifyContent:"center",alignItems:"center"}} dark={false} icon="arrow-drop-down" mode="text" onPress={() => {this.setState({intensityVisible:true})}} theme={{colors:{primary:colors.white},fonts:{medium:this.props.theme.fonts.regular}}}>
                      {this.state.intensity != null ? this.state.intensity : "Intensity"}
                  </Button>
              </Block>
          }
        >
          <Menu.Item onPress={() => {this.setState({intensity:"Casual",intensityVisible:false})}} title="Casual" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />
          <Menu.Item onPress={() => {this.setState({intensity:"Intermediate",intensityVisible:false})}} title="Intermediate" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />
          <Menu.Item onPress={() => {this.setState({intensity:"Competitive",intensityVisible:false})}} title="Competitive" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />
        </Menu>
        <Menu
          visible={this.state.tsVisible}
          onDismiss={() => {this.setState({tsVisible:false})}}
          style={{marginLeft:(width*.8-120)/2,marginTop:height*.05}}
          anchor={
              <Block height={height*.05} width={width*.8} style={{ marginBottom: height*.025 }}>
                  <Button style={{height:height*.05,display:"flex",justifyContent:"center",alignItems:"center"}} dark={false} icon="arrow-drop-down" mode="text" onPress={() => {this.setState({tsVisible:true})}} theme={{colors:{primary:colors.white},fonts:{medium:this.props.theme.fonts.regular}}}>
                      {this.state.teamSize != null ? this.state.teamSize : "Team Size"}
                  </Button>
              </Block>
          }
        >
          {
            this.state.sport == 'basketball'
            ? [
              <Menu.Item onPress={() => {this.setState({teamSize:2,tsVisible:false})}} title="2" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
              <Menu.Item onPress={() => {this.setState({teamSize:3,tsVisible:false})}} title="3" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
              <Menu.Item onPress={() => {this.setState({teamSize:4,tsVisible:false})}} title="4" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
              <Menu.Item onPress={() => {this.setState({teamSize:5,tsVisible:false})}} title="5" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
            ]
            : this.state.sport == 'soccer'
            ? [
              <Menu.Item onPress={() => {this.setState({teamSize:6,tsVisible:false})}} title="6" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
              <Menu.Item onPress={() => {this.setState({teamSize:7,tsVisible:false})}} title="7" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
              <Menu.Item onPress={() => {this.setState({teamSize:8,tsVisible:false})}} title="8" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
              <Menu.Item onPress={() => {this.setState({teamSize:9,tsVisible:false})}} title="9" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
              <Menu.Item onPress={() => {this.setState({teamSize:10,tsVisible:false})}} title="10" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
              <Menu.Item onPress={() => {this.setState({teamSize:11,tsVisible:false})}} title="11" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,

            ]
            : this.state.sport == 'spikeball'
            ? [
              <Menu.Item onPress={() => {this.setState({teamSize:2,tsVisible:false})}} title="2" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
            ]
            : this.state.sport == 'football'
            ? [
              <Menu.Item onPress={() => {this.setState({teamSize:3,tsVisible:false})}} title="3" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
              <Menu.Item onPress={() => {this.setState({teamSize:4,tsVisible:false})}} title="4" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
              <Menu.Item onPress={() => {this.setState({teamSize:5,tsVisible:false})}} title="5" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
              <Menu.Item onPress={() => {this.setState({teamSize:6,tsVisible:false})}} title="6" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
            ]
            : this.state.sport == 'volleyball'
            ? [
              <Menu.Item onPress={() => {this.setState({teamSize:3,tsVisible:false})}} title="3" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
              <Menu.Item onPress={() => {this.setState({teamSize:4,tsVisible:false})}} title="4" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
              <Menu.Item onPress={() => {this.setState({teamSize:6,tsVisible:false})}} title="6" theme={{colors:{text:colors.dBlue}}} style={{width:120}} />,
            ]
            : <Menu.Item title="Choose a Sport" disabled={true} theme={{colors:{text:colors.dBlue}}} style={{width:120}} />
          }
        </Menu>
        <Button
          disabled={this.state.sport == null || this.state.intensity == null || this.state.teamSize == null}
          onPress={this.onCreate}
          mode="contained"
          theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}} dark={true} 
          style={[{}, this.state.sport == null || this.state.intensity == null || this.state.teamSize == null ? {opacity: .3, backgroundColor:colors.orange} : null]} 
        >
          Create Game
        </Button>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  registerContainer: {
    width: width * 0.8,
    height: height * 0.4,
    borderRadius: 8,
    shadowColor: argonTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 1,
    overflow: "hidden"
  }
});

export default withTheme(GameForm);
