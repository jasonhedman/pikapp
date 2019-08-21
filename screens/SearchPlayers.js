import React from 'react';
import {Dimensions,Keyboard,TouchableWithoutFeedback,ScrollView,TouchableHighlight} from 'react-native';
import {Block} from 'galio-framework';

import {withTheme, TextInput, Text, Headline, Subheading} from 'react-native-paper'

import SlideModal from 'react-native-modal';
import UserInfo from '../components/UserInfo'
import Notification from '../components/Notification'

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
                            firebase.firestore().collection('notifications').where('date', '==', new Date().toDateString()).orderBy('time','desc').get()
                                .then((notifications) => {
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

    render(){
        const colors = this.props.theme.colors;
        return (
            <>
                <SlideModal
                    transparent={true}
                    isVisible={this.state.visible}
                    style={{width,height,marginLeft:0,padding:0}}
                    backdropColor={colors.dBlue}
                    backdropOpacity={1}
                    coverScreen={true}
                >
                    <UserInfo currentUser={this.state.user} user={this.state.focusUser} close={this.closeModal} />
                </SlideModal>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} height={height} width={width}>
                    <Block column center flex style={{backgroundColor:colors.dBlue,width}}>
                        <Block flex width={width*.9}>
                            <Headline style={{color:"#FFF",textAlign:'center',marginTop:height*.1}}>Find Other Users</Headline>
                            <TextInput
                                mode={'outlined'}
                                theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                                placeholder={'Username'}
                                onChangeText={this.onSearch}
                                value={this.state.search}
                                style={{marginBottom:20}}
                            />
                            <Block flex>
                                {
                                    this.state.search != ""
                                    ? <ScrollView style={{}}>
                                    {
                                        this.state.filteredUsers.map((user,key) => {
                                            return (
                                                <TouchableHighlight onPress={() => this.onUserPress(user)} key={key}>
                                                    <Block row center middle style={{justifyContent:'space-between',borderColor:colors.orange,borderWidth:1,borderRadius:8, padding: 10, width: width*.9,marginBottom:10}}>
                                                        <Block column>
                                                            <Text style={{color:"#fff"}}>{user.name}</Text>
                                                            <Text style={{color:"#fff"}}>@{user.username}</Text>
                                                        </Block>
                                                        <Text style={{color:"#fff"}}>{`${user.wins}-${user.losses}`}</Text>
                                                    </Block>
                                                </TouchableHighlight>
                                            )
                                        })
                                    }
                                    </ScrollView>
                                    : <Block>
                                        <Subheading style={{color:colors.white, textAlign:'center',marginBottom:20}}>Recent Activity</Subheading>
                                        {
                                            this.state.notifications.length > 0
                                            ? this.state.notifications.map((notification, index) => {
                                                return (
                                                    <Notification notification={notification} key={index} navToMap={this.navToMap}/>
                                                )
                                            })
                                            : <Block center middle style={{width:width*.8, padding:10, borderWidth:1, borderRadius:8, borderColor:colors.orange}}>
                                                <Subheading style={{color:colors.grey,textAlign:'center'}}>Your friends have no recent activity. Connect with other users to see more.</Subheading>
                                            </Block>
                                        }
                                        
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