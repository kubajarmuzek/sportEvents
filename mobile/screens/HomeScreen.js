import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, FlatList, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TournamentsListScreen from './TournamentListScreen';
import ParticipatingTournamentsScreen from './ParticipatingTournamentsScreen';
import OrganizerScreen from "./OrganizerScreen";
import axios from 'axios';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Available');
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

  const switchTo = (tab) => {
    const tabIndex = ['Available', 'Participating', 'Organizing'].indexOf(tab);
    const toValue = (width * 0.3) * tabIndex;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Available':
        return <TournamentsListScreen />;
      case 'Participating':
        return <ParticipatingTournamentsScreen />;
      case 'Organizing':
        return <OrganizerScreen />;
      default:
        return null;
    }
  };

  return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>Welcome, {nickname}!</Text>
          <View style={styles.toggleContainer}>
            {['Available', 'Participating', 'Organizing'].map((tab, index) => (
                <TouchableOpacity
                    key={tab}
                    style={styles.option}
                    onPress={() => switchTo(tab)}
                >
                  <Text
                      style={[
                        styles.toggleText,
                        activeTab === tab && styles.activeText,
                      ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
            ))}

            <Animated.View
                style={[
                  styles.slider,
                  { left: slideAnim, width: width * 0.3 },
                ]}
            >
              <Text style={styles.sliderButtonText}>{activeTab}</Text>
            </Animated.View>
          </View>
        </View>

        <FlatList
            contentContainerStyle={{ paddingTop: 120 }}
            ListFooterComponent={renderContent}
            keyExtractor={(item, index) => index.toString()}
            data={[]}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 1,
    paddingTop: 20,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  toggleContainer: {
    marginTop: 10,
    width: '100%',
    height: 50,
    borderRadius: 25,
    borderColor: '#ddd',
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 20,
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
