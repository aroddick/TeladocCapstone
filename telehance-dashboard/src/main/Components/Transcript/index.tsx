import React, { useCallback, useMemo } from 'react';
import {
  Slate,
  Editable,
  RenderElementProps,
  RenderLeafProps,
} from 'slate-react';
import useCustomEditor from 'Hooks/useCustomEditor';
import { TranscriptData } from 'Models';
import Message from './Message';
import Word from './Word';
import classes from './Transcript.module.css';

export default function Transcript({
  transcript,
  onChange = () => {},
  isEditing = false,
  currWordStartTime = 0,
  setStartFrom = () => {},
}: TranscriptProps) {
  const editor = useCustomEditor();

  const useMessage = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case 'message':
        return <Message {...props} />;
      default:
        return <p {...props}>{props.children}</p>;
    }
  }, []);

  const useWord = ({ attributes, children, leaf }: RenderLeafProps) =>
    useMemo(
      () => (
        <Word
          isEditing={isEditing}
          isCurrent={leaf.start === currWordStartTime ?? false}
          onClick={setStartFrom}
          startTime={(leaf.start as number) ?? -1}
          attributes={attributes}
        >
          {children}
        </Word>
      ),
      [isEditing, leaf.start === currWordStartTime, leaf]
    );

  if (!transcript) return <h1>Unable to load transcript.</h1>;

  return (
    <div className={classes.container}>
      <Slate
        editor={editor}
        value={transcript}
        onChange={(value) => onChange(value as TranscriptData)}
      >
        <Editable
          readOnly={!isEditing}
          renderElement={useMessage}
          renderLeaf={useWord}
        />
      </Slate>
    </div>
  );
}

export type TranscriptProps = {
  transcript?: TranscriptData;
  onChange?: (value: TranscriptData) => void;
  isEditing?: boolean;
  currWordStartTime?: number;
  setStartFrom?: (value: number) => void;
};