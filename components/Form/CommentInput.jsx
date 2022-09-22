import React from 'react';

export default function CommentInput(props) {
  return (
    <div>
      <label htmlFor='FeedbackForm-' {...props.name} className='txt-l txt-l--sm'>
        {props.title ? props.title : undefined}
      </label>
      <textarea
        rows={10}
        name={props.name}
        className={props.error ? 'color: red' : 'color: black'}
        placeholder={props.placeholder}
        value={props.value}
        id='FeedbackForm-'
        {...props.name}
        onChange={props.onChange}
        onBlur={props.onBlur}
      />
    </div>
  );
}
