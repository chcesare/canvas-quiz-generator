import xmlFormatter from 'xml-formatter';
import { nanoid } from 'nanoid';

// Probably a better elt: attrs is one of the children, so name can just be a string.
// Still might be a better way to do this...
// try with container as first argument?

export function buildAssessmentXml(questions, quizTitle, quizId) {
  const quiz = document.implementation.createDocument('', '', null);

  let title = quizTitle;
  let id = quizId;
  let totalPoints = 0;

  function elt(name, attrs, ...children) {
    let dom = quiz.createElement(name);
    if (attrs) {
      for (let attr of Object.keys(attrs)) {
        dom.setAttribute(attr, attrs[attr]);
      }
    }
    for (let child of children) {
      if (typeof child != 'string') dom.appendChild(child);
      else dom.appendChild(quiz.createTextNode(child));
    }
    return dom;
  }

  const pi = quiz.createProcessingInstruction('xml', 'version="1.0" encoding="UTF-8"');
  quiz.insertBefore(pi, quiz.firstChild);
  let questestinterop = quiz.createElement('questestinterop');
  questestinterop.setAttribute('xmlns', 'http://www.imsglobal.org/xsd/ims_qtiasiv1p2');
  questestinterop.setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
  questestinterop.setAttribute(
    'xsi:schemaLocation',
    'http://www.imsglobal.org/xsd/ims_qtiasiv1p2 http://www.imsglobal.org/xsd/ims_qtiasiv1p2p1.xsd'
  );

  let assessment = elt('assessment', { ident: id, title: title });
  assessment.appendChild(
    elt(
      'qtimetadata',
      {},
      elt(
        'qtimetadatafield',
        {},
        elt('fieldlabel', {}, 'cc_maxattempts'),
        elt('fieldentry', {}, '1')
      )
    )
  );
  let section = elt('section', { ident: 'root_section' });

  for (let question of questions) {
    if (question.type === 'multiple_choice_question') {
      if (question.answers.length === 2) {
        if (/true/i.test(question.answers[0].text) && /false/i.test(question.answers[1].text)) {
          question.type = 'true_false_question';
        }
      }
    }

    if (question.text == '<p></p>') {
      throw new Error(`Include question text for question ${questions.indexOf(question) + 1}`);
    }
    if (question.type != 'essay_question' && question.answers.length == 0) {
      throw new Error(
        `Include answers for question ${
          questions.indexOf(question) + 1
        }, or specify Type: E for essay question`
      );
    }
    if (question.type != 'essay_question' && question.correctAnswerIds.length == 0) {
      throw new Error(`Specify correct answer for question ${questions.indexOf(question) + 1}`);
    }

    totalPoints += question.points;

    let item = elt('item', { ident: question.id, title: 'Question' });
    //Start with empty string to make sure element doesn't self close:
    let answerIds = '';
    if (question.type != 'essay_question') {
      answerIds = question.answerIds.join(',');
    }

    let itemmetadata = elt(
      'itemmetadata',
      {},
      elt(
        'qtimetadata',
        {},
        elt(
          'qtimetadatafield',
          {},
          elt('fieldlabel', {}, 'question_type'),
          elt('fieldentry', {}, question.type)
        ),
        elt(
          'qtimetadatafield',
          {},
          elt('fieldlabel', {}, 'points_possible'),
          elt('fieldentry', {}, String(question.points))
        ),
        elt(
          'qtimetadatafield',
          {},
          elt('fieldlabel', {}, 'original_answer_ids'),
          elt('fieldentry', {}, answerIds)
        ),
        elt(
          'qtimetadatafield',
          {},
          elt('fieldlabel', {}, 'assessment_question_identifierref'),
          elt('fieldentry', {}, `ref_${question.id}`)
        )
      )
    );
    item.appendChild(itemmetadata);

    let presentation = elt(
      'presentation',
      {},
      elt('material', {}, elt('mattext', { texttype: 'html' }, question.text))
    );

    let rcardinality = 'Single';
    if (question.type == 'essay_question') {
      presentation.appendChild(
        elt(
          'response_str',
          { ident: 'response1', rcardinality: rcardinality },
          elt('render_fib', {}, elt('response_label', { ident: 'answer1', rshuffle: 'No' }))
        )
      );
    } else {
      if (question.type == 'multiple_answers_question') rcardinality = 'Multiple';
      let response_lid = elt('response_lid', {
        ident: 'response1',
        rcardinality: rcardinality,
      });
      let render_choice = quiz.createElement('render_choice');

      for (let answer of question.answers) {
        let response_label = elt(
          'response_label',
          { ident: answer.id },
          elt('material', {}, elt('mattext', { texttype: 'text/plain' }, answer.text))
        );
        render_choice.appendChild(response_label);
      }

      response_lid.appendChild(render_choice);
      presentation.appendChild(response_lid);
    }
    item.appendChild(presentation);

    let resprocessing = elt(
      'resprocessing',
      {},
      elt(
        'outcomes',
        {},
        elt('decvar', {
          maxvalue: '100',
          minvalue: '0',
          varname: 'SCORE',
          vartype: 'Decimal',
        })
      )
    );

    let respcondition = elt('respcondition', { continue: 'No' });
    let conditionvar = quiz.createElement('conditionvar');

    if (question.type == 'multiple_answers_question') {
      let and = quiz.createElement('and');
      for (let answer of question.answers) {
        let varequal = elt('varequal', { respident: 'response1' }, answer.id);
        if (answer.correct == false) {
          and.appendChild(elt('not', {}, varequal));
        } else {
          and.appendChild(varequal);
        }
        conditionvar.appendChild(and);
      }
    } else if (question.type == 'essay_question') {
      conditionvar.appendChild(quiz.createElement('other'));
    } else {
      conditionvar.appendChild(
        elt('varequal', { respident: 'response1' }, question.correctAnswerIds[0])
      );
    }

    respcondition.appendChild(conditionvar);
    if (question.type != 'essay_question')
      respcondition.appendChild(elt('setvar', { action: 'Set', varname: 'SCORE' }, '100'));
    resprocessing.appendChild(respcondition);
    item.appendChild(resprocessing);
    section.appendChild(item);
  }

  assessment.appendChild(section);
  questestinterop.appendChild(assessment);
  quiz.appendChild(questestinterop);

  const s = new XMLSerializer();
  const str = s.serializeToString(quiz);
  const formattedXML = xmlFormatter(str, {
    indentation: '  ',
    collapseContent: true,
  });

  return { questions: formattedXML, totalPoints: totalPoints };
}

export function createXmlMetadataString(id, title, points) {
  const xmlMetadataString = `<?xml version="1.0" encoding="UTF-8"?>
<quiz identifier="${id}" xmlns="http://canvas.instructure.com/xsd/cccv1p0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://canvas.instructure.com/xsd/cccv1p0 https://canvas.instructure.com/xsd/cccv1p0.xsd">
  <title>${title}</title>
  <description></description>
  <shuffle_answers>false</shuffle_answers>
  <scoring_policy>keep_highest</scoring_policy>
  <hide_results></hide_results>
  <quiz_type>assignment</quiz_type>
  <points_possible>${String(points)}</points_possible>
  <require_lockdown_browser>false</require_lockdown_browser>
  <require_lockdown_browser_for_results>false</require_lockdown_browser_for_results>
  <require_lockdown_browser_monitor>false</require_lockdown_browser_monitor>
  <lockdown_browser_monitor_data></lockdown_browser_monitor_data>
  <show_correct_answers>true</show_correct_answers>
  <anonymous_submissions>false</anonymous_submissions>
  <could_be_locked>false</could_be_locked>
  <allowed_attempts>1</allowed_attempts>
  <one_question_at_a_time>false</one_question_at_a_time>
  <cant_go_back>false</cant_go_back>
  <available>false</available>
  <one_time_results>false</one_time_results>
  <show_correct_answers_last_attempt>false</show_correct_answers_last_attempt>
  <only_visible_to_overrides>false</only_visible_to_overrides>
  <module_locked>false</module_locked>
  <assignment_overrides>
  </assignment_overrides>
</quiz>`;
  return xmlMetadataString;
}

// export function createXmlMetadataString(id, title, points) {
//   const xmlMetadataString = `<?xml version="1.0" encoding="UTF-8"?>
// <quiz identifier="${id}" xmlns="http://canvas.instructure.com/xsd/cccv1p0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://canvas.instructure.com/xsd/cccv1p0 https://canvas.instructure.com/xsd/cccv1p0.xsd">
//   <title>${title}</title>
//   <description></description>
//   <shuffle_answers>false</shuffle_answers>
//   <scoring_policy>keep_highest</scoring_policy>
//   <hide_results></hide_results>
//   <quiz_type>assignment</quiz_type>
//   <points_possible>${points}</points_possible>
//   <require_lockdown_browser>false</require_lockdown_browser>
//   <require_lockdown_browser_for_results>false</require_lockdown_browser_for_results>
//   <require_lockdown_browser_monitor>false</require_lockdown_browser_monitor>
//   <lockdown_browser_monitor_data/>
//   <show_correct_answers>true</show_correct_answers>
//   <anonymous_submissions>false</anonymous_submissions>
//   <could_be_locked>false</could_be_locked>
//   <allowed_attempts>1</allowed_attempts>
//   <one_question_at_a_time>false</one_question_at_a_time>
//   <cant_go_back>false</cant_go_back>
//   <available>false</available>
//   <one_time_results>false</one_time_results>
//   <show_correct_answers_last_attempt>false</show_correct_answers_last_attempt>
//   <only_visible_to_overrides>false</only_visible_to_overrides>
//   <module_locked>false</module_locked>
//   <assignment identifier="${id}">
//     <title>Quiz</title>
//     <due_at/>
//     <lock_at/>
//     <unlock_at/>
//     <module_locked>false</module_locked>
//     <workflow_state>unpublished</workflow_state>
//     <assignment_overrides>
//     </assignment_overrides>
//     <quiz_identifierref>${id}</quiz_identifierref>
//     <allowed_extensions></allowed_extensions>
//     <has_group_category>false</has_group_category>
//     <points_possible>${points}</points_possible>
//     <grading_type>points</grading_type>
//     <all_day>false</all_day>
//     <submission_types>online_quiz</submission_types>
//     <position>1</position>
//     <turnitin_enabled>false</turnitin_enabled>
//     <vericite_enabled>false</vericite_enabled>
//     <peer_review_count>0</peer_review_count>
//     <peer_reviews>false</peer_reviews>
//     <automatic_peer_reviews>false</automatic_peer_reviews>
//     <anonymous_peer_reviews>false</anonymous_peer_reviews>
//     <grade_group_students_individually>false</grade_group_students_individually>
//     <freeze_on_copy>false</freeze_on_copy>
//     <omit_from_final_grade>false</omit_from_final_grade>
//     <intra_group_peer_reviews>false</intra_group_peer_reviews>
//     <only_visible_to_overrides>false</only_visible_to_overrides>
//     <post_to_sis>false</post_to_sis>
//     <moderated_grading>false</moderated_grading>
//     <grader_count>0</grader_count>
//     <grader_comments_visible_to_graders>true</grader_comments_visible_to_graders>
//     <anonymous_grading>false</anonymous_grading>
//     <graders_anonymous_to_graders>false</graders_anonymous_to_graders>
//     <grader_names_visible_to_final_grader>true</grader_names_visible_to_final_grader>
//     <anonymous_instructor_annotations>false</anonymous_instructor_annotations>
//     <post_policy>
//       <post_manually>false</post_manually>
//     </post_policy>
//   </assignment>
//   <assignment_group_identifierref>${nanoid()}</assignment_group_identifierref>
//   <assignment_overrides>
//   </assignment_overrides>
// </quiz>`;
//   return xmlMetadataString;
// }

export function createImsManifestString(assessmentId, title, date) {
  const manifestId = nanoid();
  const dependencyId = nanoid();
  const imsManifestString = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${manifestId}" xmlns="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1" xmlns:lom="http://ltsc.ieee.org/xsd/imsccv1p1/LOM/resource" xmlns:imsmd="http://www.imsglobal.org/xsd/imsmd_v1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1 http://www.imsglobal.org/xsd/imscp_v1p1.xsd http://ltsc.ieee.org/xsd/imsccv1p1/LOM/resource http://www.imsglobal.org/profile/cc/ccv1p1/LOM/ccv1p1_lomresource_v1p0.xsd http://www.imsglobal.org/xsd/imsmd_v1p2 http://www.imsglobal.org/xsd/imsmd_v1p2p2.xsd">
  <metadata>
    <schema>IMS Content</schema>
    <schemaversion>1.1.3</schemaversion>
    <imsmd:lom>
      <imsmd:general>
        <imsmd:title>
          <imsmd:string>${title}</imsmd:string>
        </imsmd:title>
      </imsmd:general>
      <imsmd:lifeCycle>
        <imsmd:contribute>
          <imsmd:date>
            <imsmd:dateTime>${date}</imsmd:dateTime>
          </imsmd:date>
        </imsmd:contribute>
      </imsmd:lifeCycle>
      <imsmd:rights>
        <imsmd:copyrightAndOtherRestrictions>
          <imsmd:value>yes</imsmd:value>
        </imsmd:copyrightAndOtherRestrictions>
        <imsmd:description>
          <imsmd:string>Private (Copyrighted) - http://en.wikipedia.org/wiki/Copyright</imsmd:string>
        </imsmd:description>
      </imsmd:rights>
    </imsmd:lom>
  </metadata>
  <organizations/>
  <resources>
    <resource identifier="${assessmentId}" type="imsqti_xmlv1p2">
      <file href="${assessmentId}/${assessmentId}.xml"/>
      <dependency identifierref="${dependencyId}"/>
    </resource>
    <resource identifier="${dependencyId}" type="associatedcontent/imscc_xmlv1p1/learning-application-resource" href="${assessmentId}/assessment_meta.xml">
      <file href="${assessmentId}/assessment_meta.xml"/>
    </resource>
  </resources>
</manifest>`;
  return imsManifestString;
}
