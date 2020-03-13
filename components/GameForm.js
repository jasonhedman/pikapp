import React from "react";
import {
  StyleSheet,
} from "react-native";
import { Block} from "galio-framework";
import {withTheme,Switch,Text,Button, Portal, Modal} from 'react-native-paper';
import * as Location from 'expo-location';
import HeaderBlock from './HeaderBlock';
import MenuBlock from './MenuBlock';
import ButtonBlock from './ButtonBlock';
import Form from './Form';
import * as firebase from 'firebase';
import moment from 'moment';
import 'firebase/firestore';

class GameForm extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      sport: this.props.sport,
      intensity: this.props.intensity,
      user:null,
      bringingEquipment:this.props.bringingEquipment,
      locationModalVisible:false,
      location: this.props.location
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
    this.props.setCreateGameState(sport, this.state.intensity, this.state.bringingEquipment);
    this.setState({sport:sport,sportVisible:false})
  }

  onIntensityMenuClick = (intensity) => {
    this.props.setCreateGameState(this.state.sport, intensity, this.state.bringingEquipment);
    this.setState({intensity:intensity,intensityVisible:false})
  }


  onCreate = () => {
    let equipment = this.state.bringingEquipment ? [firebase.auth().currentUser.uid] : [];
    Location.getCurrentPositionAsync()
      .then((pos)=>{
        // pos.coords.longitude += .1;
        // pos.coords.latitude += .1;
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
          .then((doc) => {
            let docData = doc.data();
            docData.id = doc.id;
            if(doc.exists){
              firebase.firestore().collection('games').add({
                intensity: this.state.intensity,
                location: pos.coords,
                sport:this.state.sport,
                ownerId: doc.id,
                owner: docData,
                players: [
                  {
                    id: firebase.auth().currentUser.uid,
                    name: this.state.user.name,
                    username: this.state.user.username,
                    dob:this.state.user.dob
                  }
                ],
                gameState: "created",
                updated:moment().toDate(),
                time: moment().toDate(),
                equipment: equipment,
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
                          ownerId: doc.id,
                          owner: docData,
                          gameState: "created"
                        },
                        action:"created",
                        from:this.state.user,
                        to: this.state.user.followers,
                        time: moment().toDate(),
                        date: moment().toDate(),
                        expire: moment().add(1, 'h').toDate()
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
      <>
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
          <Block
            style={{borderWidth:.5,borderColor:'white', borderRadius:8,marginBottom:12}}
          >
            <Button 
              icon="map-search-outline" 
              mode="text" 
              onPress={() => this.props.navToLocationScreen()} 
              color="#fff"
              theme={{dark:true}}
            >
              {
                this.state.location != null
                ? this.state.location.name
                : "Choose Location"
              }
              
            </Button>
          </Block>
          <Block center middle>
            <Switch
              value={this.state.bringingEquipment}
              onValueChange={() =>{
                  this.props.setCreateGameState(this.state.sport, this.state.intensity, !this.state.bringingEquipment);
                  this.setState({ bringingEquipment: !this.state.bringingEquipment }); 
                }
              }
              color={colors.orange}
              style={{marginBottom:8}}
            />
            <Text style={{color:"#fff",marginBottom:8}}>{this.state.bringingEquipment ? "I am providing equipment" : "I am not providing equipment"}</Text>
          </Block>
          
          <ButtonBlock text='Create Game' onPress={this.onCreate} disabled={this.state.sport == null || this.state.intensity == null} disabledStyles={{opacity: .3, backgroundColor:colors.orange}} />
        </Block>
      </>
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
