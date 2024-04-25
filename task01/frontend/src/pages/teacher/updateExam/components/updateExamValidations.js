export const validateInputs = (examName, totalDuration, date, questions) => {
    if (!examName.trim()) {
      return "Please enter an exam name";
    }
  
    if (!totalDuration ) {
      return "Please enter a valid duration (HH:MM)";
    }
  
    if (!date.trim() || isNaN(Date.parse(date))) {
      return "Please enter a valid date and time";
    }
  
    // if (questions.length === 0) {
    //   return "Please add at least one question";
    // }
  
    // for (const question of questions) {
    //   if (!question.questionText.trim()) {
    //     return "Please enter a question text for all questions";
    //   }
  
    //   if (question.answers.length !== 4) {
    //     return "Please provide 4 answers for each question";
    //   }
  
    //   if (question.answers.filter((a) => a.isCorrect).length !== 1) {
    //     return "Please select exactly one correct answer for each question";
    //   }
  
    //   for (const answer of question.answers) {
    //     if (!answer.text.trim()) {
    //       return "Please enter answer text for all answers";
    //     }
    //   }
    // }
  
    return null; // Validation passed
  };
  