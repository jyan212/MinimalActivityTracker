import 'react-native-reanimated';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { countBoxesDay, countPerformance, getPrevDay, getPrevMonth, countBoxesThisMonth, calculateRateOfPlacingBoxesPerHour } from '../js/utility';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withRepeat } from 'react-native-reanimated'

export default function Reflect(props) {
    const dateToday = new Date()
    const today = new Date().getDate()
    const month = new Date().getMonth()
    const year = new Date().getFullYear()

    const blackCountToday = countBoxesDay(props.data, today, 0)
    const whiteCountToday = countBoxesDay(props.data, today, 1)
    const blackCountPrevDay = countBoxesDay(props.data, getPrevDay(dateToday), 0)
    const whiteCountPrevDay = countBoxesDay(props.data, getPrevDay(dateToday), 1)
    const boxColor = blackCountToday > whiteCountToday ? '#080808' : '#f9f9f9'
    const borderColor = blackCountToday > whiteCountToday ? '#f9f9f9' : '#080808'
    const whiteIncreasesDay = Math.round(countPerformance(whiteCountPrevDay, whiteCountToday)*1000)/1000
    const blackIncreasesDay = Math.round(countPerformance(blackCountPrevDay, blackCountToday)*1000)/1000

    const blackCountMonth = countBoxesThisMonth(props.data, month, 0)
    const whiteCountMonth = countBoxesThisMonth(props.data, month, 1)
    const blackCountPrevMonth = countBoxesDay(props.data, getPrevMonth(month), 0)
    const whiteCountPrevMonth = countBoxesDay(props.data, getPrevMonth(month), 1)
    const whiteIncreasesMonth = Math.round(countPerformance(whiteCountPrevMonth, whiteCountMonth)*1000)/1000
    const blackIncreasesMonth = Math.round(countPerformance(blackCountPrevMonth, blackCountMonth)*1000)/1000
    const boxColorMonth = blackCountMonth > whiteCountMonth ? '#080808' : '#f9f9f9'
    const borderColorMonth = blackCountMonth > whiteCountMonth ? '#f9f9f9' : '#080808'
    //month
    const rate = Math.round(calculateRateOfPlacingBoxesPerHour(props.data) *10000)/10000
    const fontColor = useSharedValue(props.color == '#f9f9f9' ? '#080808' : '#f9f9f9')
    const rotation = useSharedValue(0)


    useEffect(() => {
        fontColor.value = withTiming(props.color, { duration : 500 })
        rotation.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withRepeat(withTiming(20, { duration: 100 }), 10, true),
            withTiming(0, { duration: 50 })
          );
    }, [])

    const colorAnimatedStyle = useAnimatedStyle(() => {
        return {
            color: fontColor.value
        }
    })

    const boxAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{rotateZ: `${rotation.value}deg`}]
        }
    })

    return (
        <View style={[styles.reflectContainer, { backgroundColor : props.backgroundColor}]}>
            <Animated.Text style={[styles.title, colorAnimatedStyle]}>Reflect</Animated.Text>
            <Animated.Text style={[styles.today, colorAnimatedStyle]}>Today</Animated.Text>
            <View style={{ margin:5}}>
                <Animated.Text style={[styles.text, colorAnimatedStyle]}>Your most placed box today is</Animated.Text>
                <Animated.View style={[styles.box, {backgroundColor: boxColor, borderColor: borderColor}, boxAnimatedStyle]}></Animated.View>
            </View>
            <Animated.Text style={[styles.text, colorAnimatedStyle, { marginTop:5}]}>White box count today: {whiteCountToday} ({whiteIncreasesDay}% increase)</Animated.Text>
            <Animated.Text style={[styles.text, colorAnimatedStyle]}>Black box count today: {blackCountToday} ({blackIncreasesDay}% increase)</Animated.Text>
            <Animated.Text style={[styles.today, colorAnimatedStyle]}>This month</Animated.Text>
            <View style={{ margin:10}}>
                <Animated.Text style={[styles.text, colorAnimatedStyle]}>Your most placed box this month is</Animated.Text>
                <Animated.View style={[styles.box, {backgroundColor: boxColorMonth, borderColor: borderColorMonth}, boxAnimatedStyle]}></Animated.View>
            </View>
            <Animated.Text style={[styles.text, colorAnimatedStyle, {marginTop:5,}]}>You placed {whiteCountMonth} white box this month with an increase of {whiteIncreasesMonth}% since last month</Animated.Text>
            <Animated.Text style={[styles.text, colorAnimatedStyle]}>Your black box count this month is {blackCountMonth} with an increment of {blackIncreasesMonth}% since last month</Animated.Text>
            <Animated.Text style={[styles.text, colorAnimatedStyle, { marginTop:-5, display: blackCountPrevDay ? 'flex': 'none'}]}>With an improvement of {blackIncreasesMonth}% since last month</Animated.Text>

            <Animated.Text style={[styles.rate, colorAnimatedStyle, { marginTop:20}]}>Rate of placing box: {rate} hour/box</Animated.Text>
        </View>
    )
}


const styles = StyleSheet.create({
    reflectContainer : {
        flex:1,
        flexDirection:'column',
    },
    box : {
        width: 30,
        height: 30,
        alignSelf:'center',
        borderWidth:1,
        borderStyle:'solid'
    },
    title : {
        fontSize: 12,
        fontFamily: 'monospace',
        marginTop:0,
        textAlign:'center'
    },
    today : {
        fontSize: 18,
        fontWeight:'bold',
        fontFamily: 'monospace',
        marginTop:15,
        textAlign:'center'
    },
    text : {
        margin:2,
        fontSize: 12,
        fontFamily: 'monospace',
        textAlign:'center'
    },
    rate : {
        fontSize: 12,
        fontFamily: 'monospace',
        textAlign:'center'
    }
})