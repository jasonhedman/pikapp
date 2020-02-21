import React from 'react';
import {Dimensions,Keyboard,TouchableWithoutFeedback,ScrollView,TouchableOpacity} from 'react-native';
import {Block} from 'galio-framework';

import {withTheme, TextInput, Text, Headline, Subheading} from 'react-native-paper'

import Notification from '../components/Notification'
import HeaderBlock from '../components/HeaderBlock';

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
            user:{}
        }
    }

    componentDidMount(){
        firebase.firestore().collection('users').get()
            .then((users) => {
                let userArray = [];
                users.forEach(user => {
                    if(user.id != firebase.auth().currentUser.uid){
                        let userData = user.data();
                        userData.id  = user.id;
                        userArray.push(userData);
                    } else {
                        this.setState({user:user.data()}, () => {
                            firebase.firestore().collection('notifications').where('date', '==', new Date().toDateString()).orderBy('time','desc').onSnapshot((notifications) => {
                                let notificationsList = new Array();
                                notifications.forEach((notification) => {
                                    notificationsList.push(notification.data());
                                })
                                notificationsList = notificationsList.filter((notification) => {
                                    return this.state.user.friendsList.includes(notification.userId)
                                })
                                this.setState({notifications:notificationsList});
                            })
                        })
                    }
                });
                this.setState({users:userArray});
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

    navToMap = (marker) => {
        this.props.navigation.navigate('MapScreen',{marker});
    }

    navToUserProfile = (id) => {
        if(id != firebase.auth().currentUser.uid){
          this.props.navigation.navigate("UserProfile", {userId:id});
         } else {
          this.props.navigation.navigate('Profile')
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
                                <Subheading style={{color:colors.white, textAlign:'center',marginBottom:16}}>Results</Subheading>
                                {
                                    this.state.search != ""
                                    ? <ScrollView style={{width:'100%'}}>
                                    {
                                        this.state.filteredUsers.map((user,key) => {
                                            return (
                                                <TouchableOpacity onPress={() => this.navToUserProfile(user.id)} key={key} style={{width:'100%'}}>
                                                    <Block row middle style={{justifyContent:'space-between',borderColor:colors.orange,borderWidth:1,borderRadius:8, padding: 10,marginBottom:10}}>
                                                        <Block column>
                                                            <Text style={{color:"#fff"}}>{user.name}</Text>
                                                            <Text style={{color:"#fff"}}>@{user.username}</Text>
                                                        </Block>
                                                        <Text style={{color:"#fff"}}>{`${user.wins}-${user.losses}`}</Text>
                                                    </Block>
                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                    </ScrollView>
                                    : <Block style={{borderColor:colors.orange,borderWidth:1,borderRadius:8, padding:16}}>
                                        <Subheading style={{color:colors.white, textAlign:'center'}}>Start typing to find users...</Subheading>
                                    </Block>
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