import React from "react";
import { FlatList, Dimensions } from "react-native";
import { withTheme, Text, ActivityIndicator } from "react-native-paper";
import { getDistance } from "geolib";

import { Block } from "galio-framework";
const { height, width } = Dimensions.get("screen");
import firebase from "firebase";
import * as geofirex from "geofirex";
const geo = geofirex.init(firebase);
import "firebase/firestore";
import withAuthenticatedUser from "../../contexts/authenticatedUserContext/withAuthenticatedUser";
import UserPreview from "./UserPreview";
import NoResults from "../Utility/NoResults";


class NearbyUsersWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nearbyUsers: new Array(),
      nearbyComplete: false,
    };
  }

  componentDidMount() {
    const query = geo
      .query(firebase.firestore().collection("users"))
      .within(this.props._currentUserProfile.location, 10, "location");
    this.subscription = query.subscribe((nearbyUsers) =>
      this.setState({ nearbyUsers: nearbyUsers.filter(user => user.id !== firebase.auth().currentUser.uid), nearbyComplete: true })
    );
  }

  componentWillUnmount(){
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

  render() {
    const colors = this.props.theme.colors;
    return (
      <Block style={{ marginTop: 10 }}>
        <Text
          style={{ color: "white", fontFamily: "ralewayBold", marginBottom: 4 }}
        >
          Nearby Users
        </Text>
        {this.state.nearbyComplete ? (
          this.state.nearbyUsers.length > 0 ? (
            <FlatList
              data={this.state.nearbyUsers}
              renderItem={({ item, index }) => (
                <UserPreview
                  user={item}
                  navToUserProfile={this.props.navToUserProfile}
                />
              )}
              keyExtractor={(item) => item.id}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={{ width, marginLeft: -8 }}
            />
          ) : (
            <NoResults users={true} border={true} />
          )
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

export default withTheme(withAuthenticatedUser(NearbyUsersWidget));
