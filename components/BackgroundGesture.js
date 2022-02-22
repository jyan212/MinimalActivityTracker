import 'react-native-gesture-handler'
import { StyleSheet, Text, View, FlatList } from 'react-native';
import * as Sharing from 'expo-sharing'
import { Gesture, GestureDetector} from 'react-native-gesture-handler'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withSequence, withDelay, runOnJS } from 'react-native-reanimated'
import '../js/utility'
import { getFullDataInJSON, storeData, testRemove } from '../js/utility';
import { useEffect, useState, useRef } from 'react';
import { SocialIcon, Button, Overlay, Icon} from 'react-native-elements';
import { captureRef } from "react-native-view-shot";
// import Share from "react-native-share"
import 'react-native-reanimated'

const SIZE = 50
const TITLE = ['Welcome to Good: Minimal Activity Track',  'How?', 'Generating White Dots', 'Generating Black Dots', 'Switching Mode', 'Sharing to Social Media', 'Delete', 'Contact the Developer']
const DESC = [`Here you can record and track your life progress, action using black and white boxes. \nRemember, you define what the black and white boxes mean, it can be white/black = good, or vice versa, it all depends on you.\nYou can record your action daily, anytime, anywhere, and reflect on them once you reach a 'good' amount of them.`,
            `You can generate white and black boxes anytime by simply long pressing or double tapping anywhere on the screen.\nOne example of use are, if you successfully accomplished a task, you can represent it with one colour of boxes. Conversely, you failed to do the task, you place another.\nThis allows you to reflect and track on how many 'good' and 'bad' tasks you completed.`,
            `Tap and Hold (Long Press) for 2 seconds anywhere on the screen to generate white Dots...`,
            `Double tap anywhere to generate black dots...`,
            `You can switch mode by clicking on the light icon.`,
            `Click on the social media icon to share to your records to your favourite social media.`,
            `Click on the delete button to delete all your records.`,
            `Any issues faced? Contact the developer at \nEmail: tjyn0212@gmail.com. \nInstagram: @yannnn.n.m`,
          ]

export default function BackgroundGesture() {
  const [arrData, setArrData] = useState({data:[], nrecords:0, isAnnounced:0})
  const [numOfCol, setNumCol] = useState(8)
  const [visible, setVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [count, setCount] = useState(0)
  const [mode, setMode] = useState('dark')
  const viewShot = useRef(null)
  const flatList = useRef(null)

  useEffect(async () =>{
      console.log('start')
      let fullData = await getFullDataInJSON()
      console.log(fullData)
      if (fullData.isAnnounced == 0 || fullData.isAnnounced == null || fullData.isAnnounced == undefined) {
        setVisible(!visible)
      }
      setArrData(fullData)  
      flatList.current.scrollToEnd({animated: true})
  },[])

  useEffect(async () => {
    await storeData(arrData)
  }, [arrData])

  const updateData = (value) => {
    setArrData( prev => ({
      isAnnounced: 1,
      nrecords: prev.nrecords + 1,
      data: [...prev.data, {item: value}]
    }))
    setNumCol(getNumOfCol(arrData.data.length + 1))
    flatList.current.scrollToEnd({animated: true})
  }

  const nextOverlay = () => {
    console.log(count)
    if (visible) {
      setCount(count+1)
    }

    if (count >= TITLE.length - 1) {
      setCount(0)
      setVisible(!visible)
    }
  }

  const backdropOverlayToggle = () => {
    setVisible(false)
    setCount(0)
  }

  // Animation value
  const scale = useSharedValue(0)
  const fingPos = useSharedValue({x:0 , y:0})
  const backColor = useSharedValue('#080808')
  
  // Gesture modules
  const singleTap = Gesture.Tap()
  .maxDuration(250)
  .onStart(() => {
    console.log('Single')
  });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd((e, success) => {
      if (success) {
        console.log('Double tap!')
        if (mode == 'dark') {
          backColor.value = withSequence(
            withTiming('#F9F9F9', {duration: 600}),
            withDelay(600, withTiming('#080808', {duration:500})),
          )
        }
        if (mode == 'light') {
          backColor.value = withSequence(
            withTiming('#080808', {duration: 600}),
            withDelay(600, withTiming('#F9F9F9', {duration:500})),
          )
        }
        
        runOnJS(updateData)(0)
      }
    });

  const longPress = Gesture.LongPress()
  .minDuration(1200)
  .onBegin((evt) => { 
    fingPos.value = { x: evt.absoluteX , y: evt.absoluteY }
    scale.value = withSpring(15)
  })
  .onStart(()=> {
    scale.value = withSpring(0)
    if (mode == 'dark') {
      backColor.value = withSequence(
        withTiming('#F9F9F9', {duration: 600}),
        withDelay(600, withTiming('#080808', {duration:500})),
      )
    }
    if (mode == 'light') {
      backColor.value = withSequence(
        withTiming('#080808', {duration: 600}),
        withDelay(600, withTiming('#F9F9F9', {duration:500})),
      )
    }
    runOnJS(updateData)(1)
  })
  .onFinalize((evt) => {
    scale.value = withSpring(0)
  })

  // Animated styles
  const reanimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value},],
      top: fingPos.value.y,
      left: fingPos.value.x
    }
  })

  const backgroundReanimatedStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: backColor.value
    }
  })

  // Extras Utility
  const getNumOfCol = (numOfItem) => {
    if (numOfItem <= 200) {
      return 8;
    }

    if (numOfItem <= 250) {
      return 9;
    }

    if (numOfItem <= 300) {
      return 10;
    }

    return 11;
  }

  const removeAll = async () => {
    await testRemove()
    setArrData({data:[], nrecords:0, isAnnounced:0})
    setDeleteVisible(false)
  }
  
  const toggleLight = () => {
    if (backColor.value == '#F9F9F9' || backColor.value == 'rgba(249, 249, 249, 1)' || mode == 'light') {
      backColor.value = withSpring("#080808")
      setMode('dark')
    }

    if (backColor.value == '#080808' || backColor.value == 'rgba(8, 8, 8, 1)' || mode == 'dark') {
      backColor.value = withSpring("#F9F9F9")
      setMode('light')
    }
  }

  const onShare = async () => {
    try {
      const uri = await captureRef(viewShot.current, {
        format: "png",
        quality: 1.0,
      })
      await Sharing.shareAsync(uri)

    } catch (e) {
      console.log(e)
    }
  }

  const toggleDeleteOverlay = () => {
    setDeleteVisible(!deleteVisible)
  }

  const renderItem = (data) => {
    return (
      <View style={[styles.smallBox,{borderWidth:1, borderColor: data.item.item == 0 ? '#F9F9F9' : '#080808', borderStyle:'solid', margin:0,padding: 8, backgroundColor : data.item.item == 0 ? '#080808': data.item.item == 1 ? '#f9f9f9': 'red'}]}>
      </View>
    )
  }
  return (
    <View style={{display:'flex',flex:1}}>
      <Overlay isVisible={visible} onBackdropPress={backdropOverlayToggle} overlayStyle={[styles.overlayContainer, {backgroundColor: mode == 'dark' ? '#f9f9f9' : '#080808'}]} styles={styles.overlayContainer}>
          <Text style={[styles.textPrimary, {color: mode == 'light' ? '#f9f9f9' : '#080808'}]}>{TITLE[count]}</Text>
          <Text style={[styles.textSecondary, {color: mode == 'light' ? '#f9f9f9' : '#080808'}]}>
              {DESC[count]}
          </Text>
          <Button
            icon={
              <Icon
                name="check-circle"
                type="material"
                color="#f9f9f9"
                size={25}
                iconStyle={{ marginRight: 10 }}
              />
            }
            buttonStyle={{width:100, backgroundColor:'#080808', marginTop:10}}
            title="Okay"
            onPress={nextOverlay}
          />
      </Overlay>
      <Overlay isVisible={deleteVisible} overlayStyle={[styles.overlayContainer, {backgroundColor: mode == 'dark' ? '#f9f9f9' : '#080808'}]} styles={styles.overlayContainer}>
          <Text style={[styles.textPrimary, {color: mode == 'light' ? '#f9f9f9' : '#080808'}]}>Delete</Text>
          <Text style={[styles.textSecondary, {color: mode == 'light' ? '#f9f9f9' : '#080808'}]}>
              Are you sure you want to clear all the data?
          </Text>
          <View style={{flexDirection:'row', flexWrap:'wrap'}}>
          <Button
            icon={
              <Icon
                name="cancel"
                type="material"
                color="#f9f9f9"
                size={25}
                iconStyle={{ marginRight: 10 }}
              />
            }
            buttonStyle={{width:100, backgroundColor:'#080808', margin:10}}
            title="No"
            onPress={toggleDeleteOverlay}
          />
          <Button
            icon={
              <Icon
                name="done"
                type="material"
                color="#f9f9f9"
                size={25}
                iconStyle={{ marginRight: 10 }}
              />
            }
            buttonStyle={{width:100, backgroundColor:'#080808', margin:10}}
            title="Okay"
            onPress={removeAll}
          />
          </View>
      </Overlay>
      <GestureDetector gesture={Gesture.Exclusive(doubleTap, singleTap, longPress)}>
        <Animated.View ref={viewShot} style={[styles.box, backgroundReanimatedStyles]}>
          <Animated.View style={[styles.circle, reanimatedStyles, {backgroundColor: mode == 'dark' ? '#f9f9f9' : "#080808"}]}/>
          <View styles={[styles.container]}>
              <Text style={[styles.title, {color: mode == 'dark' ? '#f9f9f9': '#080808'}]}>
                {arrData.data.filter( x => x.item == (mode == 'dark' ? 1 : 0)).length}/{arrData.nrecords}
              </Text>
              <View style={styles.list}>
                <FlatList 
                  data={arrData.data}
                  renderItem={renderItem}
                  numColumns={numOfCol}
                  key={numOfCol}
                  keyExtractor={(item, i) => i+`_${numOfCol}`}
                  showsVerticalScrollIndicator={false}
                  ref={flatList}
                  contentContainerStyle={{margin:0}}
                  >
                </FlatList>
              </View> 
          </View>
        </Animated.View>
      </GestureDetector>
      <Button
        raised={false}
        icon={{
          name: 'lightbulb',
          type: 'material',
          size: 25,
          color: mode == 'dark' ? '#080808' : '#f9f9f9',
        }}
        iconContainerStyle={{ marginRight: 5 }}
        buttonStyle={{
          backgroundColor: mode == 'dark' ? '#f9f9f9' : '#080808',
          borderColor: 'transparent',
          width:50,
          height:50,
          borderRadius: 50,
        }}
        containerStyle={{
          width: 50,
          alignSelf: 'center',
          position:'absolute',
          top:'85%',
          right:'75%'
        }}
        onPress={toggleLight}
        />
      <SocialIcon
        button
        style={{width:'15%', alignSelf:'center', position:'absolute', top:'85%', backgroundColor: mode == 'dark' ? '#f9f9f9' : '#080808'}}
        iconStyle={{color: mode == 'dark' ? '#080808' : '#f9f9f9'}}
        onPress={onShare}
        type='instagram'
      />
      <Button
        icon={{
          name: 'delete',
          type: 'material',
          size: 25,
          color: mode == 'dark' ? '#080808' : '#f9f9f9',
        }}
        iconContainerStyle={{ marginRight: 5 }}
        titleStyle={{ fontWeight: '700' }}
        buttonStyle={{
          backgroundColor: mode == 'dark' ? '#f9f9f9' : '#080808',
          borderColor: 'transparent',
          width:50,
          height:50,
          borderRadius: 50,
        }}
        containerStyle={{
          width: 50,
          alignSelf: 'center',
          position:'absolute',
          top:'85%',
          left:'75%'
        }}
        onPress={toggleDeleteOverlay}
      />
      <Button
        icon={{
          name: 'help',
          type: 'material',
          size: 15,
          color: mode == 'dark' ? '#080808' : '#f9f9f9',
        }}
        iconContainerStyle={{padding:0, margin:0}}
        buttonStyle={{
          backgroundColor: mode == 'dark' ? '#f9f9f9' : '#080808',
          borderColor: 'transparent',
          width:30,
          height:30,
          borderRadius: 30,
          padding:0,
        }}
        containerStyle={{
          width: 30,
          alignSelf: 'center',
          position:'absolute',
          top:'5%',
          right:'5%'
        }}
        onPress={() => setVisible(!visible) }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  textPrimary: {
    marginVertical: 20,
    textAlign: 'center',
    fontSize: 20,
    fontWeight:'bold',
    fontFamily:'monospace'
  },
  textSecondary: {
    marginBottom: 10,
    textAlign: 'left',
    fontSize: 15,
    fontFamily:'monospace',
  },
  overlayContainer: {
    padding:30,
    display:'flex',
    alignItems:'center',
    alignSelf:'center',
  },
  box: {
    color:'#F9F9F9',
    flex:1,
    backgroundColor:'#080808'
  },
  container: {
    padding:20,
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    alignContent:'center'
  },
  list: {
    marginTop: 44,
    justifyContent:'center',
    alignItems:'center',
    alignContent:'center',
    height:"65%",
  },
  circle: {
    height: SIZE,
    width: SIZE,
    borderRadius: SIZE/2,
  },
  smallBox: {
    backgroundColor: '#f9f9f9',
    marginVertical: 6,
    marginHorizontal: 6,
  },
  title: {
    marginTop:50,
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight:'bold',
    textAlign:'center',
    color:'#f9f9f9'
  }
});