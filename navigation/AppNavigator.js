import React from 'react';
import { createAppContainer, createSwitchNavigator, createStackNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import AuthLoading from '../screens/AuthLoading';
import Register from '../screens/Register';
import SignIn from '../screens/SignIn';
import ForgotPassword from '../screens/ForgotPassword';


export default createAppContainer(
  createSwitchNavigator({
    // You could add another route here for authentication.
    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
    AuthLoading: AuthLoading,
    Main: MainTabNavigator,
    SignIn: SignIn,
    SignUp: Register,
    ForgotPassword: ForgotPassword
  },
  {
    initialRouteName: 'AuthLoading'
  }
))
