import React, {Component} from 'react';
import {Platform, Text, View, BackHandler, FlatList, StatusBar, NativeModules, StatusBarIOS, Split} from 'react-native';
import { Toolbar } from 'react-native-material-ui';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const { StatusBarManager } = NativeModules;
import firebase from 'react-native-firebase';
import { Button } from 'react-native-material-buttons';
import { NavigationActions } from 'react-navigation';

export default class ScannedQRsScreen extends Component {

  constructor(props){
    super(props);
    this.ref = firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid);
    this.state = {
      statusBarHeight: 0,
      flatListData: null,
      noQRs: true,
      originalStart: true,
      onSnapshotListener: this.ref.onSnapshot(this.onSnapshotListenerFunc, this.onSnapshotErrorFunc)
    };
  }

  willFocus = this.props.navigation.addListener(
    'willFocus',
    payload => {
      if(this.state.originalStart){
        this.setState({originalStart: false});
      } else {
        this.state.onSnapshotListener();
      }
      this.state = {onSnapshotListener: this.ref.onSnapshot(this.onSnapshotListenerFunc, this.onSnapshotErrorFunc)};
      this.rerender();
    }
  );

  onSnapshotListenerFunc = (data)=>{
    if(data.exists){
      if(!!data.data().scannedqrs){
        this.setState({noQRs: true});
        if(data.data().scannedqrs.length == 0) this.setState({noQRs: true}); else {
          this.setState({noQRs: false});
          this.getFlatListData(data.data().scannedqrs);
        }
      }
    }
  }

  onSnapshotErrorFunc = (err)=>{
    this.setState({listOrNoQrMessage: <View style={{alignSelf: "center", flexDirection: "row", flex: 1}}><View style={{alignSelf: "center", flexDirection: "column", flex: 1}}><Text style={{paddingHorizontal: 24, textAlign: "center"}}>{err.message}</Text></View></View>});
  }

  componentDidMount() {
    this.ref.onSnapshot(this.onSnapshotListenerFunc, this.onSnapshotErrorFunc);
    this.rerender();
    StatusBar.setBarStyle("light-content")
    if (Platform.OS === 'ios') {
      StatusBarManager.getHeight(response =>
          this.setState({statusBarHeight: response.height})
      )
  
      this.listener = StatusBarIOS.addListener('statusBarFrameWillChange',
        (statusBarData) =>
          this.setState({statusBarHeight: statusBarData.frame.height})
      )
    } else {
      StatusBar.setBackgroundColor("#000000");
    }
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    this.rerender();
  }

  rerender(){
    this.setState(this.state);
    this.forceUpdate();
  }

  componentWillUnmount() {
    if (Platform.OS === 'ios' && this.listener) {
      this.listener.remove()
    }
    if(Platform.OS == 'android') {
      StatusBar.setBackgroundColor("#000000");
      StatusBar.setBarStyle("light-content");
  }
    else StatusBar.setBarStyle("light-content");
    this.state.onSnapshotListener();
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  handleBackButton() {
    return true;
  }

  render() {
    return <View style={{flex: 1, backgroundColor: Platform.OS == 'android' ? "#FFFFFF" : "#000000", paddingTop: Platform.OS === 'ios' ? this.state.statusBarHeight : 0}}>
      <Toolbar
      leftElement="arrow-back"
      onLeftElementPress={()=>{    
          const backAction = NavigationActions.back({
              key: null
          });
          
          this.props.navigation.dispatch(backAction);
      }}
        centerElement="Scanned QR's"
        style={{
          container: {
            backgroundColor: "#000000"
          }
        }}
      />
      <View style={{flex: 1, backgroundColor: "#ffffff"}}>
        {(this.state.noQRs)?<View style={{alignSelf: "center", flexDirection: "row", flex: 1}}><View style={{alignSelf: "center", flexDirection: "column", flex: 1}}><Text style={{paddingHorizontal: 24, textAlign: "center"}}>You have no Scanned QR Codes.</Text></View></View>:<FlatList data={this.state.flatListData} extraData={this.state} renderItem={({item})=>{
        if(item.customElement == true){
          return item.element;
        } else {
          return <Button style={{backgroundColor: "#FFFFFF"}} onPress={()=>{this.props.navigation.navigate("ViewQR", {
            id: item.id
          })}}>
            <View style={{height: 73, flex: 1, flexDirection: "column"}}>
              <View style={{height: 72, flex: 1, flexDirection: "row"}}>
                <View style={{height: 32, width: 32, margin: 20}}>
                  <MaterialCommunityIcons name="qrcode-edit" size={32} color="#000000"></MaterialCommunityIcons>
                </View>
                <View style={{paddingTop: 26, paddingBottom: 26, flex: 1}}>
                  <Text style={{fontSize: 16, fontWeight: "700", color: "#000000"}}>{item.data.name}</Text>
                </View>
                <View style={{height: 32, width: 32, margin: 20, paddingBottom: 4, paddingTop: 4, paddingLeft: 4, paddingRight: 4}}>
                  <MaterialIcons name="arrow-forward" size={24} color="#000000"></MaterialIcons>
                </View>
              </View>
              <View style={{height: 1, flexDirection: "column", backgroundColor: "#000000", opacity: 0.12}}></View>
            </View>
          </Button>;
        }
      }}/>}
      </View>
      </View>;
  }

  getFlatListData(data){
    if(!(data instanceof Array)) return;
    this.setState({flatListData: null});
    let array = [];
    array.push({key: "title", customElement: true, element: <Text style={{paddingLeft: 16, paddingTop: 16, paddingBottom: 12, fontSize: 24, fontWeight: "700", color: "#000000"}}>Scanned QR's</Text>});
    data.forEach((qrcodeId)=>{
      firebase.firestore().collection('qrcodes').doc(qrcodeId).get().then((value)=>{
        array.push({key: qrcodeId, customElement: false, id: qrcodeId, data: value.data()});
        this.setState({flatListData: array});
        //this.rerender();
      });
      this.setState({flatListData: array});
    });
    this.setState({flatListData: array});
  }

}