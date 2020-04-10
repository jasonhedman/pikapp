import React from "react";
import { StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import Register from "../screens/RegisterStack/Register";
import SignIn from "../screens/RegisterStack/SignIn";
import ForgotPassword from "../screens/RegisterStack/ForgotPassword";

import {Button, withTheme, IconButton} from 'react-native-paper';

import firebase from "firebase";
import "firebase/firestore";

const AuthStack = createStackNavigator();

class AuthNavigation extends React.Component {
  constructor() {
    super();
    this.state = {
      user: {},
    };
  }

  render() {
    return (
      <AuthStack.Navigator
        initialRouteName='SignIn'
        screenOptions={({ navigation, route }) => ({
          headerStyle: styles.header,
          headerTitleStyle: styles.headerText,
          headerTintColor: "#E68A54",
          headerBackTitle: null,
          headerTruncatedBackTitle: null,
          headerLeft: () => (
            <IconButton
              icon='chevron-left'
              color='#E68A54'
              size={30}
              onPress={() => navigation.goBack()}
            />
          ),
        })}
      >
        <AuthStack.Screen 
          name='SignIn'
          component={SignIn}
          options={({ navigation, route }) => ({
            title: "Sign In",
            headerRight: () => (
              <Button
                  mode='text'
                  color={this.props.theme.colors.lGreen}
                  onPress={() => navigation.navigate('SignUp')}
                  compact={true}
                  uppercase={false}
                  style={{marginRight:4}}
              >   
                  Sign Up
              </Button>
            ),
            headerLeft: null
          })}
        />
        <AuthStack.Screen 
          name='SignUp' 
          component={Register}
          options={({ navigation, route }) => ({
            title: "Sign Up",
            headerLeft: () => (
              <Button
                  mode='text'
                  color={this.props.theme.colors.lGreen}
                  onPress={() => navigation.navigate('SignIn')}
                  compact={true}
                  uppercase={false}
                  style={{marginLeft:4}}
              >   
                  Sign In
              </Button>
            )
          })}
        />
        <AuthStack.Screen 
          name='ForgotPassword' 
          component={ForgotPassword}
          options={{
            title: "Forgot Password"
          }} 
        />
      </AuthStack.Navigator>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#121D28",
    shadowColor: "transparent",
    shadowRadius: 0,
    shadowOffset: {
      height: 0,
    },
  },
  headerText: {
    fontFamily: "raleway",
    color: "white",
    // fontSize: 16,
  },
});

export default withTheme(AuthNavigation);