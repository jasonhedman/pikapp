import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { Block } from "galio-framework";
import { withTheme, Text, ActivityIndicator } from "react-native-paper";

import * as firebase from "firebase";
import "firebase/firestore";
import NoResults from "./NoResults";

class MutualFriends extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: new Array(),
      user: {},
      complete: false,
    };
  }

  componentDidMount() {
    let findMutualFriends = firebase
      .functions()
      .httpsCallable("findMutualFriends");
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((currentUser) => {
        this.setState({ user: currentUser.data() }),
          findMutualFriends({
            user: currentUser.data(),
            id: currentUser.id,
          }).then((result) => {
            this.setState({
              complete: true,
              users: result.data,
            });
          });
      });
  }

  render() {
    const colors = this.props.theme.colors;
    return (
      <>
        <ScrollView style={{ flex: 1 }}>
          {this.state.complete ? (
            this.state.users.length > 0 ? (
              this.state.users.map((user, key) => {
                return (
                  <TouchableOpacity
                    onPress={() => this.props.onPress(user)}
                    key={key}
                    style={{ width: "100%" }}
                  >
                    <Block
                      row
                      center
                      middle
                      style={{
                        justifyContent: "space-between",
                        borderColor: colors.orange,
                        borderWidth: 1,
                        borderRadius: 8,
                        padding: 10,
                        width: "100%",
                        marginBottom: 10,
                      }}
                    >
                      <Block column>
                        <Text style={{ color: "#fff" }}>{user.name}</Text>
                        <Text style={{ color: "#fff" }}>@{user.username}</Text>
                      </Block>
                      <Text style={{ color: "#fff" }}>{`${
                        user.mutualFriends
                      } Mutual Friend${
                        user.mutualFriends > 1 ? "s" : ""
                      }`}</Text>
                    </Block>
                  </TouchableOpacity>
                );
              })
            ) : (
              <NoResults users={true} border={true} />
            )
          ) : (
            <ActivityIndicator
              style={{ opacity: 1 }}
              animating={true}
              color={this.props.theme.colors.orange}
              size={"small"}
            />
          )}
        </ScrollView>
      </>
    );
  }
}

export default withTheme(MutualFriends);
