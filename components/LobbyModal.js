import React from 'react';
import {
  StyleSheet,
  Dimensions
} from 'react-native'
import { Block } from "galio-framework";
import TeamMember from './TeamMember';

import {getDistance} from 'geolib';

import {Headline, withTheme,Subheading,Button} from 'react-native-paper';

import moment from 'moment';

const { width, height } = Dimensions.get("screen");

class LobbyModal extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    console.log();
    const colors = this.props.theme.colors;
    let marker = this.props.marker;
    var homeTeam = [];
    for(let i = 0; i < marker.teamSize; i++){
      if(marker.teams.home.length > i){
        homeTeam.push(<TeamMember key={Math.ceil(Math.random()*1000)} user={marker.teams.home[i]} />);
      } else {
        homeTeam.push(<TeamMember key={Math.ceil(Math.random()*1000)} user={null} />);
      }
    }
    var awayTeam = [];
    for(let i = 0; i < marker.teamSize; i++){
      if(marker.teams.away.length > i){
        awayTeam.push(<TeamMember key={Math.ceil(Math.random()*1000)} user={marker.teams.away[i]} />);
      } else {
        awayTeam.push(<TeamMember key={Math.ceil(Math.random()*1000)} user={null} />);
      }
    }
    return (
      <Block flex column style={[styles.modalContainer,{marginTop:height*(1-(.290+.075*marker.teamSize)),backgroundColor:colors.dBlue,borderTopWidth:2,borderTopColor:colors.orange}]}>
        <Headline style={{color:colors.white,textAlign:"center",marginTop:height*.025,height:height*.05}}>{`${marker.intensity} ${marker.sport[0].toUpperCase() + marker.sport.substring(1)}`}</Headline>
        <Subheading style={{color:colors.grey,textAlign:"center",height:height*.03,marginBottom:height*.01}}>{`Owner: @${marker.ownerUsername}`}</Subheading>
        <Subheading style={{color:colors.grey,textAlign:"center",height:height*.03,marginBottom:height*.03}}>{`Created ${moment.unix(parseInt(marker.time.seconds)).fromNow()}`}</Subheading>
        <Block flex row>
          <Block flex column>
            {homeTeam}
            <Button 
              mode="contained" 
              dark={true}
              disabled={!(marker.teams.home.length < marker.teamSize && marker.gameState == 'created' && this.props.user.currentGame == null && (getDistance(this.props.userLoc, this.props.marker.location)* 0.000621371) < 2)} 
              onPress={() => {this.props.addToTeam(marker.id, 'home')}}
              style={[{width:width*.45, marginLeft:width*.025}, !(marker.teams.home.length < marker.teamSize && marker.gameState == 'created' && this.props.user.currentGame == null && (getDistance(this.props.userLoc, this.props.marker.location)* 0.000621371) < 2) ? styles.disabled : null]}
              theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}
            >
              Join Team
            </Button>
          </Block>
          <Block flex column>
            {awayTeam}
            <Button 
              mode="contained" 
              dark={true}
              disabled={!(marker.teams.away.length < marker.teamSize && marker.gameState == 'created' && this.props.user.currentGame == null && (getDistance(this.props.userLoc, this.props.marker.location)* 0.000621371) < 2)} 
              onPress={() => {this.props.addToTeam(marker.id, 'away')}}
              style={[{width:width*.45, marginLeft:width*.025}, !(marker.teams.away.length < marker.teamSize && marker.gameState == 'created' && this.props.user.currentGame == null && (getDistance(this.props.userLoc, this.props.marker.location)* 0.000621371) < 2) ? styles.disabled : null]}
              theme={{colors:{primary:colors.orange},fonts:{medium:this.props.theme.fonts.regular}}}
            >
              Join Team
            </Button>
          </Block>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    width:width,
    marginTop:height*.5
  },
  disabled: {
    opacity: .3, 
    backgroundColor:'#E68A54'
  },
})

export default withTheme(LobbyModal);