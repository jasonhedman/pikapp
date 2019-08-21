import React from 'react';
import {
  View,
  Button
} from 'react-native';

import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

export default class OwnerLobbyButton extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    let content;
    switch (this.props.gameState) {
      case "created":
        content = (<Button title={"Start Game"} onPress={() => this.props.changeGameState("inProgress")} />);
        break;
      case "inProgress":
        content = (<Button title={"End Game"} onPress={() => this.props.setModalVisible(true)} />);
        break;
      default:
        content = null;
        break;
    }
    return content;
  }
}
