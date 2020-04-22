import React from "react";
import { FlatList } from "react-native";
import { connectRefinementList } from "react-instantsearch-native";
import { Block } from "galio-framework";
import { Chip, withTheme } from "react-native-paper";

class RefinementList extends React.Component {
  render() {
    const colors = this.props.theme.colors;
    return (
      <Block middle>
        <FlatList
          data={this.props.items}
          renderItem={({ item, index }) => (
            <Chip
            //   icon='account'
                onPress={() => this.props.refine(item.value)}
              style={{ backgroundColor:colors.orange, marginRight: 8, borderColor: colors.orange }}
              theme={{
                colors: {
                  text: colors.white,
                },
              }}
              selected={this.props.currentRefinement.includes(item.label)}
            >
              {item.label + "s"}
            </Chip>
          )}
          keyExtractor={(item) => item.label}
          horizontal={true}
        />
      </Block>
    );
  }
}

export default withTheme(connectRefinementList(RefinementList));
