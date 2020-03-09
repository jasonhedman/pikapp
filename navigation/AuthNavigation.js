import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Register from '../screens/Register';
import SignIn from '../screens/SignIn';
import ForgotPassword from '../screens/ForgotPassword';

import firebase from 'firebase';
import 'firebase/firestore';

const AuthStack = createStackNavigator();


export class AuthNavigation extends React.Component {
  constructor(){
    super();
    this.state = {
      user:{}
    }
  }

  render(){
    return (
      <AuthStack.Navigator
        initialRouteName="SignIn"
        headerMode='none'
      >
        <AuthStack.Screen name="SignIn" component={SignIn} />
        <AuthStack.Screen name="SignUp" component={Register} />
        <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />
      </AuthStack.Navigator>
    )
  }
}