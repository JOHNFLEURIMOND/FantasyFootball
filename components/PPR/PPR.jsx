import React, { useState, useEffect } from 'react'
import Nav from '../Navbar/Nav.jsx';
import Footer from '../Footer/Footer';
import MainHero from '../MainHero/MainHero';
import { Provider as StyletronProvider, DebugEngine } from 'styletron-react';
import { Client as Styletron } from 'styletron-engine-atomic';
import {
    Card,
    CardHeader,
    YoutubeCardContent,
    CardBody,
    NameFieldset,
    PriceFieldset,
    AVideo
} from "../Card/index";
import axios from "axios";
import { ProjectsSectionContainer, Title, CardDiv } from "./index";
import { GlobalStyle, Container } from '../CSS/global-style';

const debug = process.env.NODE_ENV === 'production' ? void 0 : new DebugEngine();
const engine = new Styletron();

export default function PPR() {
    const [pprStats, setPprStats] = useState([]);
    const [card, flipCard] = useState(false);
    const [error, setError] = useState("");
    const [loaded, setLoaded] = useState(false);

    const getStats = async () => {
        await axios.get('https://api.sportsdata.io/v3/nfl/stats/json/FantasyPlayers?key=31c47054e334469486c840aee3f595b6')
            .then((response) => { setPprStats(response.data), console.log(response.data) })
            .catch(error => setError(error.message))
            .finally(() => setLoaded(true));
    }
    useEffect(() => {
        getStats();
    }, [])
    return (
        <Container>
            <GlobalStyle />
            <Nav />
            <MainHero />
            <ProjectsSectionContainer>
                <Title>Fantasy Football PPR Stats</Title>
                <div>
                    {error}
                </div>
                <div>
                    {loaded}
                </div>

                <CardDiv>
                    {pprStats.map((d, index) => (
                        <div>
                            {card ? (

                                <Card key={d.PlayerID}>
                                    <CardBody
                                        onClick={() => flipCard(false)}
                                        role="contentInfo"
                                        aria-pressed="false"
                                        aria-label="Product Card with a Image and a list of price, type of strain, thc and cbd levels."
                                    >
                                        <CardHeader
                                            role="img"
                                            aria-label="Description of the Product image"
                                        >
                                            <NameFieldset aria-label="title">
                                                Rushing Attempts : {(d.Position === 'RB') ? `${d.RushingAttempts}` : 'No Rushes'}
                                            </NameFieldset>
                                        </CardHeader>
                                        <NameFieldset aria-label="title" key={d.PlayerID}   >
                                            Rushing Yards:  {(d.Position === 'RB') ? `${d.RushingYards}` : 'No Rushes'}
                                        </NameFieldset>
                                        <NameFieldset aria-label="title" key={d.PlayerID}   >
                                            Rushing TDS:  {(d.Position === 'RB') ? `${d.RushingTouchdowns}` : 'No Rushes'}
                                        </NameFieldset>
                                        <NameFieldset aria-label="title" key={d.PlayerID}   >
                                            Receiving Yards and TDS:  {d.ReceivingYardsPerReception} : {d.ReceivingTouchdowns}
                                        </NameFieldset>
                                    </CardBody>
                                </Card>

                            ) : (
                                <Card key={d.PlayerID}>
                                    <CardBody onClick={() => flipCard(true)}>
                                        <CardHeader
                                            role="img"
                                            aria-label="Description of the overall image"
                                        >
                                            <YoutubeCardContent aria-label="title">
                                            {(d.Position === 'RB') ? `${d.Name}` : 'No Rushes'}
                                            </YoutubeCardContent>
                                        </CardHeader>
                                        <AVideo aria-label="description">Players Team: {d.Team} VS: {d.Opponent} </AVideo>
                                  
                                    </CardBody>
                                </Card>
                            )}
                        </div>
                    ))}
                </CardDiv>
            </ProjectsSectionContainer>
            <Footer />
        </Container >
    )
}
