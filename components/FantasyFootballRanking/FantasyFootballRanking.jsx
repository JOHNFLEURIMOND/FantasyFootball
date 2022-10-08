import React, { useContext } from 'react';
import {
  Card,
  CardHeader,
  HeaderTitle,
  CardBody,
  NameFieldset,
  Description,
} from '../Card/index';
import { NewsContext } from '../App';
import { MainContainer, Title, CardDiv, SearchDiv, Header } from './index';
import { Dimmer, Loader, Image, Segment, Input } from 'semantic-ui-react';

const FantasyFootballRanking = () => {
  const { card, flipCard, data, search, setSearch, loaded } =
    useContext(NewsContext);
  return (
    <MainContainer>
      <Title>Fantasy Football News</Title>
      <>
        <SearchDiv>
          <Header>Search News</Header>
          <Input
            type='text'
            label='NFL'
            placeholder='Search For News'
            onChange={e => setSearch(e.target.value)}
          />
        </SearchDiv>

        <CardDiv>
          {loaded ? (
            <>
              <Segment>
                <Dimmer active inverted>
                  <Loader size='large'>Loading</Loader>
                </Dimmer>

                <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
              </Segment>
            </>
          ) : (
            data
              .filter(value => {
                if (search === '') {
                  return value;
                } else if (
                  value.Content.toLowerCase().includes(search.toLowerCase())
                ) {
                  return value;
                }
              })
              .map((d, index) => (
                <div key={index}>
                  {card ? (
                    <Card>
                      <CardBody onClick={() => flipCard(false)}>
                        <CardHeader
                          role='img'
                          aria-label='Description of the overall image'
                        >
                          <HeaderTitle aria-label='title'>
                            {d.Content}
                          </HeaderTitle>
                        </CardHeader>
                        <Description aria-label='description'>
                          Posted: {d.TimeAgo}
                        </Description>
                      </CardBody>
                    </Card>
                  ) : (
                    <Card>
                      <CardBody
                        onClick={() => flipCard(true)}
                        role='contentInfo'
                        aria-pressed='false'
                        aria-label='Product Card with a Image and a list of price, type of strain, thc and cbd levels.'
                      >
                        <CardHeader
                          role='img'
                          aria-label='Description of the Product image'
                        >
                          <NameFieldset aria-label='title'>
                            Title: {d.Title}
                          </NameFieldset>
                        </CardHeader>
                        <NameFieldset aria-label='description'>
                          Source: {d.Source}
                        </NameFieldset>
                      </CardBody>
                    </Card>
                  )}
                </div>
              ))
          )}
        </CardDiv>
      </>
    </MainContainer>
  );
};

export default FantasyFootballRanking;
