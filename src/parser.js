import { nanoid } from 'nanoid';

class Question {
  constructor(text, answers, points, type) {
    this.text = text;
    this.answers = answers;
    this.points = points;
    this.type = type;

    this.id = nanoid();
    this.answerIds = [];
    this.correctAnswerIds = [];
  }
}

//Answer IDs only need to be locally unique, so using function very similar to function in Canvas exporter here:
//https://github.com/instructure/canvas-lms/blob/c2cba46851df512ab26e827e4bdad76b848f6db9/gems/plugins/qti_exporter/lib/qti/assessment_item_converter.rb
let ids = {};
function uniqueLocalId() {
  let id;
  id = Math.floor(Math.random() * 100000);
  while (ids[id]) {
    id = Math.floor(Math.random() * 100000);
  }
  ids[id] = true;
  return String(id);
}

//To try: split by newline followed by points, title, or array, then split each question by line?
//Or, reduce

// Question "context"
export function parseQuestionsAndAnswers(text) {
  let questions = [];
  let question;
  let index = 0;

  function failure(error, lineNumber) {
    lineNumber = lineNumber + 1;
    error.lineNumber = lineNumber;
    return error;
  }

  text.split(/\r?\n/).forEach((line, i) => {
    let match;
    if ((match = line.match(/^ *Points? *: *(\d+.?\d*)?/i))) {
      let points = Number(match[1]);
      if (isNaN(points) || !points) {
        throw failure(Error(`Please insert a valid point value on line ${i + 1}`), i);
      }
      if (questions[index]) {
        question.points = points;
      } else {
        question = questions[index] = new Question('', [], points, 'multiple_choice_question');
      }
    } else if ((match = line.match(/^ *Type *: *(?:(E)|(MC|TF|MA))?/i))) {
      if (!match[1] && !match[2]) {
        throw failure(new Error(`Please specify a question type on line ${i + 1}`), i);

        //throw new Error(`Please specify a question type on line ${i + 1}`);
      }
      if (questions[index]) {
        if (match[1]) {
          question.type = 'essay_question';
        }
      } else {
        question = questions[index] = new Question('', [], 1, 'essay_question');
      }
    } else if ((match = line.match(/^ *\d+\)/))) {
      line = `<p>${line.slice(match[0].length).trim()}</p>`;
      if (questions[index]) {
        question.text = line;
        index++;
      } else {
        question = questions[index] = new Question(line, [], 1, 'multiple_choice_question');
        index++;
      }
    } else if ((match = line.match(/^ *(\*)?[a-z]\)/))) {
      line = line.slice(match[0].length).trim();
      let answer = { text: line, correct: false, id: uniqueLocalId() };
      let answers = question.answers;
      question.answerIds.push(answer.id);
      if (match[1] == '*') {
        answer.correct = true;
        question.correctAnswerIds.push(answer.id);
        if (question.correctAnswerIds.length > 1) {
          question.type = 'multiple_answers_question';
        }
      }
      answers.push(answer);
    }
    //extra lines of text must be in between question number line and answers
    else if (
      (match = line.match(/^( *.+)/) && question && question.text && question.answers.length == 0)
    ) {
      question.text += `<p>${line.trim()}</p>`;
    } else if ((match = line.match(/^ *.+/))) {
      throw failure(Error(`Unexpected input on line ${i + 1}`), i);
    }
  });
  return questions;
}
