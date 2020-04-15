import React from 'react';
import {SafeAreaView,StyleSheet,Keyboard,Dimensions,KeyboardAvoidingView} from 'react-native'
import {withTheme, FAB, Portal, Modal} from 'react-native-paper';
import { Block } from "galio-framework";
import HeaderBlock from '../../components/Utility/HeaderBlock';
import firebase from 'firebase'

const {height, width} = Dimensions.get('window');

class SocialScreen extends React.Component {

    constructor(){
        super();
        this.state = {
            createGroupModalVisible: false,
            keyboardOpen:false,
            title: '',
            description: '',
            private: false,
            basketball:false,
            soccer: false,
            spikeball: false,
            volleyball: false,
            football: false,
        }
    }

    componentDidMount(){
        
    }

    render(){
        const colors = this.props.theme.colors;
        return (
                <>
                    <SafeAreaView style={{flex:1,backgroundColor:colors.dBlue}}>
                        <FAB
                            icon="plus"
                            label="See Groups"
                            onPress={() => { this.props.navigation.navigate('GroupList') }}
                            style={[styles.fab, { backgroundColor: colors.orange, color: colors.white }]}
                        />
                        <FAB
                            icon="plus"
                            label="Create Group"
                            onPress={() => { this.props.navigation.navigate('CreateGroup') }}
                            style={[styles.fab, { backgroundColor: colors.orange, color: colors.white }]}
                        />
                        <FAB
                            icon="plus"
                            label="Search Groups"
                            onPress={() => { this.props.navigation.navigate('SearchGroups') }}
                            style={[styles.fab, { backgroundColor: colors.orange, color: colors.white }]}
                        />
                        <FAB
                            icon="plus"
                            label="Search Players"
                            onPress={() => { this.props.navigation.navigate('SearchPlayers') }}
                            style={[styles.fab, { backgroundColor: colors.orange, color: colors.white }]}
                        />
                        <FAB
                            icon="plus"
                            label="Social Activity"
                            onPress={() => { this.props.navigation.navigate('SocialNotifications', {userId: firebase.auth().currentUser.uid}) }}
                            style={[styles.fab, { backgroundColor: colors.orange, color: colors.white }]}
                        />
                    </SafeAreaView>
                </>
        )  
    }
}

const styles = StyleSheet.create({
    fab: {
      marginTop: 8,
      zIndex: 2
    }
  });

export default withTheme(SocialScreen);