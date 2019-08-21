import React from 'react';
import {
  View,
  Button,
  Text
} from 'react-native';

import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

export default class MemberLobbyButton extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    let content;
    switch (this.props.gameState) {
      case "created":
        content = (<Text>{"Waiting for owner to start the game..."}</Text>);
        break;
      case "inProgress":
        content = (<Text>{"The game is in progress..."}</Text>);
        break;
      default:
        content = null;
        break;
    }
    return content;
  }
}
