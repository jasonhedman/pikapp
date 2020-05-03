import React from "react";
import { FlatList, Dimensions, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import { withTheme, Text } from "react-native-paper";

import { Block } from "galio-framework";
import firebase from 'firebase';
import { connectInfiniteHits } from "react-instantsearch-native";
import ProfilePic from "../Utility/ProfilePic";
import UserResult from "./SearchResults/UserResult";
import GroupResult from "./SearchResults/GroupResult";
import NoResults from "../Utility/NoResults";

class SearchResults extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    const colors = this.props.theme.colors;
    return (
      <Block flex style={{ marginTop: 4 }}>
        <Text
          style={{ color: "white", fontFamily: "ralewayBold", marginBottom: 4 }}
        >
          Search Results
        </Text>
        {
            this.props.hits.length > 0
            ? <FlatList
            data={this.props.hits}
            renderItem={({ item, index }) => {
                if(item.type == 'User' && item.id !== firebase.auth().currentUser.uid){
                    return <UserResult user={item} navigate={this.props.navigate} />
                } else if(item.type == 'Group'){
                    return <GroupResult group={item} navigate={this.props.navigate} />
                } else {
                  return null;
                }
            }}
            keyExtractor={(item) => item.objectID}
            onEndReached={() => this.props.hasMore && this.props.refine()}
            onScroll={Keyboard.dismiss}
          /> : <NoResults />
        }
       
      </Block>
    );
  }
}

export default withTheme(connectInfiniteHits(SearchResults));
