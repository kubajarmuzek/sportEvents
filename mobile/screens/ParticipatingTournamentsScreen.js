import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ParticipatingTournamentsScreen = () => {
    const [tournaments, setTournaments] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [approvalsModalVisible, setApprovalsModalVisible] = useState(false);
    const [teams, setTeams] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [viewingParticipantsForTeam, setViewingParticipantsForTeam] = useState(null);

    const fetchParticipatingTournaments = async () => {
        const userId = await AsyncStorage.getItem('id');
        try {
            const response = await axios.get(`http://10.0.2.2:5000/api/users/${userId}/participated-tournaments`);
            setTournaments(response.data.upcoming);
        } catch (error) {
            console.error(error);
            setError('Failed to fetch participating tournaments');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingApprovals = async () => {
        const userId = await AsyncStorage.getItem('id');
        try {
            const response = await axios.get(`http://10.0.2.2:5000/api/participants/pending-approvals/${userId}`);
            setPendingApprovals(response.data);
        } catch (error) {
            if (error.response.status === 404) {
                setPendingApprovals([]);
            }else{
                console.error('Error fetching pending approvals:', error);
            }
        }finally {
            setLoading(false);
        }
    };

    const handleApproval = async (participantId) => {
        const userId = await AsyncStorage.getItem('id');
        try {
            await axios.put(`http://10.0.2.2:5000/api/participants/${participantId}/approve`, { leaderId: userId });
            setPendingApprovals((prev) =>
                prev.filter((participant) => participant.id !== participantId)
            );
            Alert.alert('Success', 'Participant approved.');
        } catch (error) {
            console.error('Error approving participant:', error);
        }
    };

    const handleRejection = async (participantId) => {
        const userId = await AsyncStorage.getItem('id');
        try {
            await axios.put(`http://10.0.2.2:5000/api/participants/${participantId}/reject`, { leaderId: userId });
            setPendingApprovals((prev) =>
                prev.filter((participant) => participant.id !== participantId)
            );
            Alert.alert('Success', 'Participant rejected.');
        } catch (error) {
            console.error('Error rejecting participant:', error);
        }
    };

    const handleViewDetails = (tournament) => {
        setSelectedTournament(tournament);
        fetchTeams(tournament.id);
        setDetailsModalVisible(true);
    };

    const handleSignOut = async (tournamentId) => {
        const userId = await AsyncStorage.getItem('id');
        try {
            await axios.delete(`http://10.0.2.2:5000/api/users/${userId}/${tournamentId}/signout`);
            Alert.alert('Success', 'You have signed out from the tournament!');
            setTournaments((prevTournaments) =>
                prevTournaments.filter((tournament) => tournament.id !== tournamentId)
            );
            setDetailsModalVisible(false);
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out from the tournament.');
        }
    };


    const closeDetailsModal = () => {
        setDetailsModalVisible(false);
        setSelectedTournament(null);
        setTeams([]);
        setParticipants([]);
        setViewingParticipantsForTeam(null);
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

    const handleViewParticipantsToggle = (teamId) => {
        if (viewingParticipantsForTeam === teamId) {
            setViewingParticipantsForTeam(null);
        } else {
            fetchParticipants(teamId);
            setViewingParticipantsForTeam(teamId);
        }
    };

    useEffect(() => {
        fetchParticipatingTournaments();
        fetchPendingApprovals();
    }, []);

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>{error}</Text>;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.approvalsButton}
                onPress={() => setApprovalsModalVisible(true)}
            >
                <Text style={styles.buttonText}>Pending Approvals</Text>
            </TouchableOpacity>

            <FlatList
                data={tournaments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const formattedStartDate = new Date(item.startDate).toISOString().split('T')[0];
                    return (
                        <View style={styles.item}>
                            <Text style={styles.tournamentName}>{item.name}</Text>
                            <Text>{formattedStartDate}</Text>
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
                        <ScrollView style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Tournament Details</Text>
                            <Text><Text style={styles.bold}>Name:</Text> {selectedTournament.name}</Text>
                            <Text><Text style={styles.bold}>Date:</Text> {new Date(selectedTournament.startDate).toLocaleDateString()}</Text>

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

                            <TouchableOpacity
                                style={[styles.button, {marginTop: 40}]}
                                onPress={() => handleSignOut(selectedTournament.id)}
                            >
                                <Text style={styles.buttonText}>Sign Out</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.button} onPress={closeDetailsModal}>
                                <Text style={styles.buttonText}>Close</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </Modal>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={approvalsModalVisible}
                onRequestClose={() => setApprovalsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Pending Approvals</Text>
                        {pendingApprovals.length === 0 ? (
                            <Text>No pending approvals.</Text>
                        ) : (
                            pendingApprovals.map((participant) => (
                                <View key={participant.id} style={styles.item}>
                                    <Text>
                                        <Text style={styles.bold}>{participant.participantName}</Text> requested to join{' '}
                                        <Text style={styles.bold}>{participant.tournamentName}</Text>
                                    </Text>
                                    <View style={styles.approvalActions}>
                                        <TouchableOpacity
                                            style={styles.button}
                                            onPress={() => handleApproval(participant.id)}
                                        >
                                            <Text style={styles.buttonText}>Approve</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.button}
                                            onPress={() => handleRejection(participant.id)}
                                        >
                                            <Text style={styles.buttonText}>Reject</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setApprovalsModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
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
    approvalsButton: {
        backgroundColor: '#2980b9',
        padding: 10,
        margin: 10,
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
        flexGrow: 1,
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
    bold: {
        fontWeight: 'bold',
    },
    approvalActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
});

export default ParticipatingTournamentsScreen;
