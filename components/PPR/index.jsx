import styled, { css } from 'styled-components';
import { fleurimondColors } from '../../utils/theme.js';
import { Button } from 'semantic-ui-react';

export const PPRPageContainer = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  text-align: center;
  font-weight: 500;
  margin: 0;
  padding: 2em 15em;
  line-height: normal;
  background-color: ${fleurimondColors.white};
  padding: 64px 250px;

  @media (min-width: 800px) {
    box-sizing: border-box;
    margin: 0;
    padding: 64px 250px;
  }
  @media (min-width: 200px) {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    margin: 0;
  }
`;

export const Select = styled.select`
  margin: 0;
  max-width: 100%;
  flex: 1 0 auto;
  outline: 0;
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
  text-align: left;
  line-height: 1.21428571em;
  font-family: Lato, 'Helvetica Neue', Arial, Helvetica, sans-serif;
  padding: 0.67857143em 1em;
  background: #fff;
  border: 1px solid rgba(34, 36, 38, 0.15);
  color: rgba(0, 0, 0, 0.87);
  border-radius: 0.28571429rem;
  transition: box-shadow 0.1s ease, border-color 0.1s ease;
  box-shadow: none;

  option {
    color: black;
    background: white;
    display: flex;
    white-space: pre;
    min-height: 20px;
    padding: 0px 2px 1px;
  }
`;
export const SelectDiv = styled.div`
  width: auto;
  height: auto;
  box-sizing: border-box;
  font-size: 1rem;
  text-align: center;
  font-weight: 500;
  margin: 20px 0;
  line-height: normal;
  background-color: ${fleurimondColors.white};

  @media (min-width: 800px) {
    box-sizing: border-box;
  }
  @media (min-width: 400px) {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }
`;
export const LoadingDiv = styled.div`
  display: grid;
  justify-items: center;
  align-items: center;
  grid-gap: 1rem;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-template-rows: repeat(auto-fill, minmax(300px, 1fr));

  @media (max-width: 800px) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-template-rows: repeat(auto-fill, minmax(300px, 1fr));
    justify-items: center;
    align-items: center;
    grid-gap: 1rem;
  }
  @media (max-width: 464px) {
    display: grid;
    grid-template-columns: 1fr !important;
    grid-template-rows: 1fr 1fr 1fr !important;
    justify-items: center;
    align-items: center;
    grid-gap: 1rem;
  }
`;

export const CardSection = styled.div`
  display: grid;
  justify-items: center;
  align-items: center;
  grid-gap: 1rem;
  width: 100%;
  height: 100%;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;

  @media (max-width: 800px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    justify-items: center;
    align-items: center;
    grid-gap: 1rem;
  }
  @media (max-width: 430px) {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    justify-items: center;
    align-items: center;
    grid-gap: 1rem;
  }
`;

export const CardDiv = styled.div`
  display: grid;
  justify-items: center;
  align-items: center;
  grid-gap: 1rem;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-template-rows: repeat(auto-fill, minmax(300px, 1fr));
  padding: 0 5em;

  @media (max-width: 800px) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-template-rows: repeat(auto-fill, minmax(300px, 1fr));
    justify-items: center;
    align-items: center;
    grid-gap: 1rem;
  }
  @media (max-width: 464px) {
    display: grid;
    grid-template-columns: 1fr !important;
    grid-template-rows: 1fr 1fr 1fr !important;
    justify-items: center;
    align-items: center;
    grid-gap: 1rem;
  }
`;

export const Header = styled.p`
  font-size: 2rem;
  text-align: center;
  grid-column: span 3;
  margin: 1rem;

  @media (max-width: 800px) {
    font-size: 2rem;
    text-align: center;
    grid-column: span 2;
  }
  @media (max-width: 320px) {
    font-size: 2rem;
    text-align: center;
    grid-column: span 2;
    margin: 1rem 0;
  }
`;
export const SearchDiv = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  text-align: center;
  font-weight: 500;
  padding: 20px;
  line-height: normal;
  background-color: ${fleurimondColors.white};

  @media (min-width: 800px) {
    box-sizing: border-box;
    padding: 20px;
  }
  @media (min-width: 200px) {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 20px;
  }
`;
export const Hamburger = styled.span`
  width: 32px;
  height: 25px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
`;
export const Bolt = styled.span`
  position: relative;
  margin: 50px;
  width: 30px;
  height: 50px;
  transform-origin: 50% 50%;
  transform: skewX(-30deg) skewY(-30deg) rotate(10deg);
  background-color: yellow;
  padding: 0;
  margin-left: 0;
  margin-right: 0;

  &:before {
    position: absolute;
    border-style: solid;
    border-width: 0 0 10px 5px;
    border-color: transparent transparent ${fleurimondColors.graySmoke}
      transparent;
    top: 0px;
    left: -11px;
    padding: 0;
    margin: 0;
    content: '';
  }

  &:after {
    display: inline-block;
    position: absolute;
    border-style: solid;
    border-width: 0 0 10px 5px;
    border-color: transparent transparent transparent
      ${fleurimondColors.graySmoke};
    bottom: 0px;
    right: 3px;
    content: '';
  }
`;
export const FlippedCardInfoFieldset = styled.span`
  color: ${fleurimondColors.smoke};
  display: block;
  font-size: 15px;
  width: 100%;
  font-family: 'proxima-nova', 'sans-serif';
  font-weight: 500;
  position: relative;
  padding: 0 10px;
  margin: 5px;
`;

export const StyledButton = styled(Button)`
    font-size: 13px;
    border-radius: 3px;
    border-style: solid;
    border-width: 1px;
    padding: 10px 10px;
    text-decoration: none;
    margin: 1rem auto;
    color: ${fleurimondColors.graySmoke};
    background-color: ${fleurimondColors.white};
    border-color: ${fleurimondColors.graySmoke};
    cursor: pointer;
    display: inline-block;
    letter-spacing: 0.02em;
    line-height: 1;

    :hover, :active, :focus{
        background-color: ${fleurimondColors.graySmoke};
        border-color: ${fleurimondColors.graySmoke};
        color: ${fleurimondColors.white};
        text-decoration: none;
      },
  
@media all and (max-width:30em){
  display:block;
  margin:0.4em auto;
 }

`;

export const Title = styled.h1`
  font-size: 3rem;
  text-align: center;
  grid-column: span 3;
  margin: 3rem;

  @media (max-width: 800px) {
    font-size: 2rem;
    text-align: center;
    grid-column: span 2;
  }
  @media (max-width: 320px) {
    font-size: 2rem;
    text-align: center;
    grid-column: span 2;
    margin: 1rem 0;
  }
`;
