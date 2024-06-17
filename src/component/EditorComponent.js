import React, { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, Modifier, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './EditorComponent.css';

// Define custom inline styles
const styleMap = {
    RED: {
        color: 'red',
        fontWeight: 'normal',
    },
    BOLD: {
        fontWeight: 'bold',
    },
    UNDERLINE: {
        textDecoration: 'underline',
        color: '#000',
    }
};

const EditorComponent = () => {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

    useEffect(() => {
        const savedData = localStorage.getItem('editorContent');
        if (savedData) {
            setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(savedData))));
        }
    }, []);

    const handleKeyCommand = (command, editorState) => {
        if (command === 'split-block') {
            const currentContent = editorState.getCurrentContent();
            const selectionState = editorState.getSelection();
            const newContentState = Modifier.splitBlock(currentContent, selectionState);
            const newEditorState = EditorState.push(editorState, newContentState, 'split-block');
            const finalEditorState = RichUtils.toggleBlockType(newEditorState, 'unstyled');
            setEditorState(EditorState.moveFocusToEnd(finalEditorState));
            return 'handled';
        }

        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            return 'handled';
        }
        return 'not-handled';
    };

    const handleBeforeInput = (chars, editorState) => {
        const currentContent = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();
        const blockKey = selectionState.getStartKey();
        const block = currentContent.getBlockForKey(blockKey);
        const blockText = block.getText();

        if (chars === ' ') {
            if (blockText === '#') {
                const newContentState = Modifier.replaceText(currentContent, selectionState.merge({ anchorOffset: 0, focusOffset: 1 }), '');
                const newEditorState = EditorState.push(editorState, newContentState, 'remove-range');
                setEditorState(RichUtils.toggleBlockType(newEditorState, 'header-one'));
                return 'handled';
            } else if (blockText === '```') {
                const newContentState = Modifier.replaceText(currentContent, selectionState.merge({ anchorOffset: 0, focusOffset: 3 }), '');
                const newEditorState = EditorState.push(editorState, newContentState, 'remove-range');
                setEditorState(RichUtils.toggleBlockType(newEditorState, 'code-block'));
                return 'handled';
            } else if (blockText === '*') {
                const newContentState = Modifier.replaceText(currentContent, selectionState.merge({ anchorOffset: 0, focusOffset: 1 }), '');
                const newEditorState = EditorState.push(editorState, newContentState, 'remove-range');
                setEditorState(RichUtils.toggleInlineStyle(newEditorState, 'BOLD'));
                return 'handled';
            } else if (blockText === '**') {
                const newContentState = Modifier.replaceText(currentContent, selectionState.merge({ anchorOffset: 0, focusOffset: 2 }), '');
                const newEditorState = EditorState.push(editorState, newContentState, 'remove-range');
                setEditorState(RichUtils.toggleInlineStyle(newEditorState, 'RED'));
                return 'handled';
            } else if (blockText === '***') {
                const newContentState = Modifier.replaceText(currentContent, selectionState.merge({ anchorOffset: 0, focusOffset: 3 }), '');
                const newEditorState = EditorState.push(editorState, newContentState, 'remove-range');
                setEditorState(RichUtils.toggleInlineStyle(newEditorState, 'UNDERLINE'));
                return 'handled';
            } 
        }

        return 'not-handled';
    };

    const handleSave = () => {
        const contentState = editorState.getCurrentContent();
        const rawContentState = convertToRaw(contentState);
        localStorage.setItem('editorContent', JSON.stringify(rawContentState));
    };

    return (
        <div className="editor-container">
            <h1>Demo editor by Ankit Umrewal</h1>
            
            <div className="editor">
                <Editor
                    editorState={editorState}
                    handleKeyCommand={handleKeyCommand}
                    onChange={setEditorState}
                    handleBeforeInput={handleBeforeInput}
                    placeholder="Start typing..."
                    customStyleMap={styleMap}
                />
            </div>
            <button onClick={handleSave}>Save</button>
        </div>
    );
};

export default EditorComponent;
