import React from "react";
import {
  StyleSheet,
  Dimensions,
} from "react-native";
import { Block} from "galio-framework";

import { argonTheme } from "../constants";

import {withTheme,Headline,Button,Menu,IconButton} from 'react-native-paper';
import * as Location from 'expo-location';
import HeaderBlock from './HeaderBlock';
import MenuBlock from './MenuBlock';
import ButtonBlock from './ButtonBlock';
import Form from './Form';
import * as firebase from 'firebase';
import 'firebase/firestore';

const teamSizes = {
  basketball: [2,3,4,5],
  spikeball: [2],
  volleyball: [3,4,6],
  football: [3,4,5,6],
  soccer: [6,7,8,9,10,11]
}
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
        let userData = user.data();
        userData.id = user.id;
        this.setState({user:userData})
      })
  }

  onSportMenuClick = (sport) => {
    this.setState({sport:sport,sportVisible:false})
  }

  onIntensityMenuClick = (intensity) => {
    this.setState({intensity:intensity,intensityVisible:false})
  }


  onCreate = () => {
    Location.getCurrentPositionAsync()
      .then((pos)=>{
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
          .then((doc) => {
            let docData = doc.data();
            docData.id = doc.id;
            if(doc.exists){
              firebase.firestore().collection('games').add({
                intensity: this.state.intensity,
                location: pos.coords,
                sport:this.state.sport,
                teamSize: this.state.teamSize,
                ownerId: doc.id,
                owner: docData,
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
                        type: 'newGame',
                        game: {
                          intensity: this.state.intensity,
                          location: pos.coords,
                          sport:this.state.sport,
                          teamSize: this.state.teamSize,
                          ownerId: doc.id,
                          owner: docData,
                          gameState: "created"
                        },
                        action:"created",
                        from:this.state.user,
                        to: this.state.user.followers,
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
      <Block center middle style={[styles.registerContainer, {backgroundColor:colors.dBlue,borderColor:colors.orange}]}>
        <HeaderBlock text='Create Game' backButton={true} backPress={this.props.closeModal} />
        <MenuBlock
          visible={this.state.sportVisible}
          onDismiss={() => this.setState({sportVisible:false})}
          value={this.state.sport}
          title='Sport'
          items={['Basketball', 'Soccer', 'Spikeball', 'Football', 'Volleyball']}
          onAnchorPress={() => this.setState({sportVisible:true})}
          onMenuItemPress={this.onSportMenuClick}
        />
        <MenuBlock
          visible={this.state.intensityVisible}
          onDismiss={() => this.setState({intensityVisible:false})}
          value={this.state.intensity}
          title='Intensity'
          items={['Casual', 'Intermediate', 'Competitive']}
          onAnchorPress={() => this.setState({intensityVisible:true})}
          onMenuItemPress={this.onIntensityMenuClick}
        />
        <Menu
          visible={this.state.tsVisible}
          onDismiss={() => {this.setState({tsVisible:false})}}
          style={{}}
          anchor={
            <Block style={{ marginBottom: 12 }}>
              <Button style={{display:"flex",justifyContent:"center",alignItems:"center"}} dark={false} icon="menu-down" mode="text" onPress={() => {this.setState({tsVisible:true})}} theme={{colors:{primary:colors.white},fonts:{medium:this.props.theme.fonts.regular}}}>
                      {this.state.teamSize != null ? this.state.teamSize : "Team Size"}
              </Button>
            </Block>
          }
        >
          {
            this.state.sport != null
            ? teamSizes[this.state.sport].map((item, index) => {
              return <Menu.Item onPress={() => {this.setState({teamSize:item,tsVisible:false})}} title={''+item} key={index} />
            }) 
            : <Menu.Item title="Choose a Sport" disabled={true} theme={{colors:{text:colors.dBlue}}}  />
          }
        </Menu>
        <ButtonBlock text='Create Game' onPress={this.onCreate} disabled={this.state.sport == null || this.state.intensity == null || this.state.teamSize == null} disabledStyles={{opacity: .3, backgroundColor:colors.orange}} />
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  registerContainer: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 2,
    padding:16,
  }
});

export default withTheme(GameForm);
