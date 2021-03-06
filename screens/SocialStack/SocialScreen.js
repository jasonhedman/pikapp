import React from "react";
import { SafeAreaView, StyleSheet, Keyboard, ScrollView } from "react-native";
import { Block } from "galio-framework";
import { withTheme } from "react-native-paper";
import SocialHeader from "../../components/Social/SocialHeader";
import NearbyUsersWidget from "../../components/Social/NearbyUsersWidget";
import GroupsWidget from "../../components/Social/GroupsWidget";
import MutualFriendsWidget from "../../components/Social/MutualFriendsWidget";
import {
  InstantSearch,
} from "react-instantsearch-native";
import algoliasearch from "algoliasearch";
import SearchResults from "../../components/Social/SearchResults";
import RefinementList from "../../components/Social/RefinementList";

const searchClient = algoliasearch(
  "T93FHT6W2G",
  "663dbce0dd021993d9b947239165a812"
);

class SocialScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      search: "",
      mutualFriends: new Array(),
      nearbyUsers: new Array(),
    };
  }

  setParentState = (key, value) => {
    this.setState({[key]: value})
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

  onSearch = (search, func) => {
    this.setState({ search }, func);
  };

  render() {
    const colors = this.props.theme.colors;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.dBlue }}>
        <Block flex style={{ paddingHorizontal: 8, overflow: "visible" }}>
          <InstantSearch searchClient={searchClient} indexName='social'>
            <SocialHeader
              search={this.state.search}
              navigate={this.props.navigation.navigate}
              onSearch={this.onSearch}
            />
            {this.state.search == "" ? (
              <>
                <NearbyUsersWidget navToUserProfile={this.navToUserProfile} setParentState={this.setParentState} nearbyUsers={this.state.nearbyUsers}/>
                <GroupsWidget navigate={this.props.navigation.navigate} />
                <MutualFriendsWidget navToUserProfile={this.navToUserProfile} setParentState={this.setParentState} mutualFriends={this.state.nearbyUsers}/>
              </>
            ) : (
              <>
                <RefinementList attribute='type' />
                <SearchResults navigate={this.props.navigation.navigate} />
              </>
            )}
          </InstantSearch>
        </Block>
      </SafeAreaView>
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
