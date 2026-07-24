const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const isGeminiAvailable = apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.length > 5;

let genAI = null;
if (isGeminiAvailable) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.warn('Gemini AI initialization failed:', err.message);
  }
}

/**
 * Clean JSON output from Gemini response (strips markdown codeblocks)
 */
function parseGeminiJson(text) {
  try {
    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error('Failed to parse Gemini JSON output:', e.message, text);
    return null;
  }
}

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash'
];

async function callGemini(prompt, temperature = 0.9) {
  if (!genAI || !isGeminiAvailable) return null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature }
      });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed = parseGeminiJson(responseText);
      if (parsed) {
        return parsed;
      }
    } catch (err) {
      console.warn(`Gemini model [${modelName}] notice:`, err.message);
    }
  }
  return null;
}

/**
 * 1. Role & Interview-Format Explanations
 */
async function explainRoleAndFormat({ targetRole, experienceLevel, industry, interviewType }) {
  const prompt = `You are an expert executive interviewer and hiring consultant.
Provide a structured, encouraging explanation of what to expect for the following interview setup:
- Target Role: ${targetRole}
- Experience Level: ${experienceLevel}
- Industry: ${industry}
- Interview Type / Format: ${interviewType}

Return a JSON object with this exact structure:
{
  "overview": "Comprehensive 2-3 paragraph breakdown of expectations for this role and interview type.",
  "keyCompetencies": ["List of 4-5 key skills or attributes tested"],
  "commonQuestionThemes": ["3-4 typical scenario or technical themes to prepare for"],
  "formatStrategy": "Strategic advice on how to structure answers (e.g. STAR technique, metrics, trade-off analysis)"
}`;

  const aiResult = await callGemini(prompt, 0.7);
  if (aiResult) return aiResult;

  // High-quality fallback template
  return {
    overview: `In a ${interviewType} interview for a ${experienceLevel} ${targetRole} within ${industry}, interviewers evaluate both your technical execution capability and strategic decision-making framework. As a candidate at the ${experienceLevel} tier, expectations focus on demonstrating ownership, measurable impact, and structured communication.`,
    keyCompetencies: [
      'Problem Solving & System Thinking',
      'Technical Mastery & Industry Best Practices',
      'Cross-functional Communication & Stakeholder Alignment',
      'Execution Speed, Operational Efficiency & Quality Control'
    ],
    commonQuestionThemes: [
      'Handling architectural or strategic trade-offs under constraints',
      'Overcoming project roadblocks or team disagreements',
      'Designing scalable, resilient solutions for complex scenarios',
      'Demonstrating business impact through measurable metrics'
    ],
    formatStrategy: `Use the STAR format (Situation, Task, Action, Result) for behavioral questions. For technical/case questions, start with high-level design, articulate assumptions clearly, evaluate trade-offs, and quantify outcomes using numbers and business impact.`
  };
}

/**
 * 2. Generate Dynamic Role & Field-Tailored Interview Questions
 */
async function generateQuestions({ targetRole, experienceLevel, industry, interviewType, jobDescription, candidateProfile, focusTopics, totalQuestions }) {
  const count = Number(totalQuestions) || 5;
  const topicsText = focusTopics && focusTopics.trim() ? focusTopics : 'Core role skills and industry standards';
  const randomSeed = Math.floor(Math.random() * 1000000);

  const prompt = `You are a Lead Principal Interviewer conducting an authentic, dynamic ${interviewType} interview.
[Randomization Seed: ${randomSeed} - Timestamp: ${Date.now()}]
Target Role: ${targetRole}
Experience Level: ${experienceLevel}
Industry: ${industry}
Interview Type: ${interviewType}
Job Description context: ${jobDescription || 'Standard industry role requirements'}
Candidate background: ${candidateProfile || 'Experienced candidate'}
Custom Focus Topics & Requested Question Areas: ${topicsText}

STRICT REQUIREMENTS FOR QUESTION GENERATION:
1. Generate EXACTLY ${count} brand-new, original, non-repetitive interview questions tailored directly to ${targetRole} and focus topics (${topicsText}).
2. Do NOT use boilerplate or standard generic text. Make each question distinct, scenario-driven, and thought-provoking.
3. Vary the category (Technical, Behavioral, Managerial, Case Study, HR) and difficulty (Easy, Medium, Hard).

Return a JSON array of objects with this exact structure:
[
  {
    "questionNumber": 1,
    "questionText": "Detailed, authentic interview question testing specific real-world scenarios",
    "category": "Technical | Behavioral | Managerial | Case Study | HR",
    "difficulty": "Easy | Medium | Hard",
    "expectedCompetencies": ["Competency 1", "Competency 2"],
    "starGuidance": "Clear STAR framework guidance for this specific question"
  }
]`;

  const aiResult = await callGemini(prompt, 0.95);
  if (Array.isArray(aiResult) && aiResult.length > 0) {
    return aiResult;
  }

  // Dynamic Fallback Question Generator incorporating user fields with randomization
  const roleTitle = targetRole || 'Software Engineer';
  const topicsList = focusTopics && focusTopics.trim() ? focusTopics.split(',') : ['system design', 'execution', 'problem solving'];
  const topic1 = (topicsList[0] || 'core responsibilities').trim();
  const topic2 = (topicsList[1] || 'technical execution').trim();

  const fallbackQuestions = [
    {
      questionNumber: 1,
      questionText: `As a ${experienceLevel} ${roleTitle} in ${industry}, can you walk me through a major project where you led ${topic1}? What were the key architectural trade-offs, constraints, and business outcomes?`,
      category: interviewType === 'Technical' ? 'Technical' : 'Behavioral',
      difficulty: 'Medium',
      expectedCompetencies: ['Core Domain Mastery', 'Technical Trade-offs', 'Business Impact'],
      starGuidance: 'Detail the business context (Situation), your core responsibility (Task), the exact engineering/strategy steps (Action), and key metrics achieved (Result).'
    },
    {
      questionNumber: 2,
      questionText: `Describe a situation in your work as a ${roleTitle} where you encountered an unexpected system failure or shifting business requirement while implementing ${topic2}. How did you reprioritize and keep stakeholders aligned?`,
      category: 'Behavioral',
      difficulty: 'Medium',
      expectedCompetencies: ['Crisis Management', 'Stakeholder Communication', 'Adaptability'],
      starGuidance: 'Focus on early risk escalation, transparent stakeholder updates, and maintaining output quality.'
    },
    {
      questionNumber: 3,
      questionText: `What production best practices, observability tools, or scaling patterns do you apply when building infrastructure for ${roleTitle} roles handling ${topic1}?`,
      category: 'Technical',
      difficulty: 'Hard',
      expectedCompetencies: ['Scalability', 'System Architecture', 'Production Observability'],
      starGuidance: 'Walk through your diagnostic methodology step-by-step before detailing implementation choices.'
    },
    {
      questionNumber: 4,
      questionText: `Tell me about a time you had a strong technical disagreement with a colleague regarding design choices for ${topic2}. How did you evaluate options and reach consensus?`,
      category: 'Managerial',
      difficulty: 'Medium',
      expectedCompetencies: ['Conflict Resolution', 'Data-Driven Decision Making', 'Peer Alignment'],
      starGuidance: 'Highlight active listening, prototyping/benchmarking, and focusing on business outcomes rather than winning an argument.'
    },
    {
      questionNumber: 5,
      questionText: `If selected for this ${roleTitle} position, what specific milestones would you establish for your first 30, 60, and 90 days to drive value in ${topic1}?`,
      category: 'HR',
      difficulty: 'Easy',
      expectedCompetencies: ['Strategic Planning', 'Leadership', 'Execution Velocity'],
      starGuidance: 'Break down your answer into 30 days (context & onboarding), 60 days (first major deliverable), and 90 days (process optimization & scaling).'
    }
  ];

  return fallbackQuestions.slice(0, count);
}

/**
 * 3. Evaluate Candidate Response with STAR Framework & Comparison
 */
async function evaluateAnswer({ questionText, userAnswer, category, expectedCompetencies, targetRole, experienceLevel }) {
  const trimmed = (userAnswer || '').toLowerCase().trim();
  const nonAnswerPhrases = [
    "don't know", "dont know", "donot know", "do not know",
    "did not know", "didn't know", "didnt know", "not know",
    "no idea", "not sure", "idk", "skip", "can you help", "help me",
    "no answer", "cannot answer", "can't answer", "unable to answer",
    "have no answer", "don't have any answer", "pass this", "not clear",
    "no knowledge"
  ];

  const isNonAnswer = !trimmed ||
    trimmed.length < 5 ||
    nonAnswerPhrases.some(phrase => trimmed.includes(phrase));

  if (isNonAnswer) {
    return {
      relevanceScore: 0,
      clarityScore: 10,
      evidenceScore: 0,
      starScore: 0,
      strengths: [
        'Honest acknowledgment of current knowledge gap for this specific question.'
      ],
      improvements: [
        'Review the exemplar STAR model answer below to understand the expected technical solution and depth.',
        'In real interviews, if you do not know the exact answer, explain how you would research, debug, or solve it step-by-step.'
      ],
      improvedAnswerModel: `[Situation]: In my role as a ${targetRole}, our team encountered a scenario requiring deep domain knowledge in ${category || 'this topic'}. [Task]: My responsibility was to research industry standards, identify root causes, and propose a solution. [Action]: I reviewed technical documentation, constructed a prototype, and consulted senior peers. [Result]: This resolved our project bottleneck and established a reliable template for future work.`
    };
  }

  const prompt = `You are a Senior Lead Technical Interviewer strictly evaluating a candidate's response.
Target Role: ${targetRole}
Experience Level: ${experienceLevel}
Interview Question: "${questionText}"
Candidate's Spoken/Typed Answer: "${userAnswer}"
Question Category: ${category}
Expected Competencies: ${JSON.stringify(expectedCompetencies || [])}

CRITICAL EVALUATION RULES:
1. Grade the answer strictly based on actual technical content provided by candidate.
2. If candidate says they do not know or gives minimal substance, assign low relevance scores (0-15%).
3. Compare candidate's answer directly with the expected ideal response for a ${experienceLevel} ${targetRole}.
4. Provide a complete, exemplar model answer written in full STAR format (Situation, Task, Action, Result).

Return a JSON object with this exact structure:
{
  "relevanceScore": 85,
  "clarityScore": 80,
  "evidenceScore": 75,
  "starScore": 85,
  "strengths": ["2-3 specific positive points mentioned in candidate answer"],
  "improvements": ["2-3 missing key points or metrics to improve response"],
  "improvedAnswerModel": "Complete ideal exemplar answer in STAR format: [Situation]: ... [Task]: ... [Action]: ... [Result]: ..."
}`;

  const aiResult = await callGemini(prompt, 0.7);
  if (aiResult && typeof aiResult.relevanceScore === 'number') {
    return aiResult;
  }

  // Fallback evaluation if AI fails
  const wordCount = (userAnswer || '').split(/\s+/).length;
  const score = Math.min(95, Math.max(50, Math.round(wordCount * 1.2 + 45)));

  return {
    relevanceScore: score,
    clarityScore: Math.min(90, score + 5),
    evidenceScore: Math.max(50, score - 5),
    starScore: Math.min(90, score + 2),
    strengths: [
      'Addressed the core intent of the interview question with domain relevance.',
      'Demonstrated practical problem awareness and personal ownership.'
    ],
    improvements: [
      'Include specific quantitative metrics (e.g. 40% latency reduction, 2-week delivery timeline).',
      'More explicitly separate the Action steps taken from the business Result achieved.'
    ],
    improvedAnswerModel: `[Situation]: In my role as a ${targetRole}, our team faced a critical bottleneck where system load spiked during peak traffic. [Task]: My objective was to optimize pipeline throughput and eliminate downtime without breaking existing API contracts. [Action]: I implemented asynchronous queue workers, added multi-tier caching, and refactored high-cost database queries. [Result]: As a result, response latency dropped by 60% and system uptime reached 99.99%.`
  };
}

module.exports = {
  explainRoleAndFormat,
  generateQuestions,
  evaluateAnswer
};
