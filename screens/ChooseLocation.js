import React from 'react';
import {Dimensions,Keyboard,TouchableWithoutFeedback,ScrollView,TouchableOpacity} from 'react-native';
import {Block} from 'galio-framework';
import * as Location from 'expo-location';
import {withTheme, TextInput, Text, ActivityIndicator, Subheading} from 'react-native-paper'
import {getDistance} from 'geolib';
import Notification from '../components/Notification'
import HeaderBlock from '../components/HeaderBlock';
const fetch = require('node-fetch');

import * as firebase from 'firebase';
import 'firebase/firestore';

const {height, width} = Dimensions.get('window');

class SearchPlayers extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            search:"",
            userLoc:{},
            nearbyLocations: new Array()
        }
    }

    componentDidMount(){
        Location.getCurrentPositionAsync()
        .then((pos) => {
            this.setState({userLoc: pos.coords}, () => {
                Location.watchPositionAsync({}, (pos) => {
                    this.setState({ userPos: pos.coords});
                })
            });
        })
        .then(() => {
            Promise.all([
                fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?&key=AIzaSyBxFRIxQAqgsTsBQmz0nIGFkMuzbsOpBOE&location=${this.state.userLoc.latitude},${this.state.userLoc.longitude}&radius=1000.72&type=park`)
                .then((res) => res.json())
                .then((json) => {
                  this.setState({ nearbyLocations: json.results })
                })
            ])
        })
    }

    onSearch = (search) => {
        this.setState({search})
    }

    selectLocation = () => {
        this.props.navigation.navigate('MapScreen', {
            location: {
                name:'Current Location',
                coordinates: "test"
            }
        })
    }

    render(){
        const colors = this.props.theme.colors;
        return (
            <>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} height={height} width={width}>
                    <Block column flex style={{backgroundColor:colors.dBlue,padding:16,width,paddingTop:56}}>
                        <Block flex style={{}}>
                            <HeaderBlock text='Select Location'/>
                            <TextInput
                                mode={'outlined'}
                                theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                                placeholder={'Search Nearby Locations...'}
                                onChangeText={this.onSearch}
                                value={this.state.search}
                                style={{marginBottom:16}}
                            />
                            <Block flex>
                            </Block>
                            <TouchableOpacity onPress={() => this.selectLocation()}>
                                <Block row center style={{borderColor:colors.white,borderWidth:1,borderRadius:8, padding: 16,marginBottom:10}}>
                                    <Text style={{color:"#fff",textAlign:'center',width:'100%'}}>Use Current Location</Text>
                                </Block>
                            </TouchableOpacity>
                        </Block>
                    </Block>
                </TouchableWithoutFeedback>
            </>
        );
        
    }
}

export default withTheme(SearchPlayers);