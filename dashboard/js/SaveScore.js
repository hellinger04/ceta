function SaveScore(user,score) {
  const id = new Date().getTime();
  const Score = {
    id: id,
    username:user,
    score: score,
  };
  writeData('quiz-score',Score)
}

