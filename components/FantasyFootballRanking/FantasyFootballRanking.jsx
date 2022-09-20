import React, { useState, useEffect } from "react";
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

const FantasyFootballRanking = () => {
  const [card, flipCard] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const getPlayers = async () => {
    await axios
      .get(
        "https://api.sportsdata.io/v3/nfl/scores/json/News?key=31c47054e334469486c840aee3f595b6"
      )
      .then(responses => setData(responses.data))
      .catch(error => setError(error.message))
      .finally(() => setLoaded(true));

  };

  useEffect(() => {
    getPlayers();
  }, []);

  return (
    <ProjectsSectionContainer>
      <Title>Fantasy Football News</Title>
      <>
        <CardDiv>
          {data.map((d, index) => (
            <div key={index}>
              {card ? (
                <Card>
                  <CardBody onClick={() => flipCard(false)}>
                    <CardHeader
                      role="img"
                      aria-label="Description of the overall image"
                    >
                      <YoutubeCardContent aria-label="title">
                        {d.Content}
                      </YoutubeCardContent>
                    </CardHeader>
                    <AVideo aria-label="description">Posted: {d.TimeAgo}</AVideo>
                  </CardBody>
                </Card>
              ) : (
                <Card>
                  <CardBody
                    onClick={() => flipCard(true)}
                    role="contentInfo"
                    aria-pressed="false"
                    aria-label="Product Card with a Image and a list of price, type of strain, thc and cbd levels."
                  >
                    <CardHeader
                      role="img"
                      aria-label="Description of the Product image"
                    >
                      <NameFieldset aria-label="title">
                        Title: {d.Title}
                      </NameFieldset>
                    </CardHeader>
                    <NameFieldset aria-label="description">
                      Source: {d.Source}
                    </NameFieldset>
                  </CardBody>
                </Card>
              )}
            </div>
          ))}
        </CardDiv>
      </>
    </ProjectsSectionContainer>
  );
};

export default FantasyFootballRanking;
