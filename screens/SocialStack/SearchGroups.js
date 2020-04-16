import React from 'react';
import {SafeAreaView,TouchableWithoutFeedback,Keyboard, ScrollView, TouchableOpacity} from 'react-native'
import {withTheme, TextInput, Subheading, Text, Avatar} from 'react-native-paper';
import { Block } from "galio-framework";

import firebase from 'firebase'
import 'firebase/firestore';

import basketball from '../../assets/images/Basketball.png'
import soccer from '../../assets/images/Soccer.png'
import spikeball from '../../assets/images/Spikeball.png'
import volleyball from '../../assets/images/Volleyball.png'
import football from '../../assets/images/Football.png'

const sports = {
    basketball: basketball,
    soccer: soccer,
    spikeball: spikeball,
    volleyball: volleyball,
    football: football
}


class SerachGroups extends React.Component {
    constructor(){
        super();
        this.state = {
            groups: [],
            filteredGroups: [],
            search: ''
        }
    }

    componentDidMount(){
        let groups = []
        firebase.firestore().collection('groups').get().then((groupList) => {
            groupList.forEach((group) => {
                groups.push(group.data());
            })
            this.setState({groups});
        })
    }

    onSearch = (search) => {
        let filteredGroups = this.state.groups.filter((group) => {
            return group.title.toLowerCase().includes(search.toLowerCase());
        });
        filteredGroups.sort((a,b) => {
            return a.title.toLowerCase().indexOf(search.toLowerCase()) - b.title.toLowerCase().indexOf(search.toLowerCase())
        })
        this.setState({search,filteredGroups})
    }

    render(){
        const colors = this.props.theme.colors;
        return (
            <SafeAreaView style={{flex:1,backgroundColor:colors.dBlue}}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{flex:1}}>
                    <Block flex style={{padding:16}}>
                        <TextInput
                            mode={'outlined'}
                            theme={{colors: {text:colors.white,placeholder:colors.white,underlineColor:colors.orange,selectionColor:colors.orange,primary:colors.orange}}}
                            placeholder={'Group Name'}
                            onChangeText={this.onSearch}
                            value={this.state.search}
                            style={{marginBottom:16}}
                        />
                        <Block flex>
                            {
                                this.state.search != ""
                                ? <>
                                    <ScrollView style={{width:'100%'}}>
                                    {
                                        this.state.filteredGroups.length > 0 ?
                                        this.state.filteredGroups.map((group,key) => {
                                            return (
                                                <TouchableOpacity key={key} onPress={() => {this.props.navigation.navigate("GroupInfo", {groupId:group.id,groupTitle:group.title})}}>
                                                    <Block row middle style={{borderWidth:1, borderRadius: 8, borderColor:colors.orange,paddingVertical:10, paddingHorizontal:6,marginBottom:8}}>
                                                        <Block center middle row style={{marginRight:6}}>
                                                            {
                                                                Object.keys(group.sports).map((sport, index) => {
                                                                    return (
                                                                        <Block key={index} style={{borderWidth:1,borderRadius:"50%",borderColor:colors.orange,padding:6,backgroundColor:colors.dBlue,marginLeft:(index == 0 ? 0 : -18)}}>
                                                                            <Avatar.Image
                                                                                size={24}
                                                                                source={sports[sport]}
                                                                            />
                                                                        </Block>
                                                                    )
                                                                })
                                                            }
                                                        </Block>
                                                        <Block column>
                                                            <Text style={{color:colors.white,fontSize:20,marginBottom:4}}>{group.title}</Text>
                                                            <Text style={{color:colors.grey}}>{group.private ? "Private Group" : "Open Group"}</Text>
                                                        </Block>
                                                        <Text style={{color:colors.grey,fontSize:16,marginLeft:'auto'}}>{`${group.users.length} ${(group.users.length == 1 ? "User" : "Users")}`}</Text>
                                                    </Block>
                                                </TouchableOpacity>
                                            )
                                        }) : <Block
                                        row
                                        center
                                        middle
                                        style={{
                                          borderColor: colors.grey,
                                          borderWidth: 1,
                                          borderRadius: 8,
                                          padding: 10,
                                          width: "100%",
                                          marginBottom: 10,
                                        }}
                                      >
                                        <Text style={{ color: "#fff" }}>No Results</Text>
                                      </Block>
                                    }
                                    </ScrollView>
                                </>
                                : <>
                                    <Subheading style={{color:colors.white, textAlign:'center',marginBottom:16}}>Suggested Groups</Subheading>
                                    <ScrollView style={{width:'100%'}}>
                                    </ScrollView>
                                </>
                            }
                        </Block>
                    </Block>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        )  
    }
}

export default withTheme(SerachGroups);