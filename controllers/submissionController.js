import Quiz from "../models/quizSchema.js";
import QuizSubmission from "../models/submissionSchema.js";
import User from "../models/userSchema.js";
import { getJSON, setJSON } from "./redisController.js";

export const calculateScore = (quiz, responses) => {
  let score = 0;
  const feedback = [];
  const incorrectQuestions = [];

  for (const response of responses) {
    if (!response.questionId || typeof response.userResponse === "undefined") {
      throw new Error("Invalid response format");
    }

    const question = quiz.questions.find(
      (q) => q.questionId === response.questionId
    );

    if (!question) {
      throw new Error(
        `Question with ID ${response.questionId} not found in the quiz`
      );
    }

    const isCorrect = question.correctAnswer === response.userResponse;
    if (isCorrect) {
      score++;
    } else {
      incorrectQuestions.push(question.question);
    }

    feedback.push({
      question: question.question,
      userResponse: response.userResponse,
      correctAnswer: question.correctAnswer,
      isCorrect: isCorrect,
    });
  }

  return { score, feedback, incorrectQuestions };
};

export const Submission = async (req, res) => {
  const { quizId, responses } = req.body;
  const { userId } = req.params;

  if (
    !quizId ||
    !responses ||
    !Array.isArray(responses) ||
    responses.length === 0
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid quiz submission data" });
  }

  try {
    const redisQuiz = await getJSON(quizId);
    const redisUser = redisQuiz ? await get(userId) : null;

    let quiz, user;

    if (redisQuiz && redisUser) {
      quiz = redisQuiz;
      user = redisUser;
    } else {
      quiz = await Quiz.findOne({ quizId });
      user = await User.findById(userId);

      if (!quiz) {
        return res
          .status(404)
          .json({ success: false, message: "Quiz not found" });
      }

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      await setJSON(quizId, quiz, process.env.TTL_Quiz);
    }

    const { score, feedback, incorrectQuestions } = calculateScore(
      quiz,
      responses
    );

    // Check if user has already submitted this quiz
    // const existingSubmission = await QuizSubmission.findOne({
    //   quizId,
    //   user: userId,
    // });
    // if (existingSubmission) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "You have already submitted this quiz",
    //   });
    // }

    // Save the new submission to MongoDB
    try {
      const submission = await QuizSubmission.create({
        quizId: quizId,
        user: userId,
        responses: feedback,
        score: score,
        completedAt: new Date(),
      });

      console.log("Submission successful:", submission);
    } catch (error) {
      console.error("Error creating submission:", error);
    }

    let suggestions = [];
    if (incorrectQuestions.length > 0) {
      suggestions = await generateSuggestions(quiz.subject, incorrectQuestions);
      suggestions = suggestions.slice(0, 2); // Limit to two suggestions
    }

    // Prepare email content
    const emailSubject = `Your ${quiz.subject} Quiz Results`;
    const emailMessage = `
      Hi ${user.username},

      You have completed the ${quiz.subject} quiz. Here are your results:

      Score: ${score}/${quiz.totalQuestions}

      ${
        suggestions.length > 0
          ? `Here are two suggestions to help you improve:
      1. ${suggestions[0] || "Keep practicing!"}
      ${suggestions[1] ? `2. ${suggestions[1]}` : ""}`
          : "Great job! Keep up the good work!"
      }

      Best regards,
      The Quiz Team
    `;

    // Send email
    try {
      await mailSender(user.email, emailSubject, emailMessage);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      submission: submission,
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return res.status(500).json({
      error: error.message,
      success: false,
      message: "Failed to submit quiz",
    });
  }
};
