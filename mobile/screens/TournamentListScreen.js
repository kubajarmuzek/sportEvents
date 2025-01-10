import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, Button, TextInput, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TournamentsListScreen = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [teams, setTeams] = useState([]);
    const [teamName, setTeamName] = useState('');
    const [participants, setParticipants] = useState([]);
    const [viewingParticipantsForTeam, setViewingParticipantsForTeam] = useState(null);
    const [creatingTeam, setCreatingTeam] = useState(false);

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

    const fetchTeams = async (tournamentId) => {
        try {
            const response = await axios.get(`http://10.0.2.2:5000/api/tournaments/${tournamentId}/teams`);
            setTeams(response.data);
        } catch (err) {
            console.log(err);
            Alert.alert('Error', 'Failed to fetch teams');
        }
    };

    const fetchParticipants = async (teamId) => {
        try {
            const response = await axios.get(`http://10.0.2.2:5000/api/teams/${teamId}/participants`);
            setParticipants(response.data);
        } catch (err) {
            console.log(err);
            Alert.alert('Error', 'Failed to fetch participants');
        }
    };

    const handleViewDetails = (tournament) => {
        setSelectedTournament(tournament);
        fetchTeams(tournament.id);
        setDetailsModalVisible(true);
    };

    const handleSignUpForTeam = async (teamId) => {
        const userId = await AsyncStorage.getItem('id');
        try {
            const response = await axios.post('http://10.0.2.2:5000/api/tournaments/signup', {
                userId,
                tournamentId: selectedTournament.id,
                teamId,
            });
            if (response.status === 201) {
                Alert.alert('Success', 'You have signed up for the team!');
                setDetailsModalVisible(false);
            }
        } catch (error) {
            console.error('Error signing up:', error);
            Alert.alert('Error', 'Failed to sign up for the team.');
        }
    };

    const handleCreateTeam = async () => {
        if (!teamName) {
            Alert.alert('Error', 'Please enter a team name');
            return;
        }

        setCreatingTeam(true);

        const userId = await AsyncStorage.getItem('id');
        try {
            const response = await axios.post(`http://10.0.2.2:5000/api/tournaments/${selectedTournament.id}/teams`, {
                name: teamName,
                leaderId: userId,
            });

            if (response.status === 201) {
                Alert.alert('Success', 'Team created successfully!');
                setTeams((prevTeams) => [...prevTeams, response.data]);
                setTeamName('');
            }
        } catch (err) {
            console.error('Error creating team:', err);
            Alert.alert('Error', 'Failed to create the team');
        } finally {
            setCreatingTeam(false);
        }
    };

    const handleViewParticipantsToggle = (teamId) => {
        if (viewingParticipantsForTeam === teamId) {
            setViewingParticipantsForTeam(null);
        } else {
            fetchParticipants(teamId);
            setViewingParticipantsForTeam(teamId);
        }
    };

    const closeDetailsModal = () => {
        setDetailsModalVisible(false);
        setSelectedTournament(null);
        setTeams([]);
        setParticipants([]);
        setViewingParticipantsForTeam(null);
    };

    useEffect(() => {
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
                            <Text style={styles.tournamentName}>{item.name}</Text>
                            <Text>{item.sport}</Text>
                            <Text>{formattedStartDate}</Text>
                            <Text>{item.location}</Text>
                            <TouchableOpacity style={styles.button} onPress={() => handleViewDetails(item)}>
                                <Text style={styles.buttonText}>View Details</Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
            />

            {detailsModalVisible && selectedTournament && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={detailsModalVisible}
                    onRequestClose={closeDetailsModal}
                >
                    <View style={styles.modalContainer}>
                        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Tournament Details</Text>
                            <Text><Text style={styles.bold}>Name:</Text> {selectedTournament.name}</Text>
                            <Text><Text style={styles.bold}>Sport:</Text> {selectedTournament.sport}</Text>
                            <Text><Text style={styles.bold}>Date:</Text> {new Date(selectedTournament.startDate).toLocaleDateString()}</Text>
                            <Text><Text style={styles.bold}>Location:</Text> {selectedTournament.location}</Text>
                            <Text><Text style={styles.bold}>Description:</Text> {selectedTournament.description || "No description available"}</Text>
                            <Text><Text style={styles.bold}>Max Teams:</Text> {selectedTournament.maxTeams}</Text>
                            <Text><Text style={styles.bold}>Team Size:</Text> {selectedTournament.teamSize}</Text>

                            <Text style={styles.modalSubTitle}>Teams</Text>
                            {teams.length > 0 ? (
                                teams.map((team) => (
                                    <View key={team.id} style={styles.teamItem}>
                                        <Text><Text style={styles.bold}>{team.name}</Text></Text>
                                        <TouchableOpacity
                                            style={styles.button}
                                            onPress={() => handleViewParticipantsToggle(team.id)}
                                        >
                                            <Text style={styles.buttonText}>
                                                {viewingParticipantsForTeam === team.id
                                                    ? 'Hide Participants'
                                                    : 'View Participants'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.button}
                                            onPress={() => handleSignUpForTeam(team.id)}
                                        >
                                            <Text style={styles.buttonText}>Sign Up</Text>
                                        </TouchableOpacity>
                                        {viewingParticipantsForTeam === team.id && (
                                            <View>
                                                {participants.length > 0 ? (
                                                    participants.map((participant, index) => (
                                                        <Text key={participant.user.id}>
                                                            {index + 1}. {participant.user.nickname}
                                                        </Text>
                                                    ))
                                                ) : (
                                                    <Text>No participants in this team</Text>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                ))
                            ) : (
                                <Text>No teams available</Text>
                            )}

                            <Text style={styles.modalSubTitle}>Create a Team</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter team name"
                                value={teamName}
                                onChangeText={setTeamName}
                            />
                            <TouchableOpacity
                                style={[styles.button, creatingTeam && { backgroundColor: '#95a5a6' }]}
                                onPress={handleCreateTeam}
                                disabled={creatingTeam}
                            >
                                <Text style={styles.buttonText}>{creatingTeam ? 'Creating...' : 'Create Team'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.button} onPress={closeDetailsModal}>
                                <Text style={styles.buttonText}>Close</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    item: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    tournamentName: {
        fontWeight: 'bold',
        fontSize: 16,
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
        flex: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalSubTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    teamItem: {
        marginBottom: 10,
    },
    input: {
        marginTop: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
    },
    bold: {
        fontWeight: 'bold',
    },
});

export default TournamentsListScreen;
