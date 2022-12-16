import { parseQuestionsAndAnswers } from '../src/parser';
import { buildAssessmentXml } from '../src/xml';
import { expect, test } from 'vitest';

test;

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
