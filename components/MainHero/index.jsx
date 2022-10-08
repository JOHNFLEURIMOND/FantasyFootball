import styled from 'styled-components';
import { fleurimondColors } from '../../utils/theme.js';
import img from '../../public/fantasyfootball.jpeg';

export const MainHero = styled.div`
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
  font-size: 20px;
  background-image: url(${img});
  background-color: ${fleurimondColors.midnight};
  padding: 20px;
  margin: 0 0 20px 0;
  z-index: -99999999;

  @media only screen and (max-width: 800px) {
    min-height: 50vh;
  }
  @media only screen and (max-width: 420px) {
    min-height: 50vh;
  }
`;

export const LeftHalf = styled.div`
  min-width: 100vh;
  min-height: 70vh;
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  align-items: center;
`;

export const Title = styled.h1`
  letter-spacing: 1px;
  font-size: 2.4em;
  padding: 1rem;
  margin-top: 2em;
  @media only screen and (max-width: 800px) {
    font-size: 1.8em;
  }
  @media only screen and (max-width: 420px) {
    font-size: 1em;
  }
`;
export const TitleName = styled.h1`
  letter-spacing: 1px;
  font-size: 3.4em;
  padding: 1rem;

  @media only screen and (max-width: 800px) {
    font-size: 1.8em;
  }
  @media only screen and (max-width: 420px) {
    font-size: 1em;
  }
`;
export const TitleProfession = styled.h1`
  letter-spacing: 1px;
  font-size: 2em;
  padding: 1rem;

  @media only screen and (max-width: 800px) {
    font-size: 1.8em;
  }
  @media only screen and (max-width: 420px) {
    font-size: 1em;
  }
`;

export const TitleSpan = styled.h1`
  letter-spacing: 1px;
  display: inline-block;
  font-size: 2em;
  padding: 1rem;
  color: ${fleurimondColors.palesasAqua};

  @media only screen and (max-width: 800px) {
    font-size: 1.8em;
    flex: 1;
  }
  @media only screen and (max-width: 420px) {
    font-size: 1em;
    flex: 1;
  }
`;
