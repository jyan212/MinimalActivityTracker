import 'react-native-gesture-handler'
import { StyleSheet, Text, View, FlatList, TextInput } from 'react-native';
import * as Sharing from 'expo-sharing'
import { Gesture, GestureDetector} from 'react-native-gesture-handler'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withSequence, withDelay, runOnJS } from 'react-native-reanimated'
import '../js/utility'
import { getFullDataInJSON, storeData, testRemove, isUpdated } from '../js/utility';
import { useEffect, useState, useRef } from 'react';
import { SocialIcon, Button, Overlay, Icon, Input } from 'react-native-elements';
import { captureRef } from "react-native-view-shot";
import Reflect from './Reflect';
// import Share from "react-native-share"
import 'react-native-reanimated'

const SIZE = 50
const TITLE = ['Welcome to Good: Minimal Activity Track',  'How?', 'Give your task a name', 'Generating White Dots', 'Generating Black Dots', 'Switching Mode', 'Sharing to Social Media', 'Delete', 'Reflect Mode', 'Contact the Developer']
const DESC = [`Here you can record and track your life progress, action using black and white boxes. \nRemember, you define what the black and white boxes mean, it can be white/black = good, or vice versa, it all depends on you.\nYou can record your action daily, anytime, anywhere, and reflect on them once you reach a 'good' amount of them.`,
            `You can generate white and black boxes anytime by simply long pressing or double tapping anywhere on the screen.\nOne example of use are, if you successfully accomplished a task, you can represent it with one colour of boxes. Conversely, you failed to do the task, you place another.\nThis allows you to reflect and track on how many 'good' and 'bad' tasks you completed.`,
            `1) Tap on "enter task" \n2) Start typing your task name\n3) Click done on your keyboard to save your task name! :)`,
            `Tap and Hold (Long Press) for 2 seconds anywhere on the screen to generate white Dots...`,
            `Double tap anywhere to generate black dots...`,
            `You can switch mode by clicking on the light icon.`,
            `Click on the social media icon to share to your records to your favourite social media.`,
            `Click on the delete button to delete all your records.`,
            'Reflect on your progress, check your improvement over yesterday, and previous month. This mode will only be available when you have already placed a box!',
            `Any issues faced? Contact the developer at \nEmail: tjyn0212@gmail.com. \nInstagram: @yannnn.n.m`,
          ]

export default function BackgroundGesture() {
  const [arrData, setArrData] = useState({data:[], nrecords:0, isAnnounced:0})
  const [numOfCol, setNumCol] = useState(8)
  const [visible, setVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [count, setCount] = useState(0)
  const [mode, setMode] = useState('dark')
  const [isReflectMode, setReflectMode] = useState(false)
  const [canReflect, setCanReflect] = useState(false)
  const [taskName, setTaskName] = useState('')
  
  const viewShot = useRef(null)
  const flatList = useRef(null)
  const input = useRef(null)
  

  useEffect(async () =>{
      let fullData = await getFullDataInJSON()
      if (fullData.isAnnounced == 0 || fullData.isAnnounced == null || fullData.isAnnounced == undefined) {
        setVisible(!visible)
      }
      setArrData(fullData)  
      if (flatList.current !== null) {
        flatList.current.scrollToEnd({animated: true})
      }
      console.log(arrData.taskName)
      setTaskName(fullData.taskName)

      if (isUpdated(arrData)) {
        setCanReflect(true)
      }
  },[])

  useEffect(async () => {
    console.log('save and updated')
    console.log(arrData.taskName)
    await storeData(arrData)
  }, [arrData])

  const updateData = (value) => {
    const ts = new Date().getTime()
    const day = new Date().getDate()
    const month = new Date().getMonth()
    const year = new Date().getFullYear()
    setArrData( prev => ({
      taskName: prev.taskName,
      isAnnounced: 1,
      nrecords: prev.nrecords + 1,
      data: [...prev.data, {item: value, timestamp: ts, date: {day: day, month: month, year: year}}]
    }))
    setNumCol(getNumOfCol(arrData.data.length + 1))
    setCanReflect(true)
    flatList.current.scrollToEnd({animated: true})
  }

  const nextOverlay = () => {
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

  const blurInput = () => {
    input.current.blur()
  }

  // Animation value
  const scale = useSharedValue(0)
  const fingPos = useSharedValue({x:0 , y:0})
  const backColor = useSharedValue('#080808')

  // Gesture modules
  const singleTap = Gesture.Tap()
  .maxDuration(250)
  .onStart(() => {

  });

  const doubleTap = Gesture.Tap()
    .enabled(!isReflectMode)
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd((e, success) => {
      if (success) {
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
    runOnJS(blurInput)()
    fingPos.value = { x: evt.absoluteX , y: evt.absoluteY }
    scale.value = withSpring(15)
  })
  .enabled(!isReflectMode)
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
    setArrData({data:[], taskName:'',nrecords:0, isAnnounced:0})
    setDeleteVisible(false)
    setCanReflect(false)
    setTaskName('')
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

  const toggleReflectMode = () => {
    setReflectMode(!isReflectMode)
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
      {/* ------------- overlay end ------------------------- */}
      <GestureDetector gesture={Gesture.Exclusive(doubleTap, singleTap, longPress)}>
        <Animated.View ref={viewShot} style={[styles.box, backgroundReanimatedStyles]}>
          <Input
            placeholder='enter task'
            inputStyle={{fontSize:12, fontFamily:'monospace', color:mode == 'dark' ? '#f9f9f9' : '#080808'}}
            inputContainerStyle={{borderBottomWidth:0, backgroundColor:'transparent'}}
            containerStyle={{backgroundColor:'transparent', position:'absolute', alignSelf:'center', top:'5%', width:150}}
            textAlign="center"
            textAlignVertical='top'
            clearTextOnFocus
            value={taskName}
            onChangeText={(value) => { 
              setTaskName(value) 
            }}
            onBlur={() => {
              //set to previous one, undo changes
              setTaskName(arrData.taskName)
            }}
            onSubmitEditing={() => {
              console.log('submitted')
              setArrData( prev => ({
                taskName: taskName,
                isAnnounced: 1,
                nrecords: prev.nrecords,
                data: [...prev.data]
              }))
            }}
            maxLength={16}
            returnKeyType="done"
            selectionColor={mode == 'dark' ? '#f9f9f9' : '#080808'}
            ref={input}
          />
          <Animated.View style={[styles.circle, reanimatedStyles, {backgroundColor: mode == 'dark' ? '#f9f9f9' : "#080808"}]}/>
          <View styles={[styles.container]}>
              <Text style={[styles.title, {color: mode == 'dark' ? '#f9f9f9': '#080808'}]}>
                {arrData.data.filter( x => x.item == (mode == 'dark' ? 1 : 0)).length}/{arrData.nrecords}
              </Text>
              <View style={styles.list}>
                {
                  isReflectMode ? <Reflect backgroundColor={mode == 'light' ? '#f9f9f9' : '#080808'} color={mode == 'dark' ? '#f9f9f9' : '#080808'} data={arrData}/> :
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
                }
              </View> 
          </View>
        </Animated.View>
      </GestureDetector>
      {/* ------------------ Gesture End ------------------------  */}
      {/* --------------Place button components here --------------- */}
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
        disabled={isReflectMode}
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
        disabled={isReflectMode}
        onPress={toggleDeleteOverlay}
      />
      <Button
        iconContainerStyle={{ marginRight: 5 }}
        titleStyle={{ fontFamily:'monospace', color: mode == 'dark' ? '#080808' : '#f9f9f9', }}
        title={isReflectMode ? "Back" : "Reflect"}
        buttonStyle={[{
          backgroundColor: mode == 'dark' ? '#f9f9f9' : '#080808',
          borderRadius:0,
          width:100,
          height:40,
          display: canReflect ? 'flex' : 'none'
        }]}
        containerStyle={[{
          width: 100,
          alignSelf: 'center',
          position:'absolute',
          top:'77%',
        }]}
        onPress={toggleReflectMode}
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
          top:'1%',
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
    marginTop: 25,
    justifyContent:'center',
    alignItems:'center',
    alignContent:'center',
    height:"68%",
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
    marginTop:25,
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight:'bold',
    textAlign:'center',
    color:'#f9f9f9'
  }
});