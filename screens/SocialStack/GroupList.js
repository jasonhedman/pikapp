import React from "react";
import { SafeAreaView } from "react-native";
import { withTheme } from "react-native-paper";
import { Block } from "galio-framework";
import GroupPreview from "../../components/Groups/GroupPreview";

import firebase from "firebase";

class GroupList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      groups: new Array(),
    };
  }

  componentDidMount() {
    const groupIds = this.props._currentUserProfile.groups;

    Promise.all(
      groupIds.map((groupId) => {
        return firebase
          .firestore()
          .collection("groups")
          .doc(groupId)
          .get()
          .then((group) => {
            return group.data();
          });
      })
    ).then((groups) => {
      console.log(groups);
      this.setState({ groups: groups });
    });
  }

    render(){
        const colors = this.props.theme.colors;
        return (
            <SafeAreaView style={{flex:1,backgroundColor:colors.dBlue}}>
                <Block flex style={{padding:16}}>
                    {
                        this.state.groups.map((group, index) => {
                            return (
                                <GroupPreview
                                    key={index}
                                    group={group}
                                    navigate={this.props.navigation.navigate}
                                />
                            )
                        })
                    }
                </Block>
            </SafeAreaView>
        )
    }
}

export default withTheme(GroupList);