import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import {Block} from 'galio-framework'
import { withTheme, FAB } from "react-native-paper";
import firebase from "firebase";
import SocialHeader from "../../components/Social/SocialHeader";
import NearbyUsersWidget from "../../components/Social/NearbyUsersWidget";
import GroupsWidget from "../../components/Social/GroupsWidget";
import MutualFriendsWidget from "../../components/Social/MutualFriendsWidget";

class SocialScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      search: "",
    };
  }

  componentDidMount() {
    let colors = this.props.theme.colors;
    this.props.navigation.setOptions({
      headerShown: false,
    });
  }

  navToUserProfile = (id) => {
    this.props.navigation.navigate("UserProfile", { userId: id });
  };

  onSearch = (search) => {
    this.setState({search})
  }

  render() {
    const colors = this.props.theme.colors;
    return (
      // <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.dBlue }}>
        <Block style={{paddingHorizontal:8, overflow:'visible'}}>
          <SocialHeader
            search={this.state.search}
            navigate={this.props.navigation.navigate}
            onSearch={this.onSearch}
          />
          <NearbyUsersWidget navToUserProfile={this.navToUserProfile} />
          <GroupsWidget navigate={this.props.navigation.navigate} />
          <MutualFriendsWidget navToUserProfile={this.navToUserProfile} />
        </Block>
      </SafeAreaView>
      // </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  fab: {
    marginTop: 8,
    zIndex: 2,
  },
});

export default withTheme(SocialScreen);
