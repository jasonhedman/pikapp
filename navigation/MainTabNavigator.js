import React from "react";
import { StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import TabBarIcon from "../components/Utility/TabBarIcon";
import GameLandingScreen from "../screens/GameStack/GameLandingScreen";
import GameLobby from "../screens/GameStack/GameLobby";
import MapScreen from "../screens/MapStack/MapScreen";
import SearchPlayers from "../screens/SocialStack/SearchPlayers";
import SocialScreen from "../screens/SocialStack/SocialScreen";
import GroupScreen from "../screens/SocialStack/GroupScreen";
import SearchGroups from "../screens/SocialStack/SearchGroups";
import GroupList from "../screens/SocialStack/GroupList";
import GroupInfo from "../screens/SocialStack/GroupInfo";
import Profile from "../screens/ProfileStack/Profile";
import ChangePassword from "../screens/ProfileStack/ChangePassword";
import ChangeEmail from "../screens/ProfileStack/ChangeEmail";
import UserProfile from "../screens/UtilityStack/UserProfile";
import UserList from "../screens/UtilityStack/UserList";
import GameForm from "../screens/UtilityStack/GameForm";
import MessageBoard from "../screens/UtilityStack/MessageBoard";
import CreateGroup from "../screens/SocialStack/CreateGroup";
import { withTheme, IconButton } from "react-native-paper";
import EditGroup from "../screens/SocialStack/EditGroup";
import EditProfile from "../screens/ProfileStack/EditProfile";
import PendingRequests from "../screens/SocialStack/PendingRequests";
import GroupInvite from "../screens/SocialStack/GroupInvite";
import SocialNotifications from "../screens/SocialStack/SocialNotifications";
import GroupInvitations from "../screens/SocialStack/GroupInvitations";
import InvitePlayers from "../screens/GameStack/InvitePlayers";
import ChooseLocation from "../screens/UtilityStack/ChooseLocation";
import ChooseTime from "../screens/UtilityStack/ChooseTime";

const Tab = createMaterialBottomTabNavigator();
const MapStackNav = createStackNavigator();
const ProfileStackNav = createStackNavigator();
const SocialStackNav = createStackNavigator();
const GameStackNav = createStackNavigator();

function MapStack() {
  return (
    <MapStackNav.Navigator
      initialRouteName='MapScreen'
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
      <MapStackNav.Screen
        name='MapScreen'
        component={MapScreen}
        options={{
          headerLeft: null,
          headerTransparent: true,
          title: null,
        }}
      />
      <MapStackNav.Screen name='UserProfile' component={UserProfile} />
      <MapStackNav.Screen
        name='GameForm'
        component={GameForm}
        options={{
          title: "Create Game",
        }}
      />
      <MapStackNav.Screen
        name='ChooseLocation'
        component={ChooseLocation}
        options={{
          title: "Choose Location",
        }}
      />
      <MapStackNav.Screen
        name='ChooseTime'
        component={ChooseTime}
        options={{
          title: "Choose Time",
        }}
      />
      <MapStackNav.Screen
        name='UserList'
        component={UserList}
        options={({ navigation, route }) => ({
          title: route.params.listType,
        })}
      />
    </MapStackNav.Navigator>
  );
}

function ProfileStack() {
  return (
    <KeyboardAvoidingView behavior='padding' style={{flex:1,backgroundColor:'#121d28'}}>
      <ProfileStackNav.Navigator
        initialRouteName='Profile'
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
        <ProfileStackNav.Screen
          name='UserProfile'
          component={UserProfile}
          options={{
            title: "",
          }}
        />
        <ProfileStackNav.Screen
          name='EditProfile'
          component={EditProfile}
          options={{
            title: "Edit Profile",
          }}
        />
        <ProfileStackNav.Screen
          name='Profile'
          component={Profile}
          options={{
            title: "",
            headerLeft: null,
          }}
        />
        <ProfileStackNav.Screen
          name='UserList'
          component={UserList}
          options={({ navigation, route }) => ({
            title: route.params.listType,
          })}
        />
        <ProfileStackNav.Screen
          name='ChangeEmail'
          component={ChangeEmail}
          options={{
            title: "Change Email",
          }}
        />
        <ProfileStackNav.Screen
          name='ChangePassword'
          component={ChangePassword}
          options={{
            title: "Change Password",
          }}
        />
      </ProfileStackNav.Navigator>
    </KeyboardAvoidingView>
  );
}

function SocialStack(props) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#121D28" }}
      behavior={Platform.OS == "ios" ? "padding" : "height"}
    >
      <SocialStackNav.Navigator
        initialRouteName='SocialScreen'
        screenOptions={({ navigation, route }) => ({
          headerStyle: styles.header,
          headerTitleStyle: styles.headerText,
          headerTintColor: "#E68A54",
          headerMode: "screen",
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
        <SocialStackNav.Screen
          name='SearchPlayers'
          component={SearchPlayers}
          options={({ navigation, route }) => ({
            title: "Search Users",
          })}
        />
        <SocialStackNav.Screen
          name='SocialScreen'
          component={SocialScreen}
          options={({ navigation, route }) => ({
            title: "Social",
          })}
        />
        <SocialStackNav.Screen
          name='GroupProfile'
          component={GroupScreen}
          options={({ navigation, route }) => ({
            title: route.params.groupTitle,
            headerRight: () => (
              <IconButton
                icon='information-outline'
                color='#E68A54'
                size={30}
                onPress={() =>
                  navigation.navigate("GroupInfo", {
                    groupId: route.params.groupId,
                    groupTitle: route.params.groupTitle,
                  })
                }
                style={{ marginTop: 12, marginBottom: 12 }}
              />
            ),
          })}
        />
        <SocialStackNav.Screen
          name='UserProfile'
          component={UserProfile}
          options={({ navigation, route }) => ({
            title: "",
          })}
        />
        <SocialStackNav.Screen
          name='UserList'
          component={UserList}
          options={({ navigation, route }) => ({
            title: route.params.listType,
          })}
        />
        <SocialStackNav.Screen
          name='SearchGroups'
          component={SearchGroups}
          options={({ navigation, route }) => ({
            title: "Search Groups",
            headerRight: () => (
              <IconButton
                icon='plus'
                color='#E68A54'
                size={30}
                onPress={() => navigation.navigate("CreateGroup")}
                style={{ marginTop: 12, marginBottom: 12 }}
              />
            ),
          })}
        />
        <SocialStackNav.Screen
          name='GroupList'
          component={GroupList}
          options={({ navigation, route }) => ({
            title: "Groups",
            headerRight: () => (
              <IconButton
                icon='plus'
                color='#E68A54'
                size={30}
                onPress={() => navigation.navigate("CreateGroup")}
                style={{ marginTop: 12, marginBottom: 12 }}
              />
            ),
          })}
        />
        <SocialStackNav.Screen
          name='CreateGroup'
          component={CreateGroup}
          options={({ navigation, route }) => ({
            title: "Create Group",
          })}
        />
        <SocialStackNav.Screen
          name='GroupInfo'
          component={GroupInfo}
          options={({ navigation, route }) => ({
            title: route.params.groupTitle,
          })}
        />
        <SocialStackNav.Screen
          name='EditGroup'
          component={EditGroup}
          options={({ navigation, route }) => ({
            title: "Edit Group",
          })}
        />
        <SocialStackNav.Screen
          name='PendingRequests'
          component={PendingRequests}
          options={({ navigation, route }) => ({
            title: "Pending Requests",
          })}
        />
        <SocialStackNav.Screen
          name='GroupInvite'
          component={GroupInvite}
          options={({ navigation, route }) => ({
            title: "Invite Users",
          })}
        />
        <SocialStackNav.Screen
          name='SocialNotifications'
          component={SocialNotifications}
          options={({ navigation, route }) => ({
            title: "Activity",
          })}
        />
        <SocialStackNav.Screen
          name='GroupInvitations'
          component={GroupInvitations}
          options={({ navigation, route }) => ({
            title: "Group Invitations",
          })}
        />
        <SocialStackNav.Screen
          name='GameForm'
          component={GameForm}
          options={{
            title: "Create Group Game",
          }}
        />
        <SocialStackNav.Screen
          name='ChooseLocation'
          component={ChooseLocation}
          options={{
            title: "Choose Location",
          }}
        />
        <SocialStackNav.Screen
          name='ChooseTime'
          component={ChooseTime}
          options={{
            title: "Choose Time",
          }}
        />
      </SocialStackNav.Navigator>
    </KeyboardAvoidingView>
  );
}

function GameStack() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#121D28" }}
      behavior={Platform.OS == "ios" ? "padding" : "height"}
    >
      <GameStackNav.Navigator
        initialRouteName='GameLandingScreen'
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
        <GameStackNav.Screen
          name='GameLandingScreen'
          component={GameLandingScreen}
          options={{
            headerLeft: null,
            title: "",
          }}
        />
        <GameStackNav.Screen
          name='GameLobby'
          component={GameLobby}
          options={{
            headerRight: null,
            title: "",
          }}
        />
        <GameStackNav.Screen
          name='InvitePlayers'
          component={InvitePlayers}
          options={{
            headerRight: null,
            title: "Invite Players",
          }}
        />
        <GameStackNav.Screen
          name='UserProfile'
          component={UserProfile}
          options={({ navigation, route }) => ({
            title: "",
          })}
        />
        <GameStackNav.Screen
          name='UserList'
          component={UserList}
          options={({ navigation, route }) => ({
            title: route.params.listType,
          })}
        />
        <GameStackNav.Screen
          name='Messages'
          component={MessageBoard}
          options={({ navigation, route }) => ({
            title: "Messages",
          })}
        />
      </GameStackNav.Navigator>
    </KeyboardAvoidingView>
  );
}

class MainTabNavigator extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      // <UserContext.Provider value={this.state}>
      <Tab.Navigator
        initialRouteName='MapStack'
        activeColor='#E68A54'
        inactiveColor='#fff'
        barStyle={{ backgroundColor: "#121D28" }}
        keyboardHidesNavigationBar={false}
      >
        <Tab.Screen
          name='GameStack'
          component={GameStack}
          options={{
            tabBarLabel: "Games",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                focused={focused}
                name={
                  "Platform.OS" === "ios" ? "ios-basketball" : "md-basketball"
                }
              />
            ),
          }}
        />
        <Tab.Screen
          name='MapStack'
          component={MapStack}
          options={{
            tabBarLabel: "Map",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                focused={focused}
                name={"Platform.OS" === "ios" ? "ios-map" : "md-map"}
              />
            ),
          }}
        />
        <Tab.Screen
          name='SocialStack'
          component={SocialStack}
          options={{
            tabBarLabel: "Social",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                focused={focused}
                name={"Platform.OS" === "ios" ? "ios-search" : "md-search"}
              />
            ),
          }}
        />
        <Tab.Screen
          name='ProfileStack'
          component={ProfileStack}
          options={{
            tabBarLabel: "Profile",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                focused={focused}
                name={"Platform.OS" === "ios" ? "ios-person" : "md-person"}
              />
            ),
          }}
        />
      </Tab.Navigator>
      // </UserContext.Provider>
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
  },
});

export default withTheme(MainTabNavigator);
