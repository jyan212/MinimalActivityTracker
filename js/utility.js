import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated'
export const isHistoryEmpty = async (key) => {
    // return a boolean that states whether the localstorage is empty
    try {
        const value = await AsyncStorage.getItem(key)
        if (value != null) {
            return false
        }
    } catch (e) {
        console.log(e)
        return true
    }

    return true
} 

export const getCurrentTimeStampInKey = () => {
    // this function return the current date in key form used in our data structure
    let dt = new Date();
    return dt.getTime()
}

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

export const onAppStart = async () => {
    const res = await isHistoryEmpty('@data')
    if (res) {
        await storeFirstTime()
        console.log('yes')
        return true
    }
    return true
}

export const storeFirstTime = async () => {
    let data = {}
    let timeStampKey = getCurrentTimeStampInKey()

    // Storing first date
    data['firstTS'] = timeStampKey
    data['lastUpdate'] = timeStampKey // alwayts update the lastUpdate
    data['nrecords'] = 1  // always update days +1 when storing
    data['data'] = []
    data.data.push({item: -1})
    
    try {
        const jsonValue = JSON.stringify(data)
        await AsyncStorage.setItem('@data', jsonValue)
    } catch (e) {
        // saving error
        console.log(e)
    }
}

export const getKey = () => {
    return '@data'
}


