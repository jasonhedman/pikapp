import React from 'react';
import {
  StyleSheet,
  Dimensions,
  ScrollView
} from 'react-native'
import { Block } from "galio-framework";
import TeamMember from './TeamMember';

import { getDistance } from 'geolib';

import { Headline, withTheme, Subheading, Button, Text } from 'react-native-paper';

import moment from 'moment';
import HeaderBlock from './HeaderBlock';

const { width, height } = Dimensions.get("screen");

class LobbyModal extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const colors = this.props.theme.colors;
    let marker = this.props.marker;
    return (
      <Block column style={[styles.modalContainer, { backgroundColor: colors.dBlue, borderTopWidth: 2, borderTopColor: colors.orange }]}>
        <Headline style={{ color: this.props.theme.colors.white, textAlign: 'center', marginTop: 16, marginBottom: 8 }}>{`${marker.intensity[0].toUpperCase() + marker.intensity.substring(1)} ${marker.sport[0].toUpperCase() + marker.sport.substring(1)}`}</Headline>
        <Subheading style={{ color: colors.grey, textAlign: "center" }}>{`Owner: @${marker.owner.username}`}</Subheading>
        <Subheading style={{ color: colors.grey, textAlign: "center" }}>{`Created ${moment.unix(parseInt(marker.time.seconds)).fromNow()}`}</Subheading>
        <Block column middle style={{ padding: 8 }}>
          <ScrollView style={{ width: "100%", maxHeight: height * .4 }}>
            <Block row style={{ flexWrap: "wrap" }}>
              {
                this.props.marker.players.map((player, index) => {
                  return (
                    <Block style={{ flexBasis: "50%", padding: 4 }}>
                      <TeamMember key={index} user={player} navToUserProfile={this.props.navToUserProfile} closeModal={this.props.closeModal} />
                    </Block>
                  )
                })
              }
            </Block>
          </ScrollView>
          <Button
            mode="contained"
            dark={true}
            disabled={!(marker.gameState == 'created' && this.props.user.currentGame == null && (getDistance(this.props.userLoc, this.props.marker.location) * 0.000621371) < 5)}
            onPress={() => { this.props.addToTeam(marker.id, 'home') }}
            style={[styles.joinButton, !(marker.gameState == 'created' && this.props.user.currentGame == null && (getDistance(this.props.userLoc, this.props.marker.location) * 0.000621371) < 2) ? styles.disabled : null]}
            theme={{ colors: { primary: colors.orange }, fonts: { medium: this.props.theme.fonts.regular } }}
          >
            Join Team
            </Button>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    width: width,
    zIndex: 100
  },
  disabled: {
    opacity: .3,
    backgroundColor: '#E68A54'
  },
  joinButton: {
    marginTop: 12,
  }
})

export default withTheme(LobbyModal);