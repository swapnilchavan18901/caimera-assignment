interface Question {
  expression: string;
  answer: number;
  questionNumber: number;
}

export default class QuestionGenerator {
  private questionsGenerated: number;

  constructor() {
    this.questionsGenerated = 0;
  }

  generate(): Question {
    const operations = ['+', '-', '×', '÷'] as const;
    const op = operations[Math.floor(Math.random() * operations.length)];

    let a: number, b: number, answer: number;

    switch (op) {
      case '+':
        a = Math.floor(Math.random() * 100) + 1;
        b = Math.floor(Math.random() * 100) + 1;
        answer = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * 100) + 1;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
        break;
      case '×':
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 12) + 2;
        answer = a * b;
        break;
      case '÷':
        b = Math.floor(Math.random() * 11) + 2;
        answer = Math.floor(Math.random() * 20) + 1;
        a = b * answer;
        break;
    }

    this.questionsGenerated++;

    return {
      expression: `${a} ${op} ${b}`,
      answer,
      questionNumber: this.questionsGenerated,
    };
  }
}
