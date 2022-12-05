//Respondus QTI version: 1.1.3
//Canvas supported version: 1.2 and 2.1
//SDSU tool version: 1.2

import { downloadZip } from 'client-zip';
import { nanoid } from 'nanoid';
import { parseQuestionsAndAnswers } from './parser.js';
import { buildAssessmentXml, createXmlMetadataString, createImsManifestString } from './xml.js';

const form = document.querySelector('form');
//const textArea = document.querySelector('textarea');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let input = `Points: 1
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
  console.log(parseQuestionsAndAnswers(input));
  const id = nanoid();
  const title = escapeHTML('<p>&</p>>');

  const date = new Date().toISOString().slice(0, 10);
  const quiz = buildAssessmentXml(parseQuestionsAndAnswers(input), title, id);
  const xmlMetaData = createXmlMetadataString(id, title, quiz.totalPoints);
  const imsManifest = createImsManifestString(id, title, date);
  createZip(id, quiz.questions, xmlMetaData, imsManifest);
});

function escapeHTML(string) {
  var pre = document.createElement('pre');
  var text = document.createTextNode(string);
  pre.appendChild(text);
  return pre.innerHTML;
}

async function createZip(id, assessmentXMLString, xmlMetadataString, imsManifestString) {
  // define what we want in the ZIP
  const assessmentXML = {
    name: `${id}/${id}.xml`,
    lastModified: new Date(),
    input: assessmentXMLString,
  };
  const xmlMetadata = {
    name: `${id}/assessment_meta.xml`,
    lastModified: new Date(),
    input: xmlMetadataString,
  };
  const imsManifest = {
    name: 'imsmanifest.xml',
    lastModified: new Date(),
    input: imsManifestString,
  };
  const nonCcAssessmentsFolder = { name: 'non_cc_assessment/' };
  // get the ZIP stream in a Blob
  const blob = await downloadZip([
    assessmentXML,
    xmlMetadata,
    imsManifest,
    nonCcAssessmentsFolder,
  ]).blob();

  // make and click a temporary link to download the Blob
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `${id}.zip`;
  link.click();
  link.remove();

  // in real life, don't forget to revoke your Blob URLs if you use them
  URL.revokeObjectURL(url);
}
