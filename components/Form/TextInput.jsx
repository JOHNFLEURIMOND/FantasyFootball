import React from 'react';

export default function TextInput(props) {
  return (
    <div>
      <label htmlFor='FeedbackForm-' {...props.name}>
        {props.title}
        {props.required && <span aria-hidden='true'> Required</span>}
      </label>
      <input
        name={props.name}
        className={props.error ? 'color: red' : 'color: black'}
        placeholder={props.placeholder}
        value={props.value}
        id='FeedbackForm-'
        {...props.name}
        type='text'
        required={props.required}
        onChange={props.onChange}
        onBlur={props.onBlur}
      />
      {props.error && <div>{props.error}</div>}
    </div>
  );
}
