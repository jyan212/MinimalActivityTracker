import { StyleSheet } from 'react-native';
import BackgroundGesture from './components/BackgroundGesture';
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar } from 'expo-status-bar';

export default function App() {

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar hidden></StatusBar>
      <BackgroundGesture>
      </BackgroundGesture>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#f9f9f9',
    justifyContent:'center',
  },
});
