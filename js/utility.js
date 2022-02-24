import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated'

export const getFullDataInJSON = async () => {
    try {
        const value = await AsyncStorage.getItem('@data')
        const jsonValue = JSON.parse(value)
        return jsonValue
    } catch (e) {
        console.log(e)
        return false
    }
}

export const isUpdated = (data) => {
    const a = data.data.filter(x => x.date.day == new Date().getDate()).length

    return a > 0 ? true : false
}

export const testRemove = async () => {
    try {
        const res = await AsyncStorage.removeItem('@data')
    } catch (e) {
        console.log(e)
    }
}

export const debugData = async () => {
   let json = await getFullDataInJSON()
   
   console.log(json)
}

export const storeData = async (data) => {
    try {
        let value = JSON.stringify(data)
        const res = await AsyncStorage.setItem('@data', value)
    } catch (e) {
        console.log(e)
    }
}

export const getPrevDay = (date) => {
    let date1 = new Date(date);
    date1.setDate(date1.getDate() - 1);

    return date1.getDate()
}

export const getPrevMonth = (currMonth) => {
    if (currMonth == 0) {
        return 11
    } 
    
    return currMonth - 1
}
export const countBoxesDay =  (data, day, boxType) => {
    const month = new Date().getMonth()
    const year = new Date().getFullYear()

    return data.data.filter( x => (x.item == boxType && x.date.day == day && x.date.month == month && x.date.year == year )).length
}

export const countBoxesThisMonth =  (data, month, boxType) => {
    const year = new Date().getFullYear()

    return data.data.filter( x => (x.item == boxType && x.date.month == month && x.date.year == year)).length
}

export const countBoxesThisYear =  (data, year, boxType) => { 
    return data.data.filter( x => (x.item == boxType && x.date.year == year)).length
}

export const countPerformance = (prevCount, currCount) => {
    if ( prevCount != 0 ) {
        return 100 * (currCount-prevCount)/prevCount // Increases percentage
    }
    return false
}

export const calculateRateOfPlacingBoxesPerHour = (data) => {
    let total = 0
    for ( let i = 1; i < data.data.length ; i++ ) {
       let diff = Math.abs(data.data[i].timestamp - data.data[i-1].timestamp)/1000/60/60
       total += diff;
    }

    return total/data.data.length
}
 



