import React from 'react';

import {StyleSheet,Dimensions,TouchableWithoutFeedback,Keyboard} from 'react-native';

import { Block} from "galio-framework";

import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

import {Button,Headline,withTheme, Text} from 'react-native-paper';
import NumericInput from 'react-native-numeric-input';
import HeaderBlock from './HeaderBlock';
import ButtonBlock from './ButtonBlock';

const { width, height } = Dimensions.get("screen");


class ScoreForm extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      home:0,
      away:0,
    }
  }

  submitGame = () => {
    this.props.setModalVisible(false);
    this.props.navToMap();
    let docRef = firebase.firestore().collection("games").doc(this.props.game.id);
    docRef.update({
      result: {
        home: parseInt(this.state.home),
        away: parseInt(this.state.away)
      },
      gameState:"complete",
      winningTeam: parseInt(this.state.home) > parseInt(this.state.away) ? "home" : "away"
    })
    .then(() => {
      let homeWin = parseInt(this.state.home) > parseInt(this.state.away);
      docRef.get()
        .then((doc) => {
          if(this.props.game.sport == "basketball"){
            doc.data().teams.home.forEach((player) => {
              firebase.firestore().collection("users").doc(player.id).update({
                currentGame: null,
                wins: firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                losses: firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                points: firebase.firestore.FieldValue.increment(homeWin ? 5 : -2),
                gameHistory: firebase.firestore.FieldValue.arrayUnion({
                  id: doc.id,
                  win:homeWin
                }),
                "sports.basketball.wins": firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                "sports.basketball.losses": firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                "sports.basketball.ptsAgainst": firebase.firestore.FieldValue.increment(parseInt(this.state.away)),
                "sports.basketball.ptsFor": firebase.firestore.FieldValue.increment(parseInt(this.state.home)),
              })
            })
            doc.data().teams.away.forEach((player) => {
              firebase.firestore().collection("users").doc(player.id).update({
                currentGame: null,
                wins: firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                losses: firebase.firestore.FieldValue.increment(!homeWin ? 0 : 1),
                points: firebase.firestore.FieldValue.increment(!homeWin ? 5 : -2),
                gameHistory: firebase.firestore.FieldValue.arrayUnion({
                  id: doc.id,
                  win:!homeWin
                }),
                "sports.basketball.wins": firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                "sports.basketball.losses": firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                "sports.basketball.ptsAgainst": firebase.firestore.FieldValue.increment(parseInt(this.state.home)),
                "sports.basketball.ptsFor": firebase.firestore.FieldValue.increment(parseInt(this.state.away)),
              })
            })
          } else if(this.props.game.sport == "spikeball"){
            doc.data().teams.home.forEach((player) => {
              firebase.firestore().collection("users").doc(player.id).update({
                currentGame: null,
                wins: firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                losses: firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                points: firebase.firestore.FieldValue.increment(homeWin ? 5 : -2),
                gameHistory: firebase.firestore.FieldValue.arrayUnion({
                  id: doc.id,
                  win:homeWin
                }),
                "sports.spikeball.wins": firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                "sports.spikeball.losses": firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                "sports.spikeball.ptsAgainst": firebase.firestore.FieldValue.increment(parseInt(this.state.away)),
                "sports.spikeball.ptsFor": firebase.firestore.FieldValue.increment(parseInt(this.state.home)),
              })
            })
            doc.data().teams.away.forEach((player) => {
              firebase.firestore().collection("users").doc(player.id).update({
                currentGame: null,
                wins: firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                losses: firebase.firestore.FieldValue.increment(!homeWin ? 0 : 1),
                points: firebase.firestore.FieldValue.increment(!homeWin ? 5 : -2),
                gameHistory: firebase.firestore.FieldValue.arrayUnion({
                  id: doc.id,
                  win:!homeWin
                }),
                "sports.spikeball.wins": firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                "sports.spikeball.losses": firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                "sports.spikeball.ptsAgainst": firebase.firestore.FieldValue.increment(parseInt(this.state.home)),
                "sports.spikeball.ptsFor": firebase.firestore.FieldValue.increment(parseInt(this.state.away)),
              })
            })
          } else if(this.props.game.sport == "football"){
            doc.data().teams.home.forEach((player) => {
              firebase.firestore().collection("users").doc(player.id).update({
                currentGame: null,
                wins: firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                losses: firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                points: firebase.firestore.FieldValue.increment(homeWin ? 5 : -2),
                gameHistory: firebase.firestore.FieldValue.arrayUnion({
                  id: doc.id,
                  win:homeWin
                }),
                "sports.football.wins": firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                "sports.football.losses": firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                "sports.football.ptsAgainst": firebase.firestore.FieldValue.increment(parseInt(this.state.away)),
                "sports.football.ptsFor": firebase.firestore.FieldValue.increment(parseInt(this.state.home)),
              })
            })
            doc.data().teams.away.forEach((player) => {
              firebase.firestore().collection("users").doc(player.id).update({
                currentGame: null,
                wins: firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                losses: firebase.firestore.FieldValue.increment(!homeWin ? 0 : 1),
                points: firebase.firestore.FieldValue.increment(!homeWin ? 5 : -2),
                gameHistory: firebase.firestore.FieldValue.arrayUnion({
                  id: doc.id,
                  win:!homeWin
                }),
                "sports.football.wins": firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                "sports.football.losses": firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                "sports.football.ptsAgainst": firebase.firestore.FieldValue.increment(parseInt(this.state.home)),
                "sports.football.ptsFor": firebase.firestore.FieldValue.increment(parseInt(this.state.away)),
              })
            })
          } else if(this.props.game.sport == "soccer"){
            doc.data().teams.home.forEach((player) => {
              firebase.firestore().collection("users").doc(player.id).update({
                currentGame: null,
                wins: firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                losses: firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                points: firebase.firestore.FieldValue.increment(homeWin ? 5 : -2),
                gameHistory: firebase.firestore.FieldValue.arrayUnion({
                  id: doc.id,
                  win:homeWin
                }),
                "sports.soccer.wins": firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                "sports.soccer.losses": firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                "sports.soccer.ptsAgainst": firebase.firestore.FieldValue.increment(parseInt(this.state.away)),
                "sports.soccer.ptsFor": firebase.firestore.FieldValue.increment(parseInt(this.state.home)),
              })
            })
            doc.data().teams.away.forEach((player) => {
              firebase.firestore().collection("users").doc(player.id).update({
                currentGame: null,
                wins: firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                losses: firebase.firestore.FieldValue.increment(!homeWin ? 0 : 1),
                points: firebase.firestore.FieldValue.increment(!homeWin ? 5 : -2),
                gameHistory: firebase.firestore.FieldValue.arrayUnion({
                  id: doc.id,
                  win:!homeWin
                }),
                "sports.soccer.wins": firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                "sports.soccer.losses": firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                "sports.soccer.ptsAgainst": firebase.firestore.FieldValue.increment(parseInt(this.state.home)),
                "sports.soccer.ptsFor": firebase.firestore.FieldValue.increment(parseInt(this.state.away)),
              })
            })
          } else if(this.props.game.sport == "volleyball"){
            doc.data().teams.home.forEach((player) => {
              firebase.firestore().collection("users").doc(player.id).update({
                currentGame: null,
                wins: firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                losses: firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                points: firebase.firestore.FieldValue.increment(homeWin ? 5 : -2),
                gameHistory: firebase.firestore.FieldValue.arrayUnion({
                  id: doc.id,
                  win:homeWin
                }),
                "sports.volleyball.wins": firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                "sports.volleyball.losses": firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                "sports.volleyball.ptsAgainst": firebase.firestore.FieldValue.increment(parseInt(this.state.away)),
                "sports.volleyball.ptsFor": firebase.firestore.FieldValue.increment(parseInt(this.state.home)),
              })
            })
            doc.data().teams.away.forEach((player) => {
              firebase.firestore().collection("users").doc(player.id).update({
                currentGame: null,
                wins: firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                losses: firebase.firestore.FieldValue.increment(!homeWin ? 0 : 1),
                points: firebase.firestore.FieldValue.increment(!homeWin ? 5 : -2),
                gameHistory: firebase.firestore.FieldValue.arrayUnion({
                  id: doc.id,
                  win:!homeWin
                }),
                "sports.volleyball.wins": firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                "sports.volleyball.losses": firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                "sports.volleyball.ptsAgainst": firebase.firestore.FieldValue.increment(parseInt(this.state.home)),
                "sports.volleyball.ptsFor": firebase.firestore.FieldValue.increment(parseInt(this.state.away)),
              })
            })
          } else if(this.props.game.sport == "rugby"){
            doc.data().teams.home.forEach((player) => {
              firebase.firestore().collection("users").doc(player.id).update({
                currentGame: null,
                wins: firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                losses: firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                points: firebase.firestore.FieldValue.increment(homeWin ? 5 : -2),
                gameHistory: firebase.firestore.FieldValue.arrayUnion({
                  id: doc.id,
                  win:homeWin
                }),
                "sports.rugby.wins": firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                "sports.rugby.losses": firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                "sports.rugby.ptsAgainst": firebase.firestore.FieldValue.increment(parseInt(this.state.away)),
                "sports.rugby.ptsFor": firebase.firestore.FieldValue.increment(parseInt(this.state.home)),
              })
            })
            doc.data().teams.away.forEach((player) => {
              firebase.firestore().collection("users").doc(player.id).update({
                currentGame: null,
                wins: firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                losses: firebase.firestore.FieldValue.increment(!homeWin ? 0 : 1),
                points: firebase.firestore.FieldValue.increment(!homeWin ? 5 : -2),
                gameHistory: firebase.firestore.FieldValue.arrayUnion({
                  id: doc.id,
                  win:!homeWin
                }),
                "sports.rugby.wins": firebase.firestore.FieldValue.increment(!homeWin ? 1 : 0),
                "sports.rugby.losses": firebase.firestore.FieldValue.increment(homeWin ? 1 : 0),
                "sports.rugby.ptsAgainst": firebase.firestore.FieldValue.increment(parseInt(this.state.home)),
                "sports.rugby.ptsFor": firebase.firestore.FieldValue.increment(parseInt(this.state.away)),
              })
            })
          }
        })
    });
  }

  onHomeChange = (home) => {
    this.setState({home});
  }

  onAwayChange = (away) => {
    this.setState({away});
  }

  render(){
    const colors = this.props.theme.colors;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Block center middle style={{width:'100%',padding:0}}>
          <HeaderBlock text='Final Score' backButton={true} backPress={() => this.props.setModalVisible(false)}/>
          <Block row>
            <Block flex column style={{marginRight:8,alignItems:'center'}}>
              <Text style={{color:colors.white,marginBottom:12}}>Home</Text>
              <NumericInput
                value={this.state.home}
                onChange={this.onHomeChange}
                minValue={0}
                maxValue={21}
                borderColor={colors.orange}
                rounded={true}
                editable={false}
                rightButtonBackgroundColor={colors.dBlue}
                leftButtonBackgroundColor={colors.dBlue}
                textColor={colors.white}
                totalHeight={42}
                iconStyle={{color:colors.white}}
                inputStyle={{fontFamily:this.props.theme.fonts.regular.fontFamily}}
                containerStyle={{marginBottom:12}}
              />
              {
                this.props.game.teams.home.map((user,index) => {
                  return (
                    <Block middle center row style={{marginBottom:12,padding: 4, justifyContent:"space-between", width:"100%"}} key={index}>
                      <Block column >
                        <Text style={{color:"#FFF"}}>{user.name}</Text>
                        <Text style={{color:"#FFF"}}>{"@" + user.username}</Text>
                      </Block>
                      <Text style={{color:"#FFF"}}>{user.record}</Text>
                    </Block>
                  );
                })
              }
            </Block>
            <Block flex column style={{marginLeft:8, alignItems:'center'}}>
              <Text style={{color:colors.white,marginBottom:12}}>Away</Text>
              <NumericInput
                value={this.state.away}
                onChange={this.onAwayChange}
                minValue={0}
                maxValue={21}
                borderColor={colors.orange}
                rounded={true}
                editable={false}
                rightButtonBackgroundColor={colors.dBlue}
                leftButtonBackgroundColor={colors.dBlue}
                textColor={colors.white}
                totalHeight={42}
                iconStyle={{color:colors.white}}
                inputStyle={{fontFamily:this.props.theme.fonts.regular.fontFamily}}
                containerStyle={{marginBottom:12}}
              />
              {
                this.props.game.teams.away.map((user,index) => {
                  return (
                    <Block middle center row style={{marginBottom:12,padding: 4, justifyContent:"space-between", width:"100%"}} key={index}>
                      <Block column >
                        <Text style={{color:"#FFF"}}>{user.name}</Text>
                        <Text style={{color:"#FFF"}}>{"@" + user.username}</Text>
                      </Block>
                      <Text style={{color:"#FFF"}}>{user.record}</Text>
                    </Block>
                  );
                })
              }
            </Block>
          </Block>
          <ButtonBlock text='Submit Score' onPress={this.submitGame} disabled={this.state.home == this.state.away} disabledStyles={{opacity: .3, backgroundColor:colors.orange}} />
        </Block>
      </TouchableWithoutFeedback>
    );
  }
}

export default withTheme(ScoreForm)