// Sources name only what actually ran and succeeded. Fixed replies (greeting, refusals, errors) cite nothing.
export const addSource = (state) => {
    const ran = state.executedTool && state.sourceLabel && !state.toolError && !state.missingParam
    return { sources: ran ? [state.sourceLabel] : [] }
}
