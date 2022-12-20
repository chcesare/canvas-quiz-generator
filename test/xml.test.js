// @vitest-environment jsdom

import { buildAssessmentXml } from '../src/xml';
import { expect, test } from 'vitest';

const questionsModel = [
  {
    id: 'Q1',
    answerIds: ['A1', 'A2', 'A3', 'A4'],
    correctAnswerIds: ['A2'],
    text: '<p>Which of the "following" is not a threat to information assets to be considered under identifying potential vulnerabilities and threats?</p>',
    answers: [
      { text: 'Noncompliance fines and sanctions', correct: false, id: 'A1' },
      { text: 'Ransomware', correct: true, id: 'A2' },
      { text: 'Data breaches', correct: false, id: 'A3' },
      { text: 'None of the above', correct: false, id: 'A4' },
    ],
    points: 1,
    type: 'multiple_choice_question',
  },
  {
    id: 'Q2',
    answerIds: ['A5', 'A6', 'A7', 'A8'],
    correctAnswerIds: ['A5'],
    text: '<p>Which of the following is an answer?</p>',
    answers: [
      { text: 'Test', correct: true, id: 'A5' },
      { text: 'tsdfsd', correct: false, id: 'A6' },
      { text: 'sdasd', correct: false, id: 'A7' },
      { text: 'Nrtuazc', correct: false, id: 'A8' },
    ],
    points: 2,
    type: 'multiple_choice_question',
  },
  {
    id: 'Q3',
    answerIds: ['A9'],
    correctAnswerIds: [],
    text: '<p>Write an essay</p>',
    answers: [{ text: 'Noncompliance', correct: false, id: 'A9' }],
    points: 12,
    type: 'essay_question',
  },
  {
    id: 'Q4',
    answerIds: ['A10', 'A11', 'A12', 'A13'],
    correctAnswerIds: ['A11'],
    text: '<p>Multiple Answers?</p>',
    answers: [
      { text: 'Blue', correct: false, id: 'A10' },
      { text: 'Red', correct: true, id: 'A11' },
      { text: 'Yellow', correct: false, id: 'A12' },
      { text: 'orange', correct: true, id: 'A13' },
    ],
    points: 1,
    type: 'multiple_answers_question',
  },
  {
    id: 'Q5',
    answerIds: ['A14', 'A15', 'A16', 'A17'],
    correctAnswerIds: ['A15'],
    text: '<p>Multiple</p><p>Lines</p><p>of text in question</p>',
    answers: [
      { text: 'X', correct: false, id: 'A14' },
      { text: 'Y', correct: true, id: 'A15' },
      { text: 'Z', correct: false, id: 'A16' },
      { text: 'A', correct: false, id: 'A17' },
    ],
    points: 1,
    type: 'multiple_choice_question',
  },
  {
    id: 'Q6',
    answerIds: ['A18', 'A19'],
    correctAnswerIds: ['A19'],
    text: '<p>True or false: is x or y?</p>',
    answers: [
      { text: 'True', correct: false, id: 'A18' },
      { text: 'False', correct: true, id: 'A19' },
    ],
    points: 5,
    type: 'multiple_choice_question',
  },
];

const xmlModel = `<?xml version="1.0" encoding="UTF-8"?>
<questestinterop xmlns="http://www.imsglobal.org/xsd/ims_qtiasiv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/ims_qtiasiv1p2 http://www.imsglobal.org/xsd/ims_qtiasiv1p2p1.xsd">
  <assessment ident="QUIZ1" title="Test">
    <qtimetadata>
      <qtimetadatafield>
        <fieldlabel>cc_maxattempts</fieldlabel>
        <fieldentry>1</fieldentry>
      </qtimetadatafield>
    </qtimetadata>
    <section ident="root_section">
      <item ident="Q1" title="Question">
        <itemmetadata>
          <qtimetadata>
            <qtimetadatafield>
              <fieldlabel>question_type</fieldlabel>
              <fieldentry>multiple_choice_question</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>points_possible</fieldlabel>
              <fieldentry>1</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>original_answer_ids</fieldlabel>
              <fieldentry>A1,A2,A3,A4</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>assessment_question_identifierref</fieldlabel>
              <fieldentry>ref_Q1</fieldentry>
            </qtimetadatafield>
          </qtimetadata>
        </itemmetadata>
        <presentation>
          <material>
            <mattext texttype="text/html">&lt;p&gt;Which of the "following" is not a threat to information assets to be considered under identifying potential vulnerabilities and threats?&lt;/p&gt;</mattext>
          </material>
          <response_lid ident="response1" rcardinality="Single">
            <render_choice>
              <response_label ident="A1">
                <material>
                  <mattext texttype="text/plain">Noncompliance fines and sanctions</mattext>
                </material>
              </response_label>
              <response_label ident="A2">
                <material>
                  <mattext texttype="text/plain">Ransomware</mattext>
                </material>
              </response_label>
              <response_label ident="A3">
                <material>
                  <mattext texttype="text/plain">Data breaches</mattext>
                </material>
              </response_label>
              <response_label ident="A4">
                <material>
                  <mattext texttype="text/plain">None of the above</mattext>
                </material>
              </response_label>
            </render_choice>
          </response_lid>
        </presentation>
        <resprocessing>
          <outcomes>
            <decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/>
          </outcomes>
          <respcondition continue="No">
            <conditionvar>
              <varequal respident="response1">A2</varequal>
            </conditionvar>
            <setvar action="Set" varname="SCORE">100</setvar>
          </respcondition>
        </resprocessing>
      </item>
      <item ident="Q2" title="Question">
        <itemmetadata>
          <qtimetadata>
            <qtimetadatafield>
              <fieldlabel>question_type</fieldlabel>
              <fieldentry>multiple_choice_question</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>points_possible</fieldlabel>
              <fieldentry>2</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>original_answer_ids</fieldlabel>
              <fieldentry>A5,A6,A7,A8</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>assessment_question_identifierref</fieldlabel>
              <fieldentry>ref_Q2</fieldentry>
            </qtimetadatafield>
          </qtimetadata>
        </itemmetadata>
        <presentation>
          <material>
            <mattext texttype="text/html">&lt;p&gt;Which of the following is an answer?&lt;/p&gt;</mattext>
          </material>
          <response_lid ident="response1" rcardinality="Single">
            <render_choice>
              <response_label ident="A5">
                <material>
                  <mattext texttype="text/plain">Test</mattext>
                </material>
              </response_label>
              <response_label ident="A6">
                <material>
                  <mattext texttype="text/plain">tsdfsd</mattext>
                </material>
              </response_label>
              <response_label ident="A7">
                <material>
                  <mattext texttype="text/plain">sdasd</mattext>
                </material>
              </response_label>
              <response_label ident="A8">
                <material>
                  <mattext texttype="text/plain">Nrtuazc</mattext>
                </material>
              </response_label>
            </render_choice>
          </response_lid>
        </presentation>
        <resprocessing>
          <outcomes>
            <decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/>
          </outcomes>
          <respcondition continue="No">
            <conditionvar>
              <varequal respident="response1">A5</varequal>
            </conditionvar>
            <setvar action="Set" varname="SCORE">100</setvar>
          </respcondition>
        </resprocessing>
      </item>
      <item ident="Q3" title="Question">
        <itemmetadata>
          <qtimetadata>
            <qtimetadatafield>
              <fieldlabel>question_type</fieldlabel>
              <fieldentry>essay_question</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>points_possible</fieldlabel>
              <fieldentry>12</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>original_answer_ids</fieldlabel>
              <fieldentry></fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>assessment_question_identifierref</fieldlabel>
              <fieldentry>ref_Q3</fieldentry>
            </qtimetadatafield>
          </qtimetadata>
        </itemmetadata>
        <presentation>
          <material>
            <mattext texttype="text/html">&lt;p&gt;Write an essay&lt;/p&gt;</mattext>
          </material>
          <response_str ident="response1" rcardinality="Single">
            <render_fib>
              <response_label ident="answer1" rshuffle="No"/>
            </render_fib>
          </response_str>
        </presentation>
        <resprocessing>
          <outcomes>
            <decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/>
          </outcomes>
          <respcondition continue="No">
            <conditionvar>
              <other/>
            </conditionvar>
          </respcondition>
        </resprocessing>
      </item>
      <item ident="Q4" title="Question">
        <itemmetadata>
          <qtimetadata>
            <qtimetadatafield>
              <fieldlabel>question_type</fieldlabel>
              <fieldentry>multiple_answers_question</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>points_possible</fieldlabel>
              <fieldentry>1</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>original_answer_ids</fieldlabel>
              <fieldentry>A10,A11,A12,A13</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>assessment_question_identifierref</fieldlabel>
              <fieldentry>ref_Q4</fieldentry>
            </qtimetadatafield>
          </qtimetadata>
        </itemmetadata>
        <presentation>
          <material>
            <mattext texttype="text/html">&lt;p&gt;Multiple Answers?&lt;/p&gt;</mattext>
          </material>
          <response_lid ident="response1" rcardinality="Multiple">
            <render_choice>
              <response_label ident="A10">
                <material>
                  <mattext texttype="text/plain">Blue</mattext>
                </material>
              </response_label>
              <response_label ident="A11">
                <material>
                  <mattext texttype="text/plain">Red</mattext>
                </material>
              </response_label>
              <response_label ident="A12">
                <material>
                  <mattext texttype="text/plain">Yellow</mattext>
                </material>
              </response_label>
              <response_label ident="A13">
                <material>
                  <mattext texttype="text/plain">orange</mattext>
                </material>
              </response_label>
            </render_choice>
          </response_lid>
        </presentation>
        <resprocessing>
          <outcomes>
            <decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/>
          </outcomes>
          <respcondition continue="No">
            <conditionvar>
              <and>
                <not>
                  <varequal respident="response1">A10</varequal>
                </not>
                <varequal respident="response1">A11</varequal>
                <not>
                  <varequal respident="response1">A12</varequal>
                </not>
                <varequal respident="response1">A13</varequal>
              </and>
            </conditionvar>
            <setvar action="Set" varname="SCORE">100</setvar>
          </respcondition>
        </resprocessing>
      </item>
      <item ident="Q5" title="Question">
        <itemmetadata>
          <qtimetadata>
            <qtimetadatafield>
              <fieldlabel>question_type</fieldlabel>
              <fieldentry>multiple_choice_question</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>points_possible</fieldlabel>
              <fieldentry>1</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>original_answer_ids</fieldlabel>
              <fieldentry>A14,A15,A16,A17</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>assessment_question_identifierref</fieldlabel>
              <fieldentry>ref_Q5</fieldentry>
            </qtimetadatafield>
          </qtimetadata>
        </itemmetadata>
        <presentation>
          <material>
            <mattext texttype="text/html">&lt;p&gt;Multiple&lt;/p&gt;&lt;p&gt;Lines&lt;/p&gt;&lt;p&gt;of text in question&lt;/p&gt;</mattext>
          </material>
          <response_lid ident="response1" rcardinality="Single">
            <render_choice>
              <response_label ident="A14">
                <material>
                  <mattext texttype="text/plain">X</mattext>
                </material>
              </response_label>
              <response_label ident="A15">
                <material>
                  <mattext texttype="text/plain">Y</mattext>
                </material>
              </response_label>
              <response_label ident="A16">
                <material>
                  <mattext texttype="text/plain">Z</mattext>
                </material>
              </response_label>
              <response_label ident="A17">
                <material>
                  <mattext texttype="text/plain">A</mattext>
                </material>
              </response_label>
            </render_choice>
          </response_lid>
        </presentation>
        <resprocessing>
          <outcomes>
            <decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/>
          </outcomes>
          <respcondition continue="No">
            <conditionvar>
              <varequal respident="response1">A15</varequal>
            </conditionvar>
            <setvar action="Set" varname="SCORE">100</setvar>
          </respcondition>
        </resprocessing>
      </item>
      <item ident="Q6" title="Question">
        <itemmetadata>
          <qtimetadata>
            <qtimetadatafield>
              <fieldlabel>question_type</fieldlabel>
              <fieldentry>true_false_question</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>points_possible</fieldlabel>
              <fieldentry>5</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>original_answer_ids</fieldlabel>
              <fieldentry>A18,A19</fieldentry>
            </qtimetadatafield>
            <qtimetadatafield>
              <fieldlabel>assessment_question_identifierref</fieldlabel>
              <fieldentry>ref_Q6</fieldentry>
            </qtimetadatafield>
          </qtimetadata>
        </itemmetadata>
        <presentation>
          <material>
            <mattext texttype="text/html">&lt;p&gt;True or false: is x or y?&lt;/p&gt;</mattext>
          </material>
          <response_lid ident="response1" rcardinality="Single">
            <render_choice>
              <response_label ident="A18">
                <material>
                  <mattext texttype="text/plain">True</mattext>
                </material>
              </response_label>
              <response_label ident="A19">
                <material>
                  <mattext texttype="text/plain">False</mattext>
                </material>
              </response_label>
            </render_choice>
          </response_lid>
        </presentation>
        <resprocessing>
          <outcomes>
            <decvar maxvalue="100" minvalue="0" varname="SCORE" vartype="Decimal"/>
          </outcomes>
          <respcondition continue="No">
            <conditionvar>
              <varequal respident="response1">A19</varequal>
            </conditionvar>
            <setvar action="Set" varname="SCORE">100</setvar>
          </respcondition>
        </resprocessing>
      </item>
    </section>
  </assessment>
</questestinterop>`;

//console.log(buildAssessmentXml(questionsModel, 'Test', 'QUIZ1').questions.split(/\r?\n/));

//console.log(xmlModel.split(/\n/));

test('xml string matches model', () => {
  const generatedXml = buildAssessmentXml(questionsModel, 'Test', 'QUIZ1').questions.split(/\r?\n/);
  const modelXml = xmlModel.split(/\n/);
  for (let i = 0; i < generatedXml.length; i++) {
    expect(generatedXml[i]).toMatch(modelXml[i]);
  }
});

// '<?xml version="1.0" encoding="UTF-8"?>',
// '<questestinterop xmlns="http://www.imsglobal.org/xsd/ims_qtiasiv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/ims_qtiasiv1p2 http://www.imsglobal.org/xsd/ims_qtiasiv1p2p1.xsd">',

//   '<?xml version="1.0" encoding="UTF-8"?>',
// '<questestinterop xmlns="http://www.imsglobal.org/xsd/ims_qtiasiv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/ims_qtiasiv1p2 http://www.imsglobal.org/xsd/ims_qtiasiv1p2p1.xsd">'

// AssertionError: expected '<?xml version="1.0" encoding="UTF-8"?>' to include '<questestinterop xmlns="http://www.im…',
