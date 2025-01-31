import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Modal, Button, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

const OrganizerScreen = () => {
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [scoreInputs, setScoreInputs] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [tournamentType, setTournamentType] = useState('');


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
            const tournamentResponse = await axios.get(
                `http://10.0.2.2:5000/api/tournaments/${tournamentId}`
            );
            const tableResponse = await axios.get(
                `http://10.0.2.2:5000/api/tournaments/${tournamentId}/table`
            );
            setTableData(tableResponse.data);
            setTournamentType(tournamentResponse.data.tournamentSystem);
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

            switch (tournamentType) {
                case "cup":
                    endpoint = `http://10.0.2.2:5000/api/tournaments/${tournament.id}/cup/generate-first-round`;
                    break;
                case "round-robin":
                    endpoint = `http://10.0.2.2:5000/api/tournaments/${tournament.id}/round-robin/generate`;
                    break;
                case "group and cup":
                    endpoint = `http://10.0.2.2:5000/api/tournaments/${tournament.id}/group/generate-groups`;
                    break;
                case "double elimination system":
                    endpoint = `http://10.0.2.2:5000/api/tournaments/${tournament.id}/doubleEliminationSystem/startTournament`;
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

            switch (tournamentType) {
                case "cup":
                    endpoint = `http://10.0.2.2:5000/api/tournaments/${tournament.id}/cup/generate-next-round`;
                    break;
                case "round-robin":
                    // Add the appropriate endpoint for round-robin
                    break;
                case "group and cup":
                    endpoint = `http://10.0.2.2:5000/api/tournaments/${tournament.id}/group/generate-first-round`;
                    break;
                case "double elimination system":
                    endpoint = `http://10.0.2.2:5000/api/tournaments/${tournament.id}/doubleEliminationSystem/generateNextRound`;
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
    const handleGenerateSemifinals = async () => {
        try {
            const responses = await axios.get('http://10.0.2.2:5000/api/tournaments');
            const allTournaments = responses.data;
            const tournament = allTournaments.find((tournament) => tournament.id === selectedTournament.id);
            const response = await axios.post(
                `http://10.0.2.2:5000/api/tournaments/${tournament.id}/doubleEliminationSystem/generateSemifinals`
            );
            alert(response.data.message || "Semifinals generated successfully!");
            fetchMatches();
        } catch (error) {
            console.error("Error generating semifinals:", error);
            alert(error.response?.data?.message || "Failed to generate semifinals.");
        }
    };

    const handleGenerateFinalsAndThirdPlace = async () => {
        try {
            const responses = await axios.get('http://10.0.2.2:5000/api/tournaments');
            const allTournaments = responses.data;
            const tournament = allTournaments.find((tournament) => tournament.id === selectedTournament.id);
            const response = await axios.post(
                `http://10.0.2.2:5000/api/tournaments/${tournament.id}/doubleEliminationSystem/generateFinalsAndThirdPlace`
            );
            alert(
                response.data.message ||
                "Finals and 3rd place match generated successfully!"
            );
            fetchMatches();
        } catch (error) {
            console.error("Error generating finals:", error);
            alert(error.response?.data?.message || "Failed to generate finals.");
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

                        <ScrollView style={styles.matchList}>
                            {tournamentType === 'round-robin' && tableData.length > 0 && (
                                <>
                                    <Text style={styles.modalSubTitle}>Standings</Text>
                                    <View style={styles.table}>
                                        <View style={styles.tableRow}>
                                            <Text style={styles.tableHeader}>Team</Text>
                                            <Text style={styles.tableHeader}>Played</Text>
                                            <Text style={styles.tableHeader}>Won</Text>
                                            <Text style={styles.tableHeader}>Drawn</Text>
                                            <Text style={styles.tableHeader}>Lost</Text>
                                            <Text style={styles.tableHeader}>Points</Text>
                                        </View>
                                        {tableData.map((team, index) => (
                                            <View key={index} style={styles.tableRow}>
                                                <Text style={styles.tableCell}>{team.teamName}</Text>
                                                <Text style={styles.tableCell}>{team.played}</Text>
                                                <Text style={styles.tableCell}>{team.won}</Text>
                                                <Text style={styles.tableCell}>{team.drawn}</Text>
                                                <Text style={styles.tableCell}>{team.lost}</Text>
                                                <Text style={styles.tableCell}>{team.points}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </>
                            )}
                            <Text style={styles.modalSubTitle}>Match Results</Text>
                            {matches.map((item) => (
                                <View key={item.id} style={styles.matchCard}>


                                    <Text style={styles.matchTitle}>{`${item.homeTeamName} vs ${item.awayTeamName}`}</Text>
                                    <Text style={styles.roundText}>{`Round: ${item.round}`}</Text>

                                    {item.homeScore === null && item.awayScore === null ? (
                                        <View style={styles.scoreInputContainer}>
                                            <Text style={styles.scoreInputLabel}>Enter Scores:</Text>
                                            <TextInput
                                                style={styles.scoreInput}
                                                placeholder="Home"
                                                keyboardType="numeric"
                                                value={scoreInputs[item.id]?.homeScore || ''}
                                                onChangeText={(value) => handleScoreChange(item.id, 'homeScore', value)}
                                            />
                                            <TextInput
                                                style={styles.scoreInput}
                                                placeholder="Away"
                                                keyboardType="numeric"
                                                value={scoreInputs[item.id]?.awayScore || ''}
                                                onChangeText={(value) => handleScoreChange(item.id, 'awayScore', value)}
                                            />
                                            <TouchableOpacity
                                                style={styles.submitButton}
                                                onPress={() => handleAddResult(item.id, scoreInputs[item.id]?.homeScore, scoreInputs[item.id]?.awayScore)}
                                            >
                                                <Text style={styles.buttonText}>Add Result</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <Text style={styles.scoreText}>{`Score: ${item.homeScore} - ${item.awayScore}`}</Text>
                                    )}
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity style={styles.button} onPress={handleStartNextRound}>
                            <Text style={styles.buttonText}>Start Next Round</Text>
                        </TouchableOpacity>
                        {tournamentType === 'double elimination system' && (
                            <>
                                <TouchableOpacity style={styles.button} onPress={handleGenerateSemifinals}>
                                    <Text style={styles.buttonText}>Generate semifinals</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={handleGenerateFinalsAndThirdPlace}>
                                    <Text style={styles.buttonText}>Generate Finals & Third Place</Text>
                                </TouchableOpacity>

                            </>
                        )}
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
        marginTop: 20,
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
    modalContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    modalHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    matchList: {
        marginTop: 16,
    },
    matchCard: {
        padding: 16,
        backgroundColor: '#f1f1f1',
        marginBottom: 12,
        borderRadius: 8,
    },
    matchTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    roundText: {
        color: '#555',
        marginVertical: 8,
    },
    scoreInputContainer: {
        marginTop: 12,
        marginBottom: 16,
    },
    scoreInputLabel: {
        marginBottom: 8,
        fontWeight: 'bold',
    },
    scoreInput: {
        width: 100,
        padding: 8,
        marginHorizontal: 5,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#27ae60',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 16,
        fontWeight: 'bold',
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
    table: {
        marginTop: 20,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tableHeader: {
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    tableCell: {
        flex: 1,
        textAlign: 'center',
    },
    modalSubTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
});

export default OrganizerScreen;
