import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    quizId: {
        type: String,
        ref: 'Quiz',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    responses: [{
        question: {
            type: String,
            ref: 'Question',
            required: true
        },
        userResponse: {
            type: String,
            required: true
        },
        correctAnswer: {
            type: String
        },
        isCorrect: {
            type: Boolean
        }
    }],
    score: {
        type: Number,
        required: true,
        min: 0
    },
    completedAt: {
        type: Date,
        default: Date.now,
        required: true 
    }
});

const QuizSubmission = mongoose.model('submission', submissionSchema);

export default QuizSubmission;
