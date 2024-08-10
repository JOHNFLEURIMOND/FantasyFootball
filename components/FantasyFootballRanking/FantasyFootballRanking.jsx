import React, { useContext, useState, useCallback, useEffect } from 'react';
import { NewsContext } from '../context'; // Updated import path
import {
  Card,
  CardHeader,
  HeaderTitle,
  CardBody,
  NameFieldset,
  Description,
} from '../Card/index';
import {
  MainContainer,
  Title,
  CardDiv,
  SearchDiv,
  Header,
  LoadingDiv,
} from './index';
import { Dimmer, Loader, Image, Segment, Input } from 'semantic-ui-react';

const FantasyFootballRanking = () => {
  const [isCardFlipped, setIsCardFlipped] = useState(-1);
  const { news, search, setSearch, loaded, fetchNews } =
    useContext(NewsContext);

  useEffect(() => {
    // Replace 'YOUR_API_KEY' with actual API key or logic to get it
    fetchNews('YOUR_API_KEY');
  }, [fetchNews]);

  const handleClick = useCallback(index => {
    setIsCardFlipped(prevIndex => (prevIndex === index ? -1 : index));
  }, []);

  if (!loaded) {
    return (
      <LoadingDiv>
        <Segment size='massive' style={{ height: '650px' }}>
          <Dimmer active inverted>
            <Loader size='large'>Loading</Loader>
          </Dimmer>
          <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
        </Segment>
        {/* Repeat segments if needed */}
      </LoadingDiv>
    );
  }

  return (
    <MainContainer>
      <Title>Fantasy Football News</Title>
      <SearchDiv>
        <Header>Search News</Header>
        <Input
          type='text'
          label='NFL'
          placeholder='Search For News'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </SearchDiv>
      <CardDiv>
        {news
          .filter(
            value =>
              search === '' ||
              value.Title.toLowerCase().includes(search.toLowerCase())
          )
          .map((d, index) => (
            <div key={index}>
              {isCardFlipped === index ? (
                <Card>
                  <CardBody onClick={() => handleClick(index)}>
                    <CardHeader
                      role='img'
                      aria-label='Description of the overall image'
                    >
                      <HeaderTitle aria-label='title'>{d.Content}</HeaderTitle>
                    </CardHeader>
                    <Description aria-label='description'>
                      Posted: {d.TimeAgo}
                    </Description>
                  </CardBody>
                </Card>
              ) : (
                <Card>
                  <CardBody onClick={() => handleClick(index)}>
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
          ))}
      </CardDiv>
    </MainContainer>
  );
};

export default FantasyFootballRanking;
