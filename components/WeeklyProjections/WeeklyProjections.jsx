import React, { useState, useEffect } from 'react';
import Nav from '../Navbar/Nav.jsx';
import Footer from '../Footer/Footer';
import MainHero from '../MainHero/MainHero';
import { Provider as StyletronProvider, DebugEngine } from 'styletron-react';
import { Client as Styletron } from 'styletron-engine-atomic';
import { ProjectsSectionContainer, CardDiv, Title } from './index';
import {
    Card,
    CardHeader,
    YoutubeCardContent,
    CardBody,
    NameFieldset,
    PriceFieldset,
    AVideo,
} from '../Card/index';
import axios from 'axios';
import { GlobalStyle, Container } from '../CSS/global-style';
import {
    Icon,
    Pagination,
    Dimmer,
    Loader,
    Image,
    Segment,
} from 'semantic-ui-react';
const key = process.env.REACT_APP_MY_API_KEY;

const debug =
    process.env.NODE_ENV === 'production' ? void 0 : new DebugEngine();
const engine = new Styletron();

function WeeklyProjections() {
    const [card, flipCard] = useState(false);
    const [stats, setStats] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoaded] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setLoaded(true);
        const getStats = async () => {
            await axios
                .get(
                    `https://api.sportsdata.io/v3/nfl/projections/json/PlayerGameProjectionStatsByWeek/2022REG/3?key=${key}`,
                )
                .then((responses) => {
                    setStats(responses.data), console.log(responses.data);
                })
                .catch((error) => setError(error.message))
                .finally(() => setLoaded(false));
        };

        getStats();
    }, []);
    return (
        <Container>
            <GlobalStyle />
            <Nav />
            <MainHero />
            <ProjectsSectionContainer>
                <Title>Fantasy Football News</Title>
                <h1>Search Players</h1>
                <input
                    type='text'
                    placeholder='Search For News'
                    onChange={(e) => setSearch(e.target.value)}
                />
                <CardDiv>

                    {loading ? (
                        <Segment>
                            <Dimmer active inverted>
                                <Loader size='large'>Loading</Loader>
                            </Dimmer>

                            <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
                        </Segment>
                    ) : (
                        stats
                            .filter((value) => {
                                if (search === '') {
                                    return value;
                                } else if (
                                    value.Name.toLowerCase().includes(search.toLowerCase())
                                ) {
                                    return value;
                                }
                            })
                            .map((d, index) => (
                                <div>
                                    {card ? (
                                        <Card key={d.PlayerID}>
                                            <CardBody
                                                onClick={() => flipCard(false)}
                                                role='contentInfo'
                                                aria-pressed='false'
                                                aria-label='Product Card with a Image and a list of price, type of strain, thc and cbd levels.'>
                                                <CardHeader
                                                    role='img'
                                                    aria-label='Description of the Product image'>
                                                    <NameFieldset aria-label='title'>
                                                        Active:{' '}
                                                        {d.Activated === 1 ? 'Active' : 'Not Active'}
                                                    </NameFieldset>
                                                </CardHeader>
                                                <NameFieldset aria-label='title'>
                                                    Fantasy Points FanDuel: {d.FantasyPointsFanDuel}
                                                </NameFieldset>
                                                <NameFieldset aria-label='description'>
                                                    Fantasy Points: {d.FantasyPoints}
                                                </NameFieldset>
                                                <NameFieldset aria-label='description'>
                                                    FantasyPointsPPR: {d.FantasyPointsPPR}
                                                </NameFieldset>
                                            </CardBody>
                                        </Card>
                                    ) : (
                                        <Card key={d.PlayerID}>
                                            <CardBody onClick={() => flipCard(true)}>
                                                <CardHeader
                                                    role='img'
                                                    aria-label='Description of the overall image'>
                                                    <YoutubeCardContent aria-label='title'>
                                                        {d.Name} : {d.Position}
                                                    </YoutubeCardContent>
                                                </CardHeader>
                                                <AVideo aria-label='description'>
                                                    Players Team: {d.Team} VS: {d.Opponent}{' '}
                                                </AVideo>
                                                <AVideo aria-label='description'>
                                                    {d.HomeOrAway === 'AWAY'
                                                        ? 'Playing Away'
                                                        : 'Playing At Home'}
                                                </AVideo>
                                                <AVideo aria-label='description'>
                                                    Game Date: {d.GameDate}
                                                </AVideo>
                                            </CardBody>
                                        </Card>
                                    )}
                                </div>
                            ))
                    )}
                </CardDiv>
                <Pagination
                    defaultActivePage={5}
                    ellipsisItem={{
                        content: <Icon name='ellipsis horizontal' />,
                        icon: true,
                    }}
                    firstItem={{ content: <Icon name='angle double left' />, icon: true }}
                    lastItem={{ content: <Icon name='angle double right' />, icon: true }}
                    prevItem={{ content: <Icon name='angle left' />, icon: true }}
                    nextItem={{ content: <Icon name='angle right' />, icon: true }}
                    totalPages={10}
                />
            </ProjectsSectionContainer>
            s <Footer />
        </Container>
    );
}

export default WeeklyProjections;
