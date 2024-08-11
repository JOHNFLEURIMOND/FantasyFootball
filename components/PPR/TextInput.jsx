// components/WeeklyProjections/TextInput.jsx
import React from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
  width: 100%;
`;

const Label = styled.label`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: ${({ error, theme }) =>
    error ? 'red' : theme.fleurimondColors.black};
`;

const InputField = styled.input`
  width: 100%;
  max-width: 420px;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid
    ${({ $error, theme }) => ($error ? 'red' : theme.fleurimondColors.black)};
  outline: none;
  box-sizing: border-box;
  font-size: 1rem;
  transition: border-color 0.3s;

  &:focus {
    border-color: ${({ theme }) => theme.fleurimondColors.blue};
  }

  @media (max-width: ${({ theme }) => theme.media.tab}) {
    padding: 1rem;
    max-width: 86%;
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    padding: 1rem;
    max-width: 85%;
  }
`;

const ErrorText = styled.div`
  font-size: 0.875rem;
  color: red;
  margin-top: 0.25rem;
`;

const TextInput = React.memo(
  ({
    name,
    title,
    placeholder = '',
    value = '',
    error = '',
    required = false,
    onChange,
    onBlur,
  }) => (
    <InputWrapper>
      <Label htmlFor={name} error={error}>
        {title}
        {required && <span aria-hidden='true'> Required</span>}
      </Label>
      <InputField
        name={name}
        id={name}
        placeholder={placeholder}
        value={value}
        $error={error}
        required={required}
        aria-required={required}
        onChange={onChange}
        onBlur={onBlur}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <ErrorText id={`${name}-error`} role='alert'>
          {error}
        </ErrorText>
      )}
    </InputWrapper>
  )
);

export default TextInput;
