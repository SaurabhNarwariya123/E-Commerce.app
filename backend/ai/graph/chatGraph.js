import { StateGraph, START, END } from '@langchain/langgraph'
import { ChatState } from './state.js'
import { authorizeAdmin } from './nodes/authorizeAdmin.js'
import { normalizeInput } from './nodes/normalizeInput.js'
import { detectIntent } from './nodes/detectIntent.js'
import { routeToTool } from './nodes/routeToTool.js'
import { executeExistingController } from './nodes/executeExistingController.js'
import { validateResult } from './nodes/validateResult.js'
import { buildContext } from './nodes/buildContext.js'
import { generateAnswer } from './nodes/generateAnswer.js'
import { validateAnswer } from './nodes/validateAnswer.js'
import { addSource } from './nodes/addSource.js'
import { retrieveDocs } from './nodes/retrieveDocs.js'
import { NON_TOOL_INTENTS, RAG_INTENTS } from '../intents.js'

// After auth: denied users skip everything and get the fixed refusal from buildContext.
const afterAuthorize = (state) => (state.permissionDenied ? 'buildContext' : 'normalizeInput')

// After normalize: empty / too-long input never reaches Gemini.
const afterNormalize = (state) => (state.invalidInput ? 'buildContext' : 'detectIntent')

// After intent detection: greetings, refused actions, unknown topics and classifier failures
// are answered with fixed text and never go near the tool layer.
// Policy / product-search questions skip the database tools and go to document retrieval (RAG).
const RAG_INTENT_NAMES = Object.values(RAG_INTENTS)
const afterDetect = (state) => {
    if (state.llmError || !state.intent || NON_TOOL_INTENTS.includes(state.intent)) return 'buildContext'
    return RAG_INTENT_NAMES.includes(state.intent) ? 'retrieveDocs' : 'routeToTool'
}

// After routing: only a fully-specified, registered intent may touch the backend.
const afterRoute = (state) => (state.missingParam || state.toolError ? 'buildContext' : 'executeExistingController')

// A failed tool skips validation entirely; its error goes straight to the reply.
const afterExecute = (state) => (state.toolError ? 'buildContext' : 'validateResult')

// buildContext fills `answer` directly (fixed replies, empty results, JS formatters).
// Only when it could not (data with no formatter) do we spend a Gemini call, and that text is validated.
const afterBuildContext = (state) => (state.answer ? 'addSource' : 'generateAnswer')

const graph = new StateGraph(ChatState)
    .addNode('authorizeAdmin', authorizeAdmin)
    .addNode('normalizeInput', normalizeInput)
    .addNode('detectIntent', detectIntent)
    .addNode('retrieveDocs', retrieveDocs)
    .addNode('routeToTool', routeToTool)
    .addNode('executeExistingController', executeExistingController)
    .addNode('validateResult', validateResult)
    .addNode('buildContext', buildContext)
    .addNode('generateAnswer', generateAnswer)
    .addNode('validateAnswer', validateAnswer)
    .addNode('addSource', addSource)
    .addEdge(START, 'authorizeAdmin')
    .addConditionalEdges('authorizeAdmin', afterAuthorize, ['buildContext', 'normalizeInput'])
    .addConditionalEdges('normalizeInput', afterNormalize, ['buildContext', 'detectIntent'])
    .addConditionalEdges('detectIntent', afterDetect, ['buildContext', 'routeToTool', 'retrieveDocs'])
    .addConditionalEdges('routeToTool', afterRoute, ['buildContext', 'executeExistingController'])
    .addConditionalEdges('executeExistingController', afterExecute, ['buildContext', 'validateResult'])
    .addEdge('retrieveDocs', 'buildContext')
    .addEdge('validateResult', 'buildContext')
    .addConditionalEdges('buildContext', afterBuildContext, ['addSource', 'generateAnswer'])
    .addEdge('generateAnswer', 'validateAnswer')
    .addEdge('validateAnswer', 'addSource')
    .addEdge('addSource', END)

export const chatGraph = graph.compile()

export const routing = { afterAuthorize, afterNormalize, afterDetect, afterRoute, afterExecute, afterBuildContext }
