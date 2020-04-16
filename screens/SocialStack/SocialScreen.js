import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Keyboard,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { withTheme, FAB, Portal, Modal, TextInput } from "react-native-paper";
import { Block } from "galio-framework";
import firebase from "firebase";
import SocialHeader from "../../components/Social/SocialHeader";
import NearbyUsersWidget from "../../components/Social/NearbyUsersWidget";

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
        header: ({ scene, previous, navigation }) => {
          return (
            <SocialHeader
              search={this.state.search}
              navigate={this.props.navigation.navigate}
            />
          );
        },
      });
  }



  render() {
    const colors = this.props.theme.colors;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.dBlue }}>
          <NearbyUsersWidget />
          <FAB
            icon='plus'
            label='See Groups'
            onPress={() => {
              this.props.navigation.navigate("GroupList");
            }}
            style={[
              styles.fab,
              { backgroundColor: colors.orange, color: colors.white },
            ]}
          />
          <FAB
            icon='plus'
            label='Create Group'
            onPress={() => {
              this.props.navigation.navigate("CreateGroup");
            }}
            style={[
              styles.fab,
              { backgroundColor: colors.orange, color: colors.white },
            ]}
          />
          <FAB
            icon='plus'
            label='Search Groups'
            onPress={() => {
              this.props.navigation.navigate("SearchGroups");
            }}
            style={[
              styles.fab,
              { backgroundColor: colors.orange, color: colors.white },
            ]}
          />
          <FAB
            icon='plus'
            label='Search Players'
            onPress={() => {
              this.props.navigation.navigate("SearchPlayers");
            }}
            style={[
              styles.fab,
              { backgroundColor: colors.orange, color: colors.white },
            ]}
          />
          <FAB
            icon='plus'
            label='Social Activity'
            onPress={() => {
              this.props.navigation.navigate("SocialNotifications", {
                userId: firebase.auth().currentUser.uid,
              });
            }}
            style={[
              styles.fab,
              { backgroundColor: colors.orange, color: colors.white },
            ]}
          />
        </SafeAreaView>
      </TouchableWithoutFeedback>
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
