import * as React from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import SportInfo from './SportInfo'
import { TabView, TabBar } from 'react-native-tab-view';
import Colors from '../constants/Colors';
import { withTheme, Avatar } from 'react-native-paper';

const {width,height} = Dimensions.get('screen');

let icons = {
  Soccer: {
    focused: require("../assets/images/Soccer_focused.png"),
    unfocused: require("../assets/images/Soccer.png"),
  },
  Basketball: {
    focused: require("../assets/images/Basketball_focused.png"),
    unfocused: require("../assets/images/Basketball.png"),
  },
  Spikeball: {
    focused: require("../assets/images/Spikeball_focused.png"),
    unfocused: require("../assets/images/Spikeball.png"),
  },
  Football: {
    focused: require("../assets/images/Football_focused.png"),
    unfocused: require("../assets/images/Football.png"),
  },
  Volleyball: {
    focused: require("../assets/images/Volleyball_focused.png"),
    unfocused: require("../assets/images/Volleyball.png"),
  },
}

class SportsTabs extends React.Component {
  state = {
    index: 0,
    routes: [
      { key: 'Basketball', title: 'Basketball' },
      { key: 'Soccer', title: 'Soccer' },
      { key: 'Spikeball', title: 'Spikeball' },
      { key: 'Football', title: 'Football' },
      { key: 'Volleyball', title: 'Volleyball' },
    ],
  };

  render() {
    const colors = this.props.theme.colors;
    return (
      <TabView
        navigationState={this.state}
        renderScene={({ route, jumpTo }) => {
            switch (route.key) {
                case 'Basketball':
                  return <SportInfo user={this.props.user.sports.basketball} sport={route.key} />;
                case 'Spikeball':
                  return <SportInfo user={this.props.user.sports.spikeball} sport={route.key} />;
                case 'Football':
                  return <SportInfo user={this.props.user.sports.football} sport={route.key} />;
                case 'Volleyball':
                  return <SportInfo user={this.props.user.sports.volleyball} sport={route.key} />;
                case 'Soccer':
                  return <SportInfo user={this.props.user.sports.soccer} sport={route.key} />;
                default:
                  return null;
            }
          }}
        onIndexChange={index => this.setState({ index })}
        style={styles.container}
        renderTabBar={props =>
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: colors.orange }}
            style={{ backgroundColor: colors.dBlue }}
            activeColor={colors.orange}
            inactiveColor={colors.white}
            tabStyle={{padding:0}}
            renderIcon={({ route, focused, color }) => {
              let icon = focused ? icons[route.key]["focused"] : icons[route.key]["unfocused"]
              return (
                <Avatar.Image
                  size={24}
                  source={icon}
                />
              )
            }}
            renderLabel={({ route, focused, color }) => (
              null
            )}
            labelStyle={{fontFamily:this.props.theme.fonts.regular,fontSize:14}}
          />
        }
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex:0,
    marginBottom:20
  },
});

export default withTheme(SportsTabs);