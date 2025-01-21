import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView, Button } from 'react-native';
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
    const [activeTab, setActiveTab] = useState('details');
    const [matches, setMatches] = useState([]);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [tournamentType, setTournamentType] = useState('');

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
            if (error.response?.status === 404) {
                setPendingApprovals([]);
            } else {
                console.error('Error fetching pending approvals:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchTournamentResults = async (tournamentId) => {
        setResultsLoading(true);
        try {
            const [matchesResponse, tableResponse, tournamentResponse] = await Promise.all([
                axios.get(`http://10.0.2.2:5000/api/tournaments/${tournamentId}/downloadingMatches`),
                axios.get(`http://10.0.2.2:5000/api/tournaments/${tournamentId}/table`),
                axios.get(`http://10.0.2.2:5000/api/tournaments/${tournamentId}`)
            ]);
            const matchData = matchesResponse.data;
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

            setTableData(tableResponse.data);
            setTournamentType(tournamentResponse.data.tournamentSystem);
        } catch (error) {
            console.error('Error fetching tournament results:', error);
            Alert.alert('Error', 'Failed to fetch tournament results');
        } finally {
            setResultsLoading(false);
        }
    };

    const handleApproval = async (participantId) => {
        const userId = await AsyncStorage.getItem('id');
        try {
            await axios.put(`http://10.0.2.2:5000/api/participants/${participantId}/approve`, { leaderId: userId });
            setPendingApprovals((prev) => prev.filter((participant) => participant.id !== participantId));
            Alert.alert('Success', 'Participant approved.');
        } catch (error) {
            console.error('Error approving participant:', error);
        }
    };

    const handleRejection = async (participantId) => {
        const userId = await AsyncStorage.getItem('id');
        try {
            await axios.put(`http://10.0.2.2:5000/api/participants/${participantId}/reject`, { leaderId: userId });
            setPendingApprovals((prev) => prev.filter((participant) => participant.id !== participantId));
            Alert.alert('Success', 'Participant rejected.');
        } catch (error) {
            console.error('Error rejecting participant:', error);
        }
    };

    const handleViewDetails = (tournament) => {
        setSelectedTournament(tournament);
        fetchTeams(tournament.id);
        fetchTournamentResults(tournament.id);
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
                            <View style={styles.tabs}>
                                <TouchableOpacity
                                    style={[
                                        styles.tab,
                                        activeTab === 'details' && styles.activeTab
                                    ]}
                                    onPress={() => setActiveTab('details')}
                                >
                                    <Text style={styles.tabText}>Details</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.tab,
                                        activeTab === 'results' && styles.activeTab
                                    ]}
                                    onPress={() => setActiveTab('results')}
                                >
                                    <Text style={styles.tabText}>Results</Text>
                                </TouchableOpacity>
                            </View>

                            {activeTab === 'details' && (
                                <>
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
                                        style={[styles.button, { marginTop: 40 }]}
                                        onPress={() => handleSignOut(selectedTournament.id)}
                                    >
                                        <Text style={styles.buttonText}>Sign Out</Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {activeTab === 'results' && (
                                <>
                                    {resultsLoading ? (
                                        <Text style={styles.loadingText}>Loading results...</Text>
                                    ) : matches.length === 0 ? (
                                        <Text style={styles.noResultsText}>No results available yet.</Text>
                                    ) : (
                                        <>
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
                                            {matches.map((match) => (
                                                <View key={match.id} style={styles.matchCard}>
                                                    <View style={styles.matchDetails}>
                                                        <Text style={styles.matchTeams}>
                                                            <Text style={styles.bold}>{`${match.homeTeamName} vs ${match.awayTeamName}`}</Text>
                                                        </Text>
                                                        <Text style={styles.matchScore}>
                                                            {match.homeScore === null || match.awayScore === null
                                                                ? 'Upcoming Match'
                                                                : `${match.homeScore} : ${match.awayScore}`}
                                                        </Text>
                                                        {match.round && (
                                                            <Text style={styles.matchRound}>Round: {match.round}</Text>
                                                        )}
                                                    </View>
                                                </View>
                                            ))}


                                        </>
                                    )}
                                </>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={closeDetailsModal}
                        >
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            )}

            {approvalsModalVisible && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={approvalsModalVisible}
                    onRequestClose={() => setApprovalsModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <ScrollView style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Pending Approvals</Text>
                            {pendingApprovals.length === 0 ? (
                                <Text>No pending approvals</Text>
                            ) : (
                                pendingApprovals.map((approval) => (
                                    <View key={approval.id} style={styles.approvalItem}>
                                        <Text>
                                            <Text style={styles.bold}>{approval.user.nickname}</Text> requests to join{' '}
                                            <Text style={styles.bold}>{approval.team.name}</Text>
                                        </Text>
                                        <View style={styles.approvalActions}>
                                            <TouchableOpacity
                                                style={styles.approveButton}
                                                onPress={() => handleApproval(approval.id)}
                                            >
                                                <Text style={styles.buttonText}>Approve</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.rejectButton}
                                                onPress={() => handleRejection(approval.id)}
                                            >
                                                <Text style={styles.buttonText}>Reject</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setApprovalsModalVisible(false)}
                        >
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
        padding: 10,
        marginTop: 20,
    },
    item: {
        padding: 20,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
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
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
        marginTop: 50,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    modalContent: {
        flex: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#007bff',
    },
    tabText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    bold: {
        fontWeight: 'bold',
    },
    teamItem: {
        marginVertical: 10,
    },
    closeButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    matchItem: {
        marginBottom: 10,
    },
    approvalsButton: {
        marginBottom: 10,
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
    },
    approvalItem: {
        marginBottom: 10,
    },
    approvalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    approveButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
    },
    rejectButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
    },
    loadingText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#888',
        marginTop: 20,
    },
    noResultsText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#888',
        marginTop: 20,
    },
    modalSubTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    matchCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    matchDetails: {
        paddingVertical: 10,
    },
    matchTeams: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    matchScore: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 5,
    },
    matchRound: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 5,
        color: '#555',
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
});

export default ParticipatingTournamentsScreen;
