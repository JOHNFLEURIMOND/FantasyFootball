import React, {useState} from 'react';
import {Card, CardHeader, YoutubeCardContent, CardBody, NameFieldset} from '../Card/index';

import {ExperienceContainer, Title, CardDiv} from './index';

const Experience = () => {
  const [card, flipCard] = useState(false);
  return (
    <ExperienceContainer>
      <Title>Experience</Title>

      <CardDiv>
        {card ? (
          <Card>
            <CardBody
              onClick={() => flipCard(false)}
              role='contentInfo'
              aria-pressed='false'
              aria-label='Product Card with a Image and a list of price, type of strain, thc and cbd levels.'>
              <CardHeader role='img' aria-label='Description of the Product image'>
                <NameFieldset aria-label='title'>Front End</NameFieldset>
              </CardHeader>

              <YoutubeCardContent aria-label='description'>
                As I continue to grow in as an Engineer, I would also love to grow in the Back End development so I can
                be more proficient become better being a Full-stack Developer. I have experience with relational and
                non-relational databases using promgramming langanuages, Node & Express to develop CRUD applications.
              </YoutubeCardContent>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody onClick={() => flipCard(true)}>
              <CardHeader role='img' aria-label='Description of the overall image'>
                <NameFieldset aria-label='title'>Backend</NameFieldset>
              </CardHeader>
              <YoutubeCardContent aria-label='description'>
                I do my best to embower the designer and prevent techinical constrants from composing user experince.
                Developing a simple single static to a complex web-based internet applications with responsive resuable
                components. Leverage developer workflow tools such as Jenkins, Docker, Git, Slack, JIRA and Confluence
              </YoutubeCardContent>
            </CardBody>
          </Card>
        )}
      </CardDiv>
    </ExperienceContainer>
  );
};

export default Experience;
