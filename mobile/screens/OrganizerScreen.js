import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Modal, Button, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

const OrganizerScreen = () => {
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [scoreInputs, setScoreInputs] = useState({});
    const [modalVisible, setModalVisible] = useState(false);


    const fetchTournaments = async () => {
        const userId = await AsyncStorage.getItem('id');
        try {
            const response = await axios.get(`http://10.0.2.2:5000/api/users/${userId}/organized-tournaments`);
            setTournaments(response.data.upcoming);
        } catch (error) {
            console.error('Error fetching tournaments:', error);
            Alert.alert('Error', 'Failed to fetch tournaments.');
        }
    };

    const fetchMatches = async (tournamentId) => {
        try {
            const response = await axios.get(
                `http://10.0.2.2:5000/api/tournaments/${tournamentId}/downloadingMatches`
            );
            const matchData = response.data;

            const teamIds = [
                ...new Set(matchData.flatMap((match) => [match.homeTeamID, match.awayTeamID])),
            ];

            const promises = teamIds.map((id) =>
                axios.get(`http://10.0.2.2:5000/api/teams/${id}/name`)
            );
            const responses = await Promise.all(promises);
            const teamNameMap = {};
            responses.forEach((response, index) => {
                teamNameMap[teamIds[index]] = response.data.name;
            });

            const matchesWithNames = matchData.map((match) => ({
                ...match,
                homeTeamName: teamNameMap[match.homeTeamID] || "Unknown",
                awayTeamName: teamNameMap[match.awayTeamID] || "Unknown",
            }));

            setMatches(matchesWithNames);
        } catch (error) {
            console.error("Error fetching matches or team names:", error);
            alert("Failed to fetch matches or team names.");
        }
    };

    const handleViewDetails = (tournament) => {
        setSelectedTournament(tournament);
        fetchMatches(tournament.id);
        setModalVisible(true);
    };

    const handleStartTournament = async () => {
        try {
            const responses = await axios.get('http://10.0.2.2:5000/api/tournaments');
            const allTournaments = responses.data;
            const tournament = allTournaments.find((tournament) => tournament.id === selectedTournament.id);
            let endpoint = "";

            switch (tournament.tournamentSystem) {
                case "cup":
                    endpoint = `http://10.0.2.2:5000/api/tournaments/${tournament.id}/cup/generate-first-round`;
                    break;
                case "round-robin":
                    // Add the appropriate endpoint for round-robin
                    break;
                case "group and cup":
                    // Add the appropriate endpoint for group and cup
                    break;
                case "double elimination system":
                    // Add the appropriate endpoint for double elimination
                    break;
                default:
                    alert("Please select a valid tournament system.");
                    return;
            }

            const response = await axios.post(endpoint);
            alert(response.data.message);
            fetchMatches(selectedTournament.id);
        } catch (error) {
            console.error("Error starting tournament:", error);
            alert(error.response?.data?.message || "Failed to start the tournament.");
        }
    };

    const handleScoreChange = (matchId, field, value) => {
        setScoreInputs((prev) => ({
            ...prev,
            [matchId]: {
                ...prev[matchId],
                [field]: value,
            },
        }));
    };

    const handleAddResult = async (matchId, homeScore, awayScore) => {
        try {
            const resultData = { homeScore: parseInt(homeScore, 10), awayScore: parseInt(awayScore, 10) };
            await axios.patch(`http://10.0.2.2:5000/api/match/${matchId}/addResult`, resultData);
            Alert.alert('Success', 'Match result added successfully!');
            fetchMatches(selectedTournament.id);
        } catch (error) {
            console.error('Error adding match result:', error);
            Alert.alert('Error', 'Failed to add match result.');
        }
    };

    const handleStartNextRound = async () => {
        try {
            const responses = await axios.get('http://10.0.2.2:5000/api/tournaments');
            const allTournaments = responses.data;
            const tournament = allTournaments.find((tournament) => tournament.id === selectedTournament.id);
            let endpoint = "";

            switch (tournament.tournamentSystem) {
                case "cup":
                    endpoint = `http://10.0.2.2:5000/api/tournaments/${tournament.id}/cup/generate-next-round`;
                    break;
                case "round-robin":
                    // Add the appropriate endpoint for round-robin
                    break;
                case "group and cup":
                    // Add the appropriate endpoint for group and cup
                    break;
                case "double elimination system":
                    // Add the appropriate endpoint for double elimination
                    break;
                default:
                    alert("Please select a valid tournament system.");
                    return;
            }

            const response = await axios.post(endpoint);
            Alert.alert('Success', response.data.message);
            fetchMatches(selectedTournament.id);
        } catch (error) {
            console.error('Error starting next round:', error);
            Alert.alert('Error', 'Failed to start the next round.');
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

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
                            <Text>{formattedStartDate}</Text>
                            <TouchableOpacity style={styles.button} onPress={() => handleViewDetails(item)}>
                                <Text style={styles.buttonText}>View Details</Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
            />

            {selectedTournament && (
                <Modal visible={modalVisible} animationType="slide">
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeader}>{selectedTournament.name}</Text>
                        <TouchableOpacity style={styles.button} onPress={handleStartTournament}>
                            <Text style={styles.buttonText}>Start Tournament</Text>
                        </TouchableOpacity>

                        <FlatList
                            data={matches}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.matchCard}>
                                    <Text>{`Match: ${item.homeTeamName} vs ${item.awayTeamName}`}</Text>
                                    <Text>{`Round: ${item.round}`}</Text>
                                    {item.homeScore === null && item.awayScore === null ? (
                                        <View style={styles.scoreInputContainer}>
                                            <TextInput
                                                style={styles.scoreInput}
                                                placeholder="Home Score"
                                                keyboardType="numeric"
                                                value={scoreInputs[item.id]?.homeScore || ''}
                                                onChangeText={(value) => handleScoreChange(item.id, 'homeScore', value)}
                                            />
                                            <TextInput
                                                style={styles.scoreInput}
                                                placeholder="Away Score"
                                                keyboardType="numeric"
                                                value={scoreInputs[item.id]?.awayScore || ''}
                                                onChangeText={(value) => handleScoreChange(item.id, 'awayScore', value)}
                                            />
                                            <Button
                                                title="Add Result"
                                                onPress={() =>
                                                    handleAddResult(item.id, scoreInputs[item.id]?.homeScore, scoreInputs[item.id]?.awayScore)
                                                }
                                            />
                                        </View>
                                    ) : (
                                        <Text>{`Score: ${item.homeScore} - ${item.awayScore}`}</Text>
                                    )}
                                </View>
                            )}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleStartNextRound}>
                            <Text style={styles.buttonText}>Start Next Round</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>

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
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16
    },
    button: {
        backgroundColor: '#27ae60',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    tournamentName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    modalHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16
    },
    matchCard: {
        padding: 16,
        backgroundColor: '#f1f1f1',
        marginBottom: 8,
        borderRadius: 8
    },
    scoreInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8
    },
    scoreInput: {
        flex: 1,
        marginHorizontal: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8 },
});

export default OrganizerScreen;
