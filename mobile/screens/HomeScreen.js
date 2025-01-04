import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TournamentFormScreen from './TournamentFormScreen';
import TournamentsListScreen from './TournamentListScreen';
import axios from 'axios';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [isOrganizer, setIsOrganizer] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    const fetchNickname = async () => {
      try {
        const nickname = await AsyncStorage.getItem('nickname');
        setNickname(nickname || 'User');
      } catch (error) {
        console.error('Error fetching nickname:', error);
        setNickname('User');
      }
    };

    fetchNickname();
  }, []);

  const switchTo = (organizer) => {
    const toValue = organizer ? width * 0.45 : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsOrganizer(organizer);
  };

  const renderContent = () => {
    return isOrganizer ? <TournamentFormScreen /> : <TournamentsListScreen />;
  };

  return (
      <View style={styles.container}>
        <FlatList
            ListHeaderComponent={
              <>
                <Text style={styles.heading}>Welcome, {nickname}!</Text>
                <Text style={styles.subHeading}>Choose your role</Text>

                <View style={styles.toggleContainer}>
                  <TouchableOpacity style={styles.option} onPress={() => switchTo(false)}>
                    <Text style={[styles.toggleText, !isOrganizer && styles.activeText]}>Participating</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.option} onPress={() => switchTo(true)}>
                    <Text style={[styles.toggleText, isOrganizer && styles.activeText]}>Organizing</Text>
                  </TouchableOpacity>

                  <Animated.View style={[styles.slider, { left: slideAnim }]}>
                    <Text style={styles.sliderButtonText}>{isOrganizer ? 'Organizing' : 'Participating'}</Text>
                  </Animated.View>
                </View>
              </>
            }
            data={[]}
            ListFooterComponent={renderContent}
            keyExtractor={(item, index) => index.toString()}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  quoting: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  toggleContainer: {
    margin: width * 0.05,
    width: width * 0.9,
    height: 50,
    borderRadius: 25,
    borderColor: '#ddd',
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 40,
    flexDirection: 'row',
  },
  subHeading: {
    textAlign: 'center'
  },
  option: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    color: '#888',
  },
  activeText: {
    fontWeight: 'bold',
    color: '#2980b9',
  },
  slider: {
    position: 'absolute',
    top: 0,
    height: 50,
    width: width * 0.45,
    backgroundColor: '#2980b9',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;