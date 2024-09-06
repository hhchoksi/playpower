import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    quizId: {
        type: String,
        ref: 'Quiz',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const QuizSubmission = mongoose.model('submission', submissionSchema);

export default QuizSubmission;
