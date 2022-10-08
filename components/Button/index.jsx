import { fleurimondColors } from '../../utils/theme.js';
import styled, { createGlobalStyle } from 'styled-components';
import { Button } from 'semantic-ui-react';

export const StyledButton = styled(Button)`
    font-size: 13px;
    border-radius: 3px;
    border-style: solid;
    border-width: 1px;
    padding: 10px 10px;
    font-weight: bolder;
    color: ${fleurimondColors.white};
    background-color: ${fleurimondColors.black};
    border-color: ${fleurimondColors.black};
    cursor: pointer;
    display: inline-block;
    letter-spacing: 0.02em;
    line-height: 1;

    :hover, :active, :focus{
        background-color: ${fleurimondColors.white};
        border-color: ${fleurimondColors.black};
        color: ${fleurimondColors.black};
        text-decoration: none;
      },
  
@media all and (max-width:30em){
  display:block;
  margin:0.4em auto;
 }

`;
