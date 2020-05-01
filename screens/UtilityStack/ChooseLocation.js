import React from "react";
import {
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Block } from "galio-framework";
import * as Location from "expo-location";
import {
  withTheme,
  TextInput,
  Text,
  ActivityIndicator,
  Subheading,
} from "react-native-paper";
import { getDistance } from "geolib";
const fetch = require("node-fetch");

import "firebase/firestore";
import NoResults from "../../components/Utility/NoResults";
import trace from "../../services/trace";

class SearchPlayers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      userLoc: {},
      nearbyLocations: new Array(),
      searchResults: new Array(),
      searchComplete: false,
      nearbyLocationsComplete: false,
    };
  }

  componentDidMount() {
    Location.getCurrentPositionAsync()
      .then((pos) => {
        this.setState({ userLoc: pos.coords }, () => {
          fetch(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?&key=AIzaSyBxFRIxQAqgsTsBQmz0nIGFkMuzbsOpBOE&location=${this.state.userLoc.latitude},${this.state.userLoc.longitude}&radius=4828.03&keyword=field,park`
          )
            .then((res) => res.json())
            .then((json) => {
              this.setState({
                nearbyLocations: json.results,
                nearbyLocationsComplete: true,
              });
            });
          Location.watchPositionAsync({}, (pos) => {
            this.setState({ userLoc: pos.coords });
          });
        });
      })
      .catch((error) => {
        console.log("ERROR: location");
        trace(
          this,
          `ERROR doing something with location${error}`,
          "componentDidMount"
        );
      });
  }

  onSearch = (search) => {
    this.setState({ search });
  };

  onSearchBlur = () => {
    fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?&key=AIzaSyBxFRIxQAqgsTsBQmz0nIGFkMuzbsOpBOE&location=${this.state.userLoc.latitude},${this.state.userLoc.longitude}&origin=${this.state.userLoc.latitude},${this.state.userLoc.longitude}&radius=8000.03&input=${this.state.search}&strictbounds`
    )
      .then((res) => res.json())
      .then((json) => {
        Promise.all(
          json.predictions.map((prediction) => {
            return fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyBxFRIxQAqgsTsBQmz0nIGFkMuzbsOpBOE&place_id=${prediction.place_id}&fields=geometry,name,photo`
            )
              .then((res) => res.json())
              .then((json) => {
                return json.result;
              });
          })
        ).then((searchResults) => {
          searchResults.sort((a, b) => {
            return (
              getDistance(a.geometry.location, this.state.userLoc) -
              getDistance(b.geometry.location, this.state.userLoc)
            );
          });
          this.setState({ searchResults, searchComplete: true });
        });
      });
  };

  render() {
    const colors = this.props.theme.colors;
    return (
      <>
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          style={{ flex: 1 }}
        >
          <Block flex style={{ padding: 16, backgroundColor: colors.dBlue }}>
            <TextInput
              mode={"outlined"}
              theme={{
                colors: {
                  text: colors.white,
                  placeholder: colors.white,
                  underlineColor: colors.orange,
                  selectionColor: colors.orange,
                  primary: colors.orange,
                },
              }}
              placeholder={"Search Nearby Locations..."}
              onChangeText={this.onSearch}
              value={this.state.search}
              style={{ marginBottom: 16 }}
              onBlur={this.onSearchBlur}
              returnKeyType='search'
              onSubmitEditing={this.onSearchBlur}
              dense={true}
            />
            <Subheading
              style={{
                textAlign: "center",
                color: "white",
                marginBottom: 16,
              }}
              theme={{ fonts: { medium: this.props.theme.fonts.regular } }}
            >
              {this.state.search == "" || !this.state.searchComplete
                ? "Suggested Locations"
                : "Search Results"}
            </Subheading>
            <ScrollView>
              {this.state.search == "" || !this.state.searchComplete ? (
                this.state.nearbyLocationsComplete ? (
                  this.state.nearbyLocations.length > 0 ? (
                    this.state.nearbyLocations.map((value, index) => {
                      let distance = Math.round(
                        getDistance(
                          value.geometry.location,
                          this.state.userLoc
                        ) * 0.00062137
                      );
                      return (
                        <TouchableOpacity
                          key={index}
                          style={{ width: "100%" }}
                          onPress={() =>
                            this.props.navigation.navigate("GameForm", {
                              location: {
                                name: value.name,
                                coordinates: {
                                  longitude: value.geometry.location.lng,
                                  latitude: value.geometry.location.lat,
                                },
                              },
                            })
                          }
                        >
                          <Block
                            row
                            center
                            style={{
                              borderColor: colors.white,
                              borderWidth: 1,
                              borderRadius: 8,
                              padding: 16,
                              marginBottom: 10,
                              width: "100%",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text
                              style={{ color: "#fff", textAlign: "center" }}
                            >
                              {value.name}
                            </Text>
                            <Text
                              style={{ color: "#fff", textAlign: "center" }}
                            >{`${distance} ${
                              distance < 2 ? "Mile" : "Miles"
                            } Away`}</Text>
                          </Block>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <NoResults border={true} />
                  )
                ) : (
                  <ActivityIndicator
                    style={{ opacity: 1 }}
                    animating={true}
                    color={this.props.theme.colors.orange}
                    size={"small"}
                  />
                )
              ) : this.state.searchResults.length > 0 ? (
                this.state.searchResults.map((value, index) => {
                  let distance = Math.round(
                    getDistance(value.geometry.location, this.state.userLoc) *
                      0.00062137
                  );
                  return (
                    <TouchableOpacity
                      key={index}
                      style={{ width: "100%" }}
                      onPress={() =>
                        this.props.navigation.navigate("GameForm", {
                          location: {
                            name: value.name,
                            coordinates: {
                              longitude: value.geometry.location.lng,
                              latitude: value.geometry.location.lat,
                            },
                          },
                        })
                      }
                    >
                      <Block
                        row
                        center
                        style={{
                          borderColor: colors.white,
                          borderWidth: 1,
                          borderRadius: 8,
                          padding: 16,
                          marginBottom: 10,
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ color: "#fff", textAlign: "center" }}>
                          {value.name}
                        </Text>
                        <Text
                          style={{ color: "#fff", textAlign: "center" }}
                        >{`${distance} ${
                          distance < 2 ? "Mile" : "Miles"
                        } Away`}</Text>
                      </Block>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <NoResults border={true} />
              )}
            </ScrollView>

            <Block flex></Block>
            <TouchableOpacity
              onPress={() =>
                this.props.selectLocation(
                  "User-Created Location",
                  this.state.userLoc
                )
              }
            >
              <Block
                row
                center
                style={{
                  borderColor: colors.orange,
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  Use Current Location
                </Text>
              </Block>
            </TouchableOpacity>
          </Block>
        </TouchableWithoutFeedback>
      </>
    );
  }
}

export default withTheme(SearchPlayers);
