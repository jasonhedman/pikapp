import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import { Block } from "galio-framework";
import TeamMember from "./TeamMember";

import { getDistance } from "geolib";

import { Headline, withTheme, Button, Text } from "react-native-paper";

const { width, height } = Dimensions.get("screen");

class LobbyModal extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const colors = this.props.theme.colors;
    let marker = this.props.marker;
    if (marker != undefined) {
      return (
        <Block
          column
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.dBlue,
              borderTopWidth: 2,
              borderTopColor: colors.orange,
            },
          ]}
        >
          <Headline
            style={{
              color: this.props.theme.colors.white,
              textAlign: "center",
              marginTop: 16,
              marginBottom: 8,
            }}
          >{`${
            marker.intensity[0].toUpperCase() + marker.intensity.substring(1)
          } ${
            marker.sport[0].toUpperCase() + marker.sport.substring(1)
          }`}</Headline>
          <Text
            style={{ color: colors.grey, textAlign: "center", marginBottom: 2 }}
            theme={{ fonts: { medium: this.props.theme.fonts.regular } }}
          >{`Owner: @${marker.owner.username}`}</Text>
          <Text
            style={{ color: colors.grey, textAlign: "center", marginBottom: 2 }}
            theme={{ fonts: { medium: this.props.theme.fonts.regular } }}
          >{`Time: ${marker.startTime.timeString}`}</Text>
          <Text
            style={{ color: colors.grey, textAlign: "center", marginBottom: 2 }}
          >{`Location: ${marker.locationName}`}</Text>
          {marker.group.title != null ? (
            <Text
              style={{
                color: colors.grey,
                textAlign: "center",
                marginBottom: 2,
              }}
            >{`Group: ${marker.group.title}`}</Text>
          ) : null}
          <Block column middle style={{ padding: 8 }}>
            <ScrollView style={{ width: "100%", maxHeight: height * 0.4 }}>
              <Block row style={{ flexWrap: "wrap" }}>
                {this.props.marker.players.map((player, index) => {
                  return (
                    <Block
                      key={index}
                      style={{
                        flexBasis: "50%",
                        paddingHorizontal: 4,
                        paddingTop: 4,
                      }}
                    >
                      <TeamMember
                        key={index}
                        user={player}
                        navToUserProfile={this.props.navToUserProfile}
                        closeModal={this.props.closeModal}
                      />
                    </Block>
                  );
                })}
              </Block>
            </ScrollView>
            <Button
              mode='contained'
              dark={true}
              disabled={
                !marker.gameState == "created" ||
                getDistance(this.props.userLoc, this.props.marker.location) *
                  0.000621371 >
                  10 ||
                this.props.user.calendar.includes(marker.id)
              }
              onPress={() => {
                this.props.addToTeam(marker.id);
              }}
              style={[
                styles.joinButton,
                !marker.gameState == "created" ||
                getDistance(this.props.userLoc, this.props.marker.location) *
                  0.000621371 >
                  10 ||
                this.props.user.calendar.includes(marker.id)
                  ? styles.disabled
                  : null,
              ]}
              theme={{
                colors: { primary: colors.orange },
                fonts: { medium: this.props.theme.fonts.regular },
              }}
            >
              Join Game
            </Button>
          </Block>
        </Block>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    width: width,
    zIndex: 100,
  },
  disabled: {
    opacity: 0.3,
    backgroundColor: "#E68A54",
  },
  joinButton: {
    marginTop: 12,
  },
});

export default withTheme(LobbyModal);
