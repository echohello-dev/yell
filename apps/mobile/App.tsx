import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000'; // Change this to your server URL

type Screen = 'home' | 'join' | 'scan' | 'play';
type GameState = 'waiting' | 'question' | 'answered' | 'results' | 'ended';

interface Question {
  id: string;
  type: 'multiple_choice' | 'poll' | 'scale' | 'numeric_guess';
  title: string;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  timeLimit: number;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [myScore, setMyScore] = useState(0);
  const [myRank, setMyRank] = useState(0);
  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; points?: number } | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(0);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status === 'granted') {
      setScreen('scan');
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    // Extract join code from QR code URL
    const match = data.match(/code=([A-Z0-9]{6})/);
    if (match) {
      setJoinCode(match[1]);
      setScreen('join');
    } else {
      Alert.alert('Invalid QR Code', 'Please scan a valid Yell quiz QR code');
    }
  };

  const joinSession = async () => {
    if (!joinCode || !playerName) {
      Alert.alert('Error', 'Please enter both join code and your name');
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/api/sessions?joinCode=${joinCode.toUpperCase()}`);
      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', 'Session not found. Please check your code.');
        return;
      }

      const newPlayerId = `player-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      setPlayerId(newPlayerId);
      setSessionId(data.session.id);

      // Connect to socket
      const newSocket = io(SERVER_URL);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('join:session', {
          sessionId: data.session.id,
          playerId: newPlayerId,
          playerName,
          isHost: false,
        });
      });

      // Setup socket listeners
      newSocket.on('session:started', () => {
        setGameState('waiting');
      });

      newSocket.on('question:started', ({ question }) => {
        setCurrentQuestion(question);
        setGameState('question');
        setSelectedAnswer(null);
        setFeedback(null);
        setQuestionStartTime(Date.now());
      });

      newSocket.on('answer:submitted', ({ isCorrect, points }) => {
        setFeedback({ isCorrect, points });
        setGameState('answered');
        if (isCorrect) {
          setMyScore((prev) => prev + points);
        }
      });

      newSocket.on('question:ended', ({ leaderboard }) => {
        const myEntry = leaderboard.find((e: any) => e.playerId === newPlayerId);
        if (myEntry) {
          setMyRank(myEntry.rank);
          setMyScore(myEntry.score);
        }
        setGameState('results');
      });

      newSocket.on('session:ended', ({ leaderboard }) => {
        const myEntry = leaderboard.find((e: any) => e.playerId === newPlayerId);
        if (myEntry) {
          setMyRank(myEntry.rank);
          setMyScore(myEntry.score);
        }
        setGameState('ended');
      });

      setScreen('play');
    } catch (error) {
      Alert.alert('Error', 'Failed to join session. Please try again.');
      console.error(error);
    }
  };

  const submitAnswer = () => {
    if (socket && currentQuestion && selectedAnswer !== null) {
      const timeTaken = (Date.now() - questionStartTime) / 1000;
      socket.emit('answer:submit', {
        sessionId,
        playerId,
        questionId: currentQuestion.id,
        answer: selectedAnswer,
        timeTaken,
      });
      setGameState('answered');
    }
  };

  const sendReaction = () => {
    if (socket) {
      socket.emit('reaction:send', {
        sessionId,
        playerId,
        type: 'thumbs_up',
      });
    }
  };

  const renderHome = () => (
    <View style={styles.container}>
      <Text style={styles.logo}>Yell</Text>
      <Text style={styles.subtitle}>Interactive Live Quizzes</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('join')}>
        <Text style={styles.buttonText}>Join with Code</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={requestCameraPermission}>
        <Text style={styles.buttonTextSecondary}>Scan QR Code</Text>
      </TouchableOpacity>
    </View>
  );

  const renderJoin = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Quiz</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter 6-character code"
        value={joinCode}
        onChangeText={(text) => setJoinCode(text.toUpperCase())}
        maxLength={6}
        autoCapitalize="characters"
      />

      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={playerName}
        onChangeText={setPlayerName}
      />

      <TouchableOpacity style={styles.primaryButton} onPress={joinSession}>
        <Text style={styles.buttonText}>Join Quiz</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => setScreen('home')}>
        <Text style={styles.linkText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderScan = () => (
    <View style={styles.container}>
      {hasPermission === false ? (
        <Text>No access to camera</Text>
      ) : (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
      )}

      <TouchableOpacity
        style={[styles.linkButton, { position: 'absolute', top: 50 }]}
        onPress={() => setScreen('home')}
      >
        <Text style={[styles.linkText, { color: 'white' }]}>← Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPlay = () => (
    <SafeAreaView style={styles.playContainer}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{playerName}</Text>
        <Text style={styles.scoreText}>{myScore} pts</Text>
      </View>

      <ScrollView style={styles.content}>
        {gameState === 'waiting' && (
          <View style={styles.centerContent}>
            <Text style={styles.title}>Get Ready! ⏳</Text>
            <Text style={styles.subtitle}>Waiting for host to start...</Text>
          </View>
        )}

        {gameState === 'question' && currentQuestion && (
          <View style={styles.questionContainer}>
            <Text style={styles.questionTitle}>{currentQuestion.title}</Text>

            {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'poll') && (
              <View style={styles.optionsContainer}>
                {currentQuestion.options?.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedAnswer === index && styles.optionButtonSelected,
                    ]}
                    onPress={() => setSelectedAnswer(index)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedAnswer === index && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {currentQuestion.type === 'numeric_guess' && (
              <TextInput
                style={styles.numericInput}
                placeholder="Enter your answer"
                value={selectedAnswer || ''}
                onChangeText={setSelectedAnswer}
                keyboardType="numeric"
              />
            )}

            <TouchableOpacity
              style={[styles.submitButton, selectedAnswer === null && styles.disabledButton]}
              onPress={submitAnswer}
              disabled={selectedAnswer === null}
            >
              <Text style={styles.buttonText}>Submit Answer</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'answered' && (
          <View style={styles.centerContent}>
            {feedback?.isCorrect !== undefined ? (
              <>
                <Text style={styles.emoji}>{feedback.isCorrect ? '✅' : '❌'}</Text>
                <Text style={styles.feedbackTitle}>
                  {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
                </Text>
                {feedback.isCorrect && feedback.points && (
                  <Text style={styles.pointsText}>+{feedback.points} points</Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.title}>Answer Submitted!</Text>
                <Text style={styles.subtitle}>Waiting for results...</Text>
              </>
            )}

            <TouchableOpacity style={styles.reactionButton} onPress={sendReaction}>
              <Text style={styles.buttonText}>👍 Send Reaction</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameState === 'results' && (
          <View style={styles.centerContent}>
            <Text style={styles.title}>Your Position</Text>
            <Text style={styles.rankText}>#{myRank}</Text>
            <Text style={styles.scoreText}>{myScore} points</Text>
          </View>
        )}

        {gameState === 'ended' && (
          <View style={styles.centerContent}>
            <Text style={styles.title}>Quiz Ended!</Text>
            <Text style={styles.emoji}>
              {myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎉'}
            </Text>
            <Text style={styles.rankText}>#{myRank}</Text>
            <Text style={styles.scoreText}>{myScore} points</Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setScreen('home');
                setGameState('waiting');
                setMyScore(0);
                setMyRank(0);
                if (socket) socket.disconnect();
              }}
            >
              <Text style={styles.buttonText}>Play Another Quiz</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <>
      <StatusBar style="auto" />
      {screen === 'home' && renderHome()}
      {screen === 'join' && renderJoin()}
      {screen === 'scan' && renderScan()}
      {screen === 'play' && renderPlay()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  playContainer: {
    flex: 1,
    backgroundColor: '#7C3AED',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 400,
  },
  logo: {
    fontSize: 64,
    fontWeight: 'bold',
    fontFamily: 'BBH Hegarty',
    color: 'white',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'BBH Hegarty',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 15,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'transparent',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  buttonText: {
    color: '#7C3AED',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: 'white',
    fontSize: 16,
  },
  questionContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: '#7C3AED',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  optionTextSelected: {
    color: 'white',
  },
  numericInput: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 10,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#10B981',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  feedbackTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  pointsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FCD34D',
    marginBottom: 20,
  },
  reactionButton: {
    backgroundColor: '#FBBF24',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  rankText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 10,
  },
  scoreText: {
    fontSize: 24,
    color: 'white',
    fontWeight: '600',
  },
});
