import React from 'react';

export default function Checkbox(props) {
  return (
    <label>
      <input
        name={props.name}
        value={props.value}
        required={props.required}
        type='checkbox'
        onChange={props.onChange}
        onBlur={props.onBlur}
        checked={props.checked}
      />
      {props.error && <div>{props.error}</div>}
      <span>{props.title}</span>
    </label>
  );
}
