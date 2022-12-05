import { parseQuestionsAndAnswers } from '../src/parser';
//import { buildQuestionXml } from '../src/xml';
import { expect, test } from 'vitest';

test('generated object matches Canvas export model', () => {
  const questionsObject = parseQuestionsAndAnswers(questionInput);
  for (let i = 0; i < questionsObject.length; i++) {
    expect(questionsObject[i]).toMatchObject(questionsModel[i]);
    expect(questionsObject[i]).toHaveProperty('id');
    expect(questionsObject[i]).toHaveProperty('answerIds');
    expect(questionsObject[i]).toHaveProperty('correctAnswerIds');
  }
});

const questionInput = `Points: 1
1) Which of the "following" is not a threat to information assets to be considered under identifying potential vulnerabilities and threats?
a) Noncompliance fines and sanctions
*b) Ransomware
c) Data breaches
d) None of the above

Points: 2
2) Which of the following is an answer?
*a) Test
b) tsdfsd
c) sdasd
d) Nrtuazc

Points: 12
Type: E
3) Write an essay
a) Noncompliance

4) Multiple Answers?
a) Blue
*b) Red
c) Yellow
*d) orange

5) Multiple
Lines
of text in question
a) X
*b) Y
c) Z
d) A

Points: 5
6) True or false: is x or y?
a) True
*b) False`;

const questionsModel = [
  {
    text: '<p>Which of the "following" is not a threat to information assets to be considered under identifying potential vulnerabilities and threats?</p>',
    answers: [
      { text: 'Noncompliance fines and sanctions', correct: false },
      { text: 'Ransomware', correct: true },
      { text: 'Data breaches', correct: false },
      { text: 'None of the above', correct: false },
    ],
    points: 1,
    type: 'multiple_choice_question',
  },
  {
    text: '<p>Which of the following is an answer?</p>',
    answers: [
      { text: 'Test', correct: true },
      { text: 'tsdfsd', correct: false },
      { text: 'sdasd', correct: false },
      { text: 'Nrtuazc', correct: false },
    ],
    points: 2,
    type: 'multiple_choice_question',
  },
  {
    text: '<p>Write an essay</p>',
    answers: [{ text: 'Noncompliance', correct: false }],
    points: 12,
    type: 'essay_question',
  },
  {
    text: '<p>Multiple Answers?</p>',
    answers: [
      { text: 'Blue', correct: false },
      { text: 'Red', correct: true },
      { text: 'Yellow', correct: false },
      { text: 'orange', correct: true },
    ],
    points: 1,
    type: 'multiple_answers_question',
  },
  {
    text: '<p>Multiple</p><p>Lines</p><p>of text in question</p>',
    answers: [
      { text: 'X', correct: false },
      { text: 'Y', correct: true },
      { text: 'Z', correct: false },
      { text: 'A', correct: false },
    ],
    points: 1,
    type: 'multiple_choice_question',
  },
  {
    text: '<p>True or false: is x or y?</p>',
    answers: [
      { text: 'True', correct: false },
      { text: 'False', correct: true },
    ],
    points: 5,
    type: 'multiple_choice_question',
  },
];
