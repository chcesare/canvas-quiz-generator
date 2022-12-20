import { downloadZip } from 'client-zip';
import { nanoid } from 'nanoid';
import { parseQuestionsAndAnswers } from './parser.js';
import { buildAssessmentXml, createXmlMetadataString, createImsManifestString } from './xml.js';

const form = document.querySelector('form');
const textArea = document.querySelector('textarea');
const titleInput = document.querySelector('input');
const button = document.querySelector('button[type="submit"]');
let errorMessage;
const sidebar = document.querySelector('.sidebar');
const tab = document.querySelector('.tab');
tab.addEventListener('click', () => {
  sidebar.classList.toggle('expanded');
  tab.classList.toggle('expanded');
  if (tab.classList.contains('expanded')) {
    tab.textContent = '<';
  } else {
    tab.textContent = '>';
  }
});

textArea.addEventListener('input', () => {
  button.disabled = false;
});

titleInput.addEventListener('input', () => {
  button.disabled = false;
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (errorMessage) {
    errorMessage.remove();
  }
  button.disabled = true;
  try {
    const input = textArea.value;
    const title = escapeHTML(titleInput.value);
    if (!input && !title) {
      throw new Error('Please enter a quiz title and questions in the fields above.');
    } else if (input && !title) {
      throw new Error('Please enter a title for the quiz.');
    } else if (!input && title) {
      throw new Error('Please enter your quiz questions.');
    }
    const questions = parseQuestionsAndAnswers(input);
    const id = nanoid();
    const date = new Date().toISOString().slice(0, 10);
    const quiz = buildAssessmentXml(questions, title, id);
    const xmlMetaData = createXmlMetadataString(id, title, quiz.totalPoints);
    const imsManifest = createImsManifestString(id, title, date);
    createZip(title, id, quiz.questions, xmlMetaData, imsManifest);
  } catch (error) {
    errorMessage = document.createElement('div');
    errorMessage.textContent = error;
    errorMessage.style = 'color: red;';
    textArea.after(errorMessage);
    if (error.lineNumber) {
      jump(error.lineNumber);
    }
  }
});

function escapeHTML(string) {
  var pre = document.createElement('pre');
  var text = document.createTextNode(string);
  pre.appendChild(text);
  return pre.innerHTML;
}

async function createZip(title, id, assessmentXMLString, xmlMetadataString, imsManifestString) {
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
  link.download = `${title}.zip`;
  link.click();
  link.remove();

  // in real life, don't forget to revoke your Blob URLs if you use them
  URL.revokeObjectURL(url);
}

function jump(line) {
  const lineHeight = textArea.scrollHeight / textArea.rows;
  const jump = (line - 1) * lineHeight;
  textArea.scrollTop = jump;
}
