import React, {useState, useEffect} from 'react';
import {Card, CardHeader, YoutubeCardContent, CardBody, NameFieldset, PriceFieldset, AVideo} from '../Card/index';
import axios from 'axios';
import {ProjectsSectionContainer, Title, CardDiv} from './index';
import {Icon, Pagination, Dimmer, Loader, Image, Segment} from 'semantic-ui-react';

const FantasyFootballRanking = () => {
  const [card, flipCard] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [loaded, setLoaded] = useState(false);
  const key = process.env.REACT_APP_MY_API_KEY;

  useEffect(() => {
    const getPlayers = async () => {
      setLoaded(true);
      await axios
        .get(`https://api.sportsdata.io/v3/nfl/scores/json/News?key=${key}`)
        .then((responses) => setData(responses.data))
        .catch((error) => setError(error.message))
        .finally(() => setLoaded(false));
    };

    getPlayers();
  }, []);

  return (
    <ProjectsSectionContainer>
      <Title>Fantasy Football News</Title>

      <>
        <h1>Search News</h1>
        <input type='text' placeholder='Search For News' onChange={(e) => setSearch(e.target.value)} />
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
              .filter((value) => {
                if (search === '') {
                  return value;
                } else if (value.Content.toLowerCase().includes(search.toLowerCase())) {
                  return value;
                }
              })
              .map((d, index) => (
                <div key={index}>
                  {card ? (
                    <Card>
                      <CardBody onClick={() => flipCard(false)}>
                        <CardHeader role='img' aria-label='Description of the overall image'>
                          <YoutubeCardContent aria-label='title'>{d.Content}</YoutubeCardContent>
                        </CardHeader>
                        <AVideo aria-label='description'>Posted: {d.TimeAgo}</AVideo>
                      </CardBody>
                    </Card>
                  ) : (
                    <Card>
                      <CardBody
                        onClick={() => flipCard(true)}
                        role='contentInfo'
                        aria-pressed='false'
                        aria-label='Product Card with a Image and a list of price, type of strain, thc and cbd levels.'>
                        <CardHeader role='img' aria-label='Description of the Product image'>
                          <NameFieldset aria-label='title'>Title: {d.Title}</NameFieldset>
                        </CardHeader>
                        <NameFieldset aria-label='description'>Source: {d.Source}</NameFieldset>
                      </CardBody>
                    </Card>
                  )}
                </div>
              ))
          )}
        </CardDiv>
      </>
    </ProjectsSectionContainer>
  );
};

export default FantasyFootballRanking;
