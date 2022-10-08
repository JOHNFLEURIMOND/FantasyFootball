import styled from 'styled-components';
import { fleurimondColors } from '../../utils/theme.js';

export const Card = styled.article`
border: 1px solid ${fleurimondColors.lightSmoke};
border-radius: 10px;
display: grid; 
min-width: 200px;
max-width: 400px;
min-height: 300px;
padding: 1rem 0;
margin: 2rem;
background: ${props => (props.selected ? '#E8F1FF' : '#FFFFFF')};
border: ${props =>
  props.selected ? '1.5px solid #2375A4' : '1px solid #d5dde3'}
@media(max-width: 800px){
  min-width: 200px;
max-width: 400px;
  min-height: 300px;
  padding: 1rem 0;
}
@media(max-width: 430px){
  min-width: 200px;
  max-width: 400px;
  min-height: 300px;
  min-height: 300px;
  padding: 1rem 0;
}
}
`;

export const CardImage = styled.img`
  object-fit: cover;
  width: 100%;
`;

export const CardHeader = styled.header`
  cursor: context-menu;
  border-bottom: 1px solid ${fleurimondColors.lightSmoke};
`;

export const CardHeading = styled.h1`
  font-size: 24px;
  font-weight: bold;
  cursor: context-menu;
  text-align: center;
`;

export const CardBody = styled.figure`
  display: grid;
  grid-template-areas: 200px 50px;
`;

export const PriceFieldset = styled.h3`
  color: ${fleurimondColors.dutchieBlue};
  font-family: 'proxima-nova', 'sans-serif';
  font-size: 1.25rem;
  border: 0;
`;

export const NameFieldset = styled.h3`
  color: ${fleurimondColors.black};
  padding: 0.75rem;
  font-size: 1rem;
  border: 0;
  text-overflow: ellipsis;
`;

export const HeaderTitle = styled.p`
  font-size: 1rem;
  text-decoration: none;
  padding: 0 32px;
  color: ${fleurimondColors.smoke};
  margin-top: 20px;
  border: 0;
`;
export const Description = styled.a`
  font-size: 1rem;
  text-decoration: none;
  color: ${fleurimondColors.smoke};
  position: relative;
  padding: 0 32px;
  margin-top: 20px;
  border: 0;

  :hover {
    color: ${fleurimondColors.bebeBlue};
  }
`;

export const FlippedCardInfoFieldset = styled.span`
  color: ${fleurimondColors.smoke};
  font-size: 1rem;
  width: 100%;
  font-weight: 500;
  padding: 0 10px;
  margin: 5px;
`;
