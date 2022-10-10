import React, { useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  HeaderTitle,
  CardBody,
  NameFieldset,
  Description,
} from '../Card/index';
import {
  CardDiv,
  LoadingDiv,
  SearchDiv,
  Header,
  SelectDiv,
  Select,
} from './index';
import {
  Dimmer,
  Loader,
  Image,
  Segment,
  Input,
  Form,
  Radio,
} from 'semantic-ui-react';

export default function PlayerCards({ stats, loading }) {
  const [isCardFlipped, setIsCardFlipped] = useState(-1);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const handleClick = useCallback(index => {
    setIsCardFlipped(index);
    if (isCardFlipped == index) {
      setIsCardFlipped(-1);
    }
  });

  const filterPositionItems = [...new Set(stats.map(item => item.Position))];

  if (loading) {
    return (
      <LoadingDiv>
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>{' '}
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
      </LoadingDiv>
    );
  }
  let statsSort = null;
  if (positionFilter == 'QB') {
    statsSort = (
      <Form>
        <Form.Field>
          <Radio
            label='Passing Attempts'
            key='1'
            name='radioGroup'
            value='PassingAttempts'
            style={{
              overflowY: 'hidden' /* Hide vertical scrollbar */,
              overflowX: 'hidden',
            }}
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label='Passing Yards'
            key='2'
            name='radioGroup'
            value='PassingYards'
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label='Passing Touchdowns'
            key='2'
            name='radioGroup'
            value='PassingTouchdowns'
          />
        </Form.Field>
      </Form>
    );
  } else if (positionFilter == 'RB') {
    statsSort = (
      <Form>
        <Form.Field>
          <Radio
            label='Rushing Attempts'
            key='4'
            name='radioGroup'
            value='RushingAttempts'
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label='Rushing Yards'
            key='5'
            name='radioGroup'
            value='RushingYards'
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label='Rushing Touchdowns'
            key='6'
            name='radioGroup'
            value='RushingTouchdowns'
          />
        </Form.Field>
      </Form>
    );
  } else if (positionFilter == 'WR') {
    statsSort = (
      <Form>
        <Form.Field>
          <Radio
            label='Receiving Attempts'
            key='7'
            name='radioGroup'
            value='Receptions'
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label='Receiving Yards'
            key='8'
            name='radioGroup'
            value='ReceivingYards'
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label='Receiving Touchdowns'
            key='9'
            name='radioGroup'
            value='ReceivingTouchdowns'
          />
        </Form.Field>
      </Form>
    );
  } else if (positionFilter == 'TE') {
    statsSort = (
      <Form>
        <Form.Field>
          <Radio
            label='Receiving Attempts'
            key='7'
            name='radioGroup'
            value='Receptions'
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label='Receiving Yards'
            key='8'
            name='radioGroup'
            value='ReceivingYards'
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label='Receiving Touchdowns'
            key='9'
            name='radioGroup'
            value='ReceivingTouchdowns'
          />
        </Form.Field>
      </Form>
    );
  }

  return (
    <div>
      <div className='SearchBar'>
        <SearchDiv>
          <Header>Search Players</Header>
          <Input
            type='text'
            label='NFL'
            loading={loading}
            placeholder='Search For Players'
            onChange={e => setSearch(e.target.value)}
          />
        </SearchDiv>
        <SelectDiv className='select'>
          <Select
            onChange={e => setPositionFilter(e.target.value)}
            className='custom-select'
            aria-label='Filter Countries By Position'
          >
            <option value=''>Filter By Position</option>
            {filterPositionItems.map((item, index) => (
              <option key={index} value={item}>
                Filter {item}
              </option>
            ))}
          </Select>
          <SelectDiv>{statsSort}</SelectDiv>
        </SelectDiv>
      </div>
      <CardDiv>
        {stats
          .filter(value => {
            if (search === '') {
              return value;
            } else if (
              value.Name.toLowerCase().includes(search.toLowerCase())
            ) {
              return value;
            }
          })
          .filter(value => {
            if (positionFilter === '') {
              return value;
            } else if (value.Position.includes(positionFilter)) {
              return value;
            }
          })
          .map((d, index) => (
            <div key={index}>
              {isCardFlipped === index ? (
                <Card>
                  <CardBody
                    onClick={() => handleClick(index)}
                    role='contentInfo'
                    aria-pressed='false'
                    aria-label='Product Card with a Image and a list of price, type of strain, thc and cbd levels.'
                  >
                    <CardHeader
                      role='img'
                      aria-label='Description of the Product image'
                    >
                      <NameFieldset aria-label='title'>
                        Passing Yards/ Passing TDS: {d.PassingYards} :{' '}
                        {d.PassingTouchdowns}:
                      </NameFieldset>
                    </CardHeader>
                    <NameFieldset aria-label='title' key={d.PlayerID}>
                      Rushing Attempts:{d.RushingAttempts} / Rushing Yard:{' '}
                      {d.RushingYards} / Rushing TDS {d.RushingTouchdowns}
                    </NameFieldset>
                    <NameFieldset aria-label='title' key={d.PlayerID}>
                      Receptions: {d.Receptions} / Receiving Yards/{' '}
                      {d.ReceivingYards}/ Receiving TDS:{d.ReceivingTouchdowns}/
                    </NameFieldset>
                  </CardBody>
                </Card>
              ) : (
                <Card>
                  <CardBody onClick={() => handleClick(index)}>
                    <CardHeader
                      role='img'
                      aria-label='Description of the overall image'
                    >
                      <HeaderTitle aria-label='title'>{d.Name}</HeaderTitle>
                    </CardHeader>
                    <Description aria-label='description'>
                      Players Team: {d.Team} VS: {d.Opponent}{' '}
                    </Description>
                  </CardBody>
                </Card>
              )}
            </div>
          ))}
      </CardDiv>
    </div>
  );
}
