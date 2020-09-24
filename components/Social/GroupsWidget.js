import React from "react";
import { TouchableOpacity } from "react-native";
import { Block } from "galio-framework";
import firebase from "firebase";

import { withTheme, Text, Button, ActivityIndicator } from "react-native-paper";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";
import trace from "../../services/trace";

import GroupPreview from "../Groups/GroupPreview";
import NoResults from "../Utility/NoResults";
import onShare from "../../services/onShare";

class GroupsWidget extends React.Component {
  constructor(props) {
    super(props);

    trace(this, "construct component", "constructor");
    this.state = {
      groups: new Array(),
      groupsComplete: false,
    };
  }

  componentDidMount() {
    trace(this, "get group from user profile", "componentDidMount");
    const unsubscribe = firebase
      .firestore()
      .collection("groups")
      .where("users", "array-contains", firebase.auth().currentUser.uid)
      .orderBy("updated", "desc")
      .limit(3)
      .onSnapshot((groupsRaw) => {
        let groups = [];
        groupsRaw.forEach((group) => {
          groups.push(group.data());
        });
        this.setState({ groups, groupsComplete: true });
      });
    this.unsubscribe = unsubscribe;
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    trace(this, "render component", "render");
    const colors = this.props.theme.colors;
    return (
      <Block style={{ marginTop: 16 }}>
        <TouchableOpacity onPress={() => this.props.navigate("GroupList")}>
          <Text
            style={{
              color: "white",
              fontFamily: "ralewayBold",
              marginBottom: 4,
            }}
          >
            Your Groups ►
          </Text>
        </TouchableOpacity>
        {this.state.groupsComplete ? (
          <Block>
            {this.state.groups.map((group, index) => {
              return (
                <GroupPreview
                  key={index}
                  group={group}
                  navigate={this.props.navigate}
                />
              );
            })}
            {this.state.groups.length > 0 ? (
              <Block middle>
                <TouchableOpacity
                  style={{ padding: 4 }}
                  onPress={() => this.props.navigate("GroupList")}
                >
                  <Text
                    style={{
                      color: colors.orange,
                      fontFamily: "ralewayBold",
                      marginBottom: 4,
                    }}
                  >
                    See More
                  </Text>
                </TouchableOpacity>
              </Block>
            ) : (
                <Block
                    column
                    center
                    middle
                    style={{
                        padding: 10,
                        width: "100%",
                        borderWidth:1, borderRadius: 8, borderColor: colors.grey
                    }}
                >
                    <Text style={{ color: "#fff" }}>No Results</Text>
                        <Button
                            mode='contained'
                            dark={true}
                            onPress={() => this.props.navigate('CreateGroup')}
                            theme={{
                                colors: { primary: colors.orange },
                                fonts: { medium: this.props.theme.fonts.regular },
                            }}
                            compact={true}
                            style={{ marginTop: 10 }}
                            uppercase={false}
                        >
                            Create Group
                        </Button>
                </Block>
            )}
          </Block>
        ) : (
          <ActivityIndicator
            animating={true}
            color={this.props.theme.colors.orange}
            size={"small"}
          />
        )}
      </Block>
    );
  }
}

export default withTheme(withAuthenticatedUser(GroupsWidget));
