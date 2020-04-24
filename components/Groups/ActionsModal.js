import React from "react";
import { StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { Block } from "galio-framework";
import { Text, withTheme } from "react-native-paper";
import firebase from "firebase";
import "firebase/firestore";

class ActionsModal extends React.Component {
  constructor() {
    super();
    this.state = {
      userRole: "",
      userLevel: 0,
      currentUserLevel: 0,
    };
  }

  componentDidMount() {
    if (this.props.group.owner == this.props.user.id) {
      this.setState({ userLevel: 5 });
    } else if (this.props.group.coOwners.includes(this.props.user.id)) {
      this.setState({ userLevel: 3 });
    } else if (this.props.group.admins.includes(this.props.user.id)) {
      this.setState({ userLevel: 2 });
    } else {
      this.setState({ userLevel: 1 });
    }

    if (this.props.group.owner == this.props.currentUser.id) {
      this.setState({ currentUserLevel: 5 });
    } else if (this.props.group.coOwners.includes(this.props.currentUser.id)) {
      this.setState({ currentUserLevel: 3 });
    } else if (this.props.group.admins.includes(this.props.currentUser.id)) {
      this.setState({ currentUserLevel: 2 });
    }
  }

  promoteToAdmin = () => {
    firebase
      .firestore()
      .collection("groups")
      .doc(this.props.group.id)
      .update({
        admins: firebase.firestore.FieldValue.arrayUnion(this.props.user.id),
      })
      .then(() => {
        this.props.closeModal();
      });
  };

  promoteToCoOwner = () => {
    firebase
      .firestore()
      .collection("groups")
      .doc(this.props.group.id)
      .update({
        admins: firebase.firestore.FieldValue.arrayRemove(this.props.user.id),
        coOwners: firebase.firestore.FieldValue.arrayUnion(this.props.user.id),
      })
      .then(() => {
        this.props.closeModal();
      });
  };

  promoteToOwner = () => {
    firebase
      .firestore()
      .collection("groups")
      .doc(this.props.group.id)
      .update({
        admins: firebase.firestore.FieldValue.arrayRemove(this.props.user.id),
        coOwners: firebase.firestore.FieldValue.arrayRemove(this.props.user.id),
        coOwners: firebase.firestore.FieldValue.arrayUnion(
          this.props.currentUser.id
        ),
        owner: this.props.user.id,
      })
      .then(() => {
        this.props.closeModal();
      });
  };

  demoteToMember = () => {
    firebase
      .firestore()
      .collection("groups")
      .doc(this.props.group.id)
      .update({
        admins: firebase.firestore.FieldValue.arrayRemove(this.props.user.id),
        coOwners: firebase.firestore.FieldValue.arrayRemove(this.props.user.id),
      })
      .then(() => {
        this.props.closeModal();
      });
  };

  demoteToAdmin = () => {
    firebase
      .firestore()
      .collection("groups")
      .doc(this.props.group.id)
      .update({
        admins: firebase.firestore.FieldValue.arrayUnion(this.props.user.id),
        coOwners: firebase.firestore.FieldValue.arrayRemove(this.props.user.id),
      })
      .then(() => {
        this.props.closeModal();
      });
  };

  remove = () => {
    firebase
      .firestore()
      .collection("groups")
      .doc(this.props.group.id)
      .update({
        users: firebase.firestore.FieldValue.arrayRemove(this.props.user.id),
        admins: firebase.firestore.FieldValue.arrayRemove(this.props.user.id),
        coOwners: firebase.firestore.FieldValue.arrayRemove(this.props.user.id),
      })
      .then(() => {
        this.props.closeModal();
      });
  };

  navToUserProfile = () => {
    this.props.closeModal(
      this.props.navigate("UserProfile", { userId: this.props.user.id })
    );
  };

  getActions = () => {
    let demotions = [
      <TouchableOpacity
        style={[styles.row, { borderBottomWidth: 0 }]}
        onPress={this.remove}
        key={0}
      >
        <Text style={styles.text}>Kick Out</Text>
      </TouchableOpacity>,
      <TouchableOpacity
        style={[styles.row, { borderBottomColor: colors.grey }]}
        onPress={this.demoteToMember}
        key={1}
      >
        <Text style={styles.text}>Demote To Member</Text>
      </TouchableOpacity>,
      <TouchableOpacity
        style={[styles.row, { borderBottomColor: colors.grey }]}
        onPress={this.demoteToAdmin}
        key={2}
      >
        <Text style={styles.text}>Demote To Admin</Text>
      </TouchableOpacity>,
    ];
    let promotions = [
      null,
      null,
      <TouchableOpacity
        style={[styles.row, { borderBottomColor: colors.grey }]}
        onPress={this.promoteToAdmin}
        key={3}
      >
        <Text style={styles.text}>Promote To Admin</Text>
      </TouchableOpacity>,
      <TouchableOpacity
        style={[styles.row, { borderBottomColor: colors.grey }]}
        onPress={this.promoteToCoOwner}
        key={4}
      >
        <Text style={styles.text}>Promote To Co-Owner</Text>
      </TouchableOpacity>,
      <TouchableOpacity
        style={[styles.row, { borderBottomColor: colors.grey }]}
        onPress={this.promoteToOwner}
        key={5}
      >
        <Text style={styles.text}>Promote To Owner</Text>
      </TouchableOpacity>,
    ];
    let actions = [];
    if (this.state.currentUserLevel > this.state.userLevel) {
      for (let i = 0; i < this.state.currentUserLevel; i++) {
        if (i < this.state.userLevel) {
          actions.push(demotions[i]);
        } else if (i > this.state.userLevel) {
          actions.push(promotions[i]);
        }
      }
    }
    return actions;
  };

  render() {
    let colors = this.props.theme.colors;
    return (
      <SafeAreaView style={{ marginTop: "auto" }}>
        <Block
          style={{
            backgroundColor: colors.dBlue,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.orange,
            marginBottom: 16,
          }}
        >
          <Block style={[styles.header, { borderBottomColor: colors.grey }]}>
            <Text style={styles.headerText}>{this.props.user.username}</Text>
          </Block>
          <TouchableOpacity
            style={[styles.row, { borderBottomWidth: 0 }]}
            onPress={this.navToUserProfile}
          >
            <Text style={styles.text}>View Profile</Text>
          </TouchableOpacity>
        </Block>
        <Block
          style={{
            backgroundColor: colors.dBlue,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.orange,
          }}
        >
          <Block style={{ flexDirection: "column-reverse" }}>
            {this.getActions()}
          </Block>
        </Block>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    padding: 16,
    borderBottomWidth: 1,
  },
  text: {
    color: "white",
    textAlign: "center",
  },
  headerText: {
    color: "white",
    textAlign: "center",
    fontFamily: "ralewayBold",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
});

export default withTheme(ActionsModal);
