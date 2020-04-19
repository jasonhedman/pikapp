import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { Block } from "galio-framework";
import { withTheme, Text, ActivityIndicator } from "react-native-paper";
import * as geofirex from "geofirex";
const geo = geofirex.init(firebase);
import * as firebase from "firebase";
import "firebase/firestore";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";

const FirstRoute = () => (
  <Block flex style={[{ backgroundColor: "#ff4081" }]} />
);
const SecondRoute = () => (
  <Block flex style={[{ backgroundColor: "#673ab7" }]} />
);

class GroupInvite extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: new Array(),
      complete: false,
    };
  }

  componentDidMount() {
    const query = geo
      .query(firebase.firestore().collection("users"))
      .within(this.props._currentUserProfile.location, 10, "location");
    query.subscribe((users) => this.setState({ users, complete: true }));
  }

  render() {
    const colors = this.props.theme.colors;
    return (
      <>
        <ScrollView style={{ flex: 1 }}>
          {this.state.complete ? (
            this.state.users.length > 0 ? (
              this.state.users.map((user, key) => {
                let distance =
                  Math.round(user.hitMetadata.distance * 0.621371 * 10) / 10;
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
                        distance < 1 ? "<1" : distance
                      } ${distance > 1 ? "Miles Away" : "Mile Away"}`}</Text>
                    </Block>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Block
                row
                center
                middle
                style={{
                  borderColor: colors.grey,
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 10,
                  width: "100%",
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: "#fff" }}>No Results</Text>
              </Block>
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

export default withTheme(withAuthenticatedUser(GroupInvite));
