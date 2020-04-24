import React from "react";
import { Block } from "galio-framework";
import { Dimensions, StyleSheet } from "react-native";
import { withTheme, Button, Caption, Text } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import * as firebase from "firebase";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";
import onShare from "../../services/onShare";

const { width, height } = Dimensions.get("screen");
const orange = "#E68A54";
const green = "#56B49E";
const grey = "#83838A";

class LeaderboardScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topTen: new Array(),
    };
  }

  componentDidMount() {
    const unsubscribe = firebase
      .firestore()
      .collection("users")
      .orderBy("points", "desc")
      .limit(10)
      .onSnapshot((users) => {
        let topTen = [];
        users.forEach((user) => {
          let userData = user.data();
          userData.id = user.id;
          topTen.push(userData);
        });
        this.setState({ topTen });
      });
    this.unsubscribe = this.unsubscribe;
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    const colors = this.props.theme.colors;

    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Block>
          <Text>Something went Wrong</Text>
        </Block>
      );
    }

    this.props.navigation.setOptions({
      title: "Leaderboard",
    });

    return (
      <Block
        column
        flex
        style={{
          backgroundColor: colors.dBlue,
        }}
      >
        <Block flex style={{ width: "100%", paddingHorizontal: 16 }}>
          <ScrollView style={{ width: "100%" }}>
            {this.state.topTen.map((user, key) => {
              return (
                <Block
                  row
                  center
                  middle
                  style={{ marginBottom: 12, width: "100%" }}
                  key={key}
                >
                  <Text style={{ color: "white", marginRight: 12 }}>
                    {key + 1}.
                  </Text>
                  {/* <TouchableOpacity
                              onPress={() => {
                                if(user.id == firebase.auth().currentUser.uid){
                                  this.props.navigation.navigate("Profile");
                                } else {
                                  this.navToUserProfile(user.id);
                                }
                              }}
                              key={key}
                              style={{flex:1}}
                            > */}
                  <Block
                    row
                    center
                    middle
                    flex
                    style={
                      key == 0
                        ? styles.firstPlace
                        : key == 1
                        ? styles.secondPlace
                        : key == 2
                        ? styles.thirdPlace
                        : styles.defaultPlace
                    }
                  >
                    <Block column>
                      <Text style={{ color: "#fff" }}>{user.name}</Text>
                      <Text style={{ color: "#fff" }}>@{user.username}</Text>
                    </Block>
                    <Text style={{ color: "#fff" }}>{user.points}</Text>
                  </Block>
                  {/* </TouchableOpacity> */}
                </Block>
              );
            })}
          </ScrollView>
        </Block>
        <Block
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.orange,
            padding: 4,
          }}
        >
          <Caption style={{ color: colors.grey, textAlign: "center" }}>
            For Bonus Points:
          </Caption>
          <Block center middle style={{ width: "100%" }}>
            <Button
              mode='contained'
              dark={true}
              onPress={() => onShare()}
              theme={{
                colors: { primary: colors.orange },
                fonts: { medium: this.props.theme.fonts.regular },
              }}
              uppercase={false}
            >
              Share
            </Button>
          </Block>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  firstPlace: {
    justifyContent: "space-between",
    borderColor: orange,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: orange,
    width: "100%",
  },
  secondPlace: {
    justifyContent: "space-between",
    borderColor: orange,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    width: "100%",
  },
  thirdPlace: {
    justifyContent: "space-between",
    borderColor: green,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    width: "100%",
  },
  defaultPlace: {
    justifyContent: "space-between",
    borderColor: grey,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    width: "100%",
  },
});

export default withTheme(withAuthenticatedUser(LeaderboardScreen));
