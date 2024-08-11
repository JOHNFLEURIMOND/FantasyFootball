// components/PPR/PlayerCards.jsx
import React, { useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  HeaderTitle,
  CardBody,
  NameFieldset,
  Description,
} from '../Card/index';
import { CardDiv, LoadingDiv } from './index';
import { Dimmer, Loader, Image, Segment } from 'semantic-ui-react';

export default function PlayerCards({ stats, loading }) {
  const [isCardFlipped, setIsCardFlipped] = useState(-1);

  const handleClick = useCallback(index => {
    setIsCardFlipped(prevIndex => (prevIndex === index ? -1 : index));
  }, []);

  if (loading) {
    return (
      <LoadingDiv>
        {[...Array(8)].map((_, index) => (
          <Segment key={index} size='massive' style={{ height: '650px' }}>
            <Dimmer active inverted>
              <Loader size='large'>Loading</Loader>
            </Dimmer>
            <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
          </Segment>
        ))}
      </LoadingDiv>
    );
  }

  return (
    <CardDiv>
      {stats.map((d, index) => (
        <div key={d.PlayerID}>
          {isCardFlipped === index ? (
            <Card>
              <CardBody
                onClick={() => handleClick(index)}
                role='contentInfo'
                aria-pressed={isCardFlipped === index}
                aria-label={`Card with stats for ${d.Name}`}
              >
                <CardHeader role='img' aria-label='Card with stats'>
                  <NameFieldset aria-label='Passing Yards and Touchdowns'>
                    Passing Yards: {d.PassingYards} / Passing Touchdowns:{' '}
                    {d.PassingTouchdowns}
                  </NameFieldset>
                </CardHeader>
                <NameFieldset aria-label='Rushing Attempts, Rushing Yards, and Rushing Touchdowns'>
                  Rushing Attempts: {d.RushingAttempts} / Rushing Yards:{' '}
                  {d.RushingYards} / Rushing Touchdowns: {d.RushingTouchdowns}
                </NameFieldset>
                <NameFieldset aria-label='Receptions, Receiving Yards, and Receiving Touchdowns'>
                  Receptions: {d.Receptions} / Receiving Yards:{' '}
                  {d.ReceivingYards} / Receiving Touchdowns:{' '}
                  {d.ReceivingTouchdowns}
                </NameFieldset>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody onClick={() => handleClick(index)}>
                <CardHeader
                  role='img'
                  aria-label='Description of the Name and Match'
                >
                  <HeaderTitle aria-label='Name'>{d.Name}</HeaderTitle>
                </CardHeader>
                <Description aria-label='Players team vs Opponent'>
                  Player's Team: {d.Team} VS {d.Opponent}
                </Description>
              </CardBody>
            </Card>
          )}
        </div>
      ))}
    </CardDiv>
  );
}
