import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TournamentsListScreen = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [selectedTournamentId, setSelectedTournamentId] = useState(null);

    const handleSignUp = async (tournamentId) => {
        const userId = await AsyncStorage.getItem('id');
      
        try {
            const response = await axios.post('http://10.0.2.2:5000/api/tournaments/signup', {
                userId,
                tournamentId,
            });
      
            if (response.status === 201) {
                Alert.alert('Success', 'You have signed up for the tournament!');
            }
        } catch (error) {
            console.error('Error signing up:', error);
            Alert.alert('Error', 'Failed to sign up for the tournament.');
        }
    };

    const fetchParticipants = async (tournamentId) => {
        try {
            const response = await axios.get(`http://10.0.2.2:5000/api/tournaments/${tournamentId}/participants`);
            setParticipants(response.data);
            setSelectedTournamentId(tournamentId);
            setModalVisible(true);
        } catch (err) {
            console.log(err);
            Alert.alert('Error', 'Failed to fetch participants');
        }
    };

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await axios.get('http://10.0.2.2:5000/api/tournaments');
                setTournaments(response.data);
            } catch (err) {
                console.log(err);
                setError('Failed to fetch tournaments');
            } finally {
                setLoading(false);
            }
        };
        fetchTournaments();
    }, []);

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>{error}</Text>;

    return (
        <View style={styles.container}>
            <FlatList
            data={tournaments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
                const formattedStartDate = new Date(item.startDate).toISOString().split('T')[0];
                return (
                    <View style={styles.item}>
                        <Text>{item.name}</Text>
                        <Text>{formattedStartDate}</Text>
                        <Text>{item.location}</Text>
                        <TouchableOpacity style={styles.button} onPress={() => handleSignUp(item.id)}>
                            <Text style={styles.buttonText}>Sign Up</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => fetchParticipants(item.id)}>
                            <Text style={styles.buttonText}>View Participants</Text>
                        </TouchableOpacity>
                    </View>
                );
            }}
        />
            
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Participants</Text>
                        <FlatList
                            data={participants}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <Text style={styles.participantItem}>{item.user.nickname}</Text>
                            )}
                        />
                        <Button title="Close" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        maxHeight: 400,
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    item: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    button: {
        marginTop: 10,
        backgroundColor: '#27ae60',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    participantItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});

export default TournamentsListScreen;
