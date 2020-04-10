import React from 'react';
import {Dimensions,Keyboard,TouchableWithoutFeedback,ScrollView,TouchableOpacity} from 'react-native';
import {Block} from 'galio-framework';

import {withTheme, TextInput, Text, ActivityIndicator, Subheading} from 'react-native-paper'
import {getDistance} from 'geolib';
import HeaderBlock from '../../components/Utility/HeaderBlock';

import * as firebase from 'firebase';
import 'firebase/firestore';

const {height, width} = Dimensions.get('window');

class SearchPlayers extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            search:"",
            users:new Array(),
            filteredUsers: new Array(),
            notifications:new Array(),
            visible: false,
            focusUser: null,
            user:{},
            mutualFriends:[],
            mutualFriendsLoaded:false,
            nearbyComplete: false,
            nearby: {},
            nearbySortedKeys: new Array()
        }
    }


    componentDidMount(){
        let findMutualFriends = firebase.functions().httpsCallable('findMutualFriends');
        let nearby = {};
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
        .then((currentUser) => {
            Promise.all([
                firebase.firestore().collection('users')
                .where('location.latitude', '<', currentUser.data().location.latitude + (5*(1/69)))
                .where('location.latitude', '>', currentUser.data().location.latitude - (5*(1/69)))
                .get()
                .then((users) => {
                    users.forEach((user) => {
                        nearby[user.id] = user.data();
                    })
                }),
                firebase.firestore().collection('users')
                .where('location.longitude', '<', currentUser.data().location.longitude + (5*(1/69)))
                .where('location.longitude', '>', currentUser.data().location.longitude - (5*(1/69)))
                .get()
                .then((users) => {
                    users.forEach((user) => {
                        nearby[user.id] = user.data();
                    })
                }),
                this.setState({user:currentUser.data()}),
                findMutualFriends({user:currentUser.data(),id:currentUser.id})
                .then((result) => {
                    this.setState({mutualFriendsLoaded:true,mutualFriends:result.data});
                })
            ])
            .then(() => {
                let nearbySortedKeys = Object.keys(nearby).sort((a,b) => {return getDistance(nearby[a].location, this.state.user.location) - getDistance(nearby[b].location, this.state.user.location)})
                this.setState({nearby,nearbyComplete:true,nearbySortedKeys}, () => {
                    firebase.firestore().collection('users').get().then((allUsers) => {
                        let users = [];
                        allUsers.forEach((user) => {
                            if(user.id != firebase.auth().currentUser.uid){
                                users.push(user.data())
                            }
                        })
                        this.setState({users});
                    })
                });
                
            })
        })
        

    }

    onSearch = (search) => {
        let filteredUsers = this.state.users.filter((user) => {
            return user.username.includes(search.toLowerCase());
        });
        filteredUsers.sort((a,b) => {
            return a.username.indexOf(search.toLowerCase()) - b.username.indexOf(search.toLowerCase())
        })
        this.setState({search,filteredUsers})
    }

    openModal = () => {
        this.setState({visible:true})
    }

    closeModal = () => {
        this.setState({visible:false})
    }

    onUserPress = (user) => {
        this.setState({focusUser:user,visible:true})
    }

    navToUserProfile = (id) => {
        if(id != firebase.auth().currentUser.uid){
          this.props.navigation.navigate("UserProfile", {userId:id});
         } else {
          this.props.navigation.navigate('ProfileStack')
         }
      }

    render(){
        const colors = this.props.theme.colors;
        return (
            <>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} height={height} width={width}>
                    <Block column flex style={{backgroundColor:colors.dBlue,padding:16,width,paddingTop:56}}>
                        <Block flex style={{}}>
                            <HeaderBlock text='Find Other Users' />
                            <TextInput
                                mode={'outlined'}
                                theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                                placeholder={'Username'}
                                onChangeText={this.onSearch}
                                value={this.state.search}
                                style={{marginBottom:16}}
                            />
                            <Block flex>
                                {
                                    this.state.search != ""
                                    ? <>
                                        <Subheading style={{color:colors.white, textAlign:'center',marginBottom:16}}>Results</Subheading>
                                        <ScrollView style={{width:'100%'}}>
                                        {
                                            this.state.filteredUsers.map((user,key) => {
                                                return (
                                                    <TouchableOpacity onPress={() => this.navToUserProfile(user.id)} key={key} style={{width:'100%'}}>
                                                        <Block row middle style={{justifyContent:'space-between',borderColor:colors.orange,borderWidth:1,borderRadius:8, padding: 10,marginBottom:10}}>
                                                            <Block column>
                                                                <Text style={{color:"#fff"}}>{user.name}</Text>
                                                                <Text style={{color:"#fff"}}>@{user.username}</Text>
                                                            </Block>
                                                            <Text style={{color:"#fff"}}>{`${user.points} point${user.points == 1 ? "" : "s"}`}</Text>
                                                        </Block>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                        </ScrollView>
                                    </>
                                    : <>
                                        <Subheading style={{color:colors.white, textAlign:'center',marginBottom:16}}>{this.state.mutualFriends.length > 0 ? 'Recommended Friends' : 'Nearby Players'}</Subheading>
                                        <ScrollView style={{width:'100%'}}>
                                        {
                                            this.state.mutualFriendsLoaded && this.state.nearbyComplete
                                            ?   this.state.mutualFriends.length > 0
                                                ?   this.state.mutualFriends.map((user,key) => {
                                                        return (
                                                            <TouchableOpacity onPress={() => this.navToUserProfile(user.id)} key={key} style={{width:'100%'}}>
                                                                <Block row middle style={{justifyContent:'space-between',borderColor:colors.orange,borderWidth:1,borderRadius:8, padding: 10,marginBottom:10}}>
                                                                    <Block column>
                                                                        <Text style={{color:"#fff"}}>{user.name}</Text>
                                                                        <Text style={{color:"#fff"}}>@{user.username}</Text>
                                                                    </Block>
                                                                    <Text style={{color:"#fff"}}>{`${user.mutualFriends} Mutual Friend${user.mutualFriends > 1 ? 's' : ''}`}</Text>
                                                                </Block>
                                                            </TouchableOpacity>
                                                        )
                                                    })
                                                :   this.state.nearbySortedKeys.map((userId,key) => {
                                                        if(this.state.user.friendsList.includes(userId) || userId == firebase.auth().currentUser.uid){
                                                            return null;
                                                        } else {
                                                            let user = this.state.nearby[userId];
                                                            let distance = Math.round(getDistance(user.location, this.state.user.location) * 0.000621371);
                                                            return (
                                                                <TouchableOpacity onPress={() => this.navToUserProfile(user.id)} key={key} style={{width:'100%'}}>
                                                                    <Block row center middle style={{justifyContent:'space-between',borderColor:colors.orange,borderWidth:1,borderRadius:8, padding: 10, width:'100%', marginBottom:10}}>
                                                                        <Block column>
                                                                            <Text style={{color:"#fff"}}>{user.name}</Text>
                                                                            <Text style={{color:"#fff"}}>@{user.username}</Text>
                                                                        </Block>
                                                                        <Text style={{color:"#fff"}}>{`${distance < 1 ? "<1" : distance} ${distance < 2 ? "Mile" : "Miles"} Away`}</Text>
                                                                    </Block>
                                                                </TouchableOpacity>
                                                            )
                                                        }
                                                    })
                                            :   <ActivityIndicator style={{opacity:1}} animating={true} color={this.props.theme.colors.orange} size={'small'} />
                                            
                                        }
                                        </ScrollView>
                                    </>
                                }
                            </Block>
                            
                        </Block>
                    </Block>
                </TouchableWithoutFeedback>
            </>
        );
        
    }
}

export default withTheme(SearchPlayers);