import { Annotation } from '@langchain/langgraph'

// The graph is compiled without a checkpointer and invoked with a complete fresh input per request,
// so no field below survives between requests or between users. Do not add a checkpointer without
// keying it by authenticated admin + conversation id.
export const ChatState = Annotation.Root({
    adminId: Annotation(),
    adminEmail: Annotation(),
    message: Annotation(),
    history: Annotation(),
    requestId: Annotation(),

    isAdmin: Annotation(),
    permissionDenied: Annotation(),

    cleanedMessage: Annotation(),
    invalidInput: Annotation(),

    intent: Annotation(),
    params: Annotation(),
    unsupportedAction: Annotation(),
    llmError: Annotation(),

    missingParam: Annotation(),
    sourceLabel: Annotation(),
    executedTool: Annotation(),

    toolResult: Annotation(),
    toolError: Annotation(),
    noDataFound: Annotation(),

    ragDocs: Annotation(),
    ragFallback: Annotation(), // plain-text answer used if the model's wording cannot be trusted

    contextText: Annotation(),
    answer: Annotation(),
    answerSource: Annotation(), // 'fixed' | 'template' | 'empty' | 'llm' | 'fallback'
    sources: Annotation(),
})
