'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type QuestionType = 'multiple_choice' | 'poll' | 'scale' | 'numeric_guess';

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  timeLimit: number;
  points: number;
  options?: string[];
  correctAnswer?: number | string;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
}

export default function HostPage() {
  const router = useRouter();
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    type: 'multiple_choice',
    title: '',
    timeLimit: 30,
    points: 1000,
    options: ['', '']
  });
  const [prizeMode, setPrizeMode] = useState<'none' | 'top_score' | 'random_raffle' | 'spin_wheel'>('top_score');

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...(currentQuestion.options || []), '']
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = currentQuestion.options?.filter((_, i) => i !== index) || [];
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addQuestion = () => {
    if (!currentQuestion.title) {
      alert('Please enter a question title');
      return;
    }

    const question: Question = {
      id: `q${Date.now()}`,
      type: currentQuestion.type as QuestionType,
      title: currentQuestion.title,
      timeLimit: currentQuestion.timeLimit || 30,
      points: currentQuestion.points || 1000,
      options: currentQuestion.options,
      correctAnswer: currentQuestion.correctAnswer,
      scaleMin: currentQuestion.scaleMin,
      scaleMax: currentQuestion.scaleMax,
      scaleLabels: currentQuestion.scaleLabels
    };

    setQuestions([...questions, question]);
    setCurrentQuestion({
      type: 'multiple_choice',
      title: '',
      timeLimit: 30,
      points: 1000,
      options: ['', '']
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const startQuiz = async () => {
    if (!quizTitle || questions.length === 0) {
      alert('Please add a title and at least one question');
      return;
    }

    try {
      // Create quiz
      const quizRes = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizTitle,
          questions
        })
      });

      const { quiz } = await quizRes.json();

      // Create session
      const sessionRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz.id,
          prizeMode
        })
      });

      const { session } = await sessionRes.json();

      // Navigate to session control page
      router.push(`/session/${session.id}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Create a Quiz</h1>
            <Link href="/" className="text-purple-600 hover:text-purple-800">
              ← Back to Home
            </Link>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Quiz Title</label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Enter quiz title..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Prize Mode</label>
            <select
              value={prizeMode}
              onChange={(e) => setPrizeMode(e.target.value as any)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="none">No Prizes</option>
              <option value="top_score">Top Score</option>
              <option value="random_raffle">Random Raffle</option>
              <option value="spin_wheel">Spin Wheel</option>
            </select>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Questions ({questions.length})</h2>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={q.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-semibold text-purple-600 uppercase">{q.type.replace('_', ' ')}</span>
                      <p className="font-semibold text-gray-800 mt-1">{q.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {q.timeLimit}s • {q.points} points
                      </p>
                    </div>
                    <button
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Question</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Question Type</label>
              <select
                value={currentQuestion.type}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value as QuestionType, options: e.target.value === 'multiple_choice' || e.target.value === 'poll' ? ['', ''] : undefined })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="poll">Poll</option>
                <option value="scale">Scale</option>
                <option value="numeric_guess">Numeric Guess</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Question</label>
              <input
                type="text"
                value={currentQuestion.title}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, title: e.target.value })}
                placeholder="Enter your question..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Time Limit (seconds)</label>
                <input
                  type="number"
                  value={currentQuestion.timeLimit}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, timeLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Points</label>
                <input
                  type="number"
                  value={currentQuestion.points}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'poll') && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Options</label>
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {currentQuestion.options && currentQuestion.options.length > 2 && (
                      <button
                        onClick={() => removeOption(index)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addOption}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Add Option
                </button>

                {currentQuestion.type === 'multiple_choice' && (
                  <div className="mt-4">
                    <label className="block text-gray-700 font-semibold mb-2">Correct Answer</label>
                    <select
                      value={currentQuestion.correctAnswer}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select correct answer...</option>
                      {currentQuestion.options?.map((_, index) => (
                        <option key={index} value={index}>Option {index + 1}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {currentQuestion.type === 'scale' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Min Value</label>
                  <input
                    type="number"
                    value={currentQuestion.scaleMin}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, scaleMin: parseInt(e.target.value) })}
                    placeholder="e.g., 1"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Max Value</label>
                  <input
                    type="number"
                    value={currentQuestion.scaleMax}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, scaleMax: parseInt(e.target.value) })}
                    placeholder="e.g., 10"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {currentQuestion.type === 'numeric_guess' && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Correct Answer</label>
                <input
                  type="number"
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                  placeholder="Enter the correct numeric answer..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            <button
              onClick={addQuestion}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
            >
              Add Question
            </button>
          </div>
        </div>

        {questions.length > 0 && (
          <button
            onClick={startQuiz}
            className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-lg shadow-lg"
          >
            Start Quiz with {questions.length} Question{questions.length > 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
}
