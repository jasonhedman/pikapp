import React from 'react';
import {SafeAreaView} from 'react-native'
import {withTheme} from 'react-native-paper';
import { Block } from "galio-framework";
import GroupPreview from '../../components/Groups/GroupPreview';

import firebase from 'firebase';
import firestore from 'firebase/firestore'
import HeaderBlock from '../../components/Utility/HeaderBlock';


class GroupList extends React.Component {

    constructor(){
        super();
        this.state = {
            groups: new Array()
        }
    }

    componentDidMount(){
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).onSnapshot((user) => {
            Promise.all(
                user.data().groups.map((groupId) => {
                    return firebase.firestore().collection('groups').doc(groupId).get().then((group) => {
                        return group.data()
                    })
                })
            ).then((groups) => {
                this.setState({groups})
            })
        })
    }

    render(){
        const colors = this.props.theme.colors;
        return (
            <SafeAreaView style={{flex:1,backgroundColor:colors.dBlue}}>
                <Block flex style={{padding:16}}>
                    {
                        this.state.groups.map((group, index) => {
                            return (
                                <GroupPreview
                                    key={index}
                                    group={group}
                                    navigate={this.props.navigation.navigate}
                                />
                            )
                        })
                    }
                </Block>
            </SafeAreaView>
        )  
    }
}

export default withTheme(GroupList);