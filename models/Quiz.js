import mongoose from "mongoose";

// Question Schema
const QuestionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true
  },
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: [arrayLimit, '{PATH} must have exactly 4 options']
  },
  correctAnswer: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D']
  }
});

function arrayLimit(val) {
  return val.length === 4;
}

// Creating the Question model
const Question = mongoose.model('Question', QuestionSchema);

// Quiz Schema
const QuizSchema = new mongoose.Schema({
  quizId: {
    type: String,
    required: true,
    unique: true
  },
  grade: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  subject: {
    type: String,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  maxScore: {
    type: Number,
    required: true,
    min: 1
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['EASY', 'MEDIUM', 'HARD']
  },
  questions: [QuestionSchema]
});

// Creating the Quiz model
const Quiz = mongoose.model('Quiz', QuizSchema);

export default Quiz;
