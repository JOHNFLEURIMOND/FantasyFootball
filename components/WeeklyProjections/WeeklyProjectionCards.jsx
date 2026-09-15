import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  memo,
} from 'react';
import TextInput from './TextInput';
import Pagination from '../Pagination/Pagination';
import { deriveProjectionPage } from './pagination';
import styled, { keyframes } from 'styled-components';
import { fleurimondColors } from '../CSS/theme';

const WeeklyProjectionCards = ({ stats, loading }) => {
  const [isCardFlipped, setIsCardFlipped] = useState(-1);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [sortBy, setSortBy] = useState('FantasyPointsPPR');
  const [currentPage, setCurrentPage] = useState(1);

  const handleClick = useCallback(index => {
    setIsCardFlipped(prevIndex => (prevIndex === index ? -1 : index));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setIsCardFlipped(-1);
  }, [search, positionFilter, sortBy]);

  const filterPositionItems = useMemo(
    () => [...new Set(stats.map(item => item.Position).filter(Boolean))].sort(),
    [stats]
  );

  const page = useMemo(
    () =>
      deriveProjectionPage({
        stats,
        search,
        position: positionFilter,
        sortBy,
        currentPage,
      }),
    [stats, search, positionFilter, sortBy, currentPage]
  );

  if (loading) {
    return (
      <LoadingDiv>
        {[...Array(9)].map((_, i) => (
          <LoaderWrapper key={i}>
            <Loader />
          </LoaderWrapper>
        ))}
      </LoadingDiv>
    );
  }

  return (
    <div>
      <SearchDiv>
        <h2>Search Players</h2>
        <TextInput
          name='search'
          title='Search'
          placeholder='Search For Players'
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
      </SearchDiv>
      <SelectDiv>
        <StyledSelect
          value={positionFilter}
          onChange={event => setPositionFilter(event.target.value)}
          aria-label='Filter Players By Position'
        >
          <option value=''>All positions</option>
          {filterPositionItems.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </StyledSelect>
        <StyledSelect
          value={sortBy}
          onChange={event => setSortBy(event.target.value)}
          aria-label='Sort projections'
        >
          <option value='FantasyPointsPPR'>Projected PPR points</option>
          <option value='PassingYards'>Passing yards</option>
          <option value='RushingYards'>Rushing yards</option>
          <option value='ReceivingYards'>Receiving yards</option>
          <option value='Receptions'>Receptions</option>
        </StyledSelect>
      </SelectDiv>

      {page.totalItems === 0 ? (
        <EmptyState role='status'>No projections match the current filters.</EmptyState>
      ) : (
        <>
          <CardContainer>
            {page.items.map((player, index) => (
              <Card key={player.PlayerID || `${player.Name}-${index}`}>
                <CardBody
                  onClick={() => handleClick(index)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleClick(index);
                    }
                  }}
                  role='button'
                  tabIndex={0}
                  aria-expanded={isCardFlipped === index}
                  aria-label={`Projection card for ${player.Name}`}
                >
                  {isCardFlipped === index ? (
                    <>
                      <CardHeader>
                        <NameFieldset>
                          Active: {player.Activated === 1 ? 'Active' : 'Not Active'}
                        </NameFieldset>
                      </CardHeader>
                      <NameFieldset>
                        Projected Fantasy Points: {player.FantasyPoints}
                      </NameFieldset>
                      <NameFieldset>
                        Projected PPR Points: {player.FantasyPointsPPR}
                      </NameFieldset>
                      <Description>{player.DataLabel}</Description>
                    </>
                  ) : (
                    <>
                      <CardHeader>
                        <HeaderTitle>
                          {player.Name} : {player.Position}
                        </HeaderTitle>
                      </CardHeader>
                      <Description>Team: {player.Team}</Description>
                      <Description>Projected Week: {player.Week}</Description>
                      <Description>
                        Projected PPR Points: {player.FantasyPointsPPR}
                      </Description>
                      <Description>{player.DataLabel}</Description>
                    </>
                  )}
                </CardBody>
              </Card>
            ))}
          </CardContainer>
          <PaginationWrapper>
            <Pagination
              currentPage={page.activePage}
              totalPages={page.totalPages}
              onPageChange={(_event, { activePage }) => {
                setCurrentPage(Number(activePage));
                setIsCardFlipped(-1);
              }}
            />
          </PaginationWrapper>
        </>
      )}
    </div>
  );
};

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const Loader = styled.div`
  border: 8px solid ${fleurimondColors.grey};
  border-top: 8px solid ${fleurimondColors.accent};
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 1s linear infinite;
`;

export const StyledSelect = styled.select`
  width: 100%;
  max-width: 420px;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${fleurimondColors.surfaceBorder};
  font-size: 1rem;
  box-sizing: border-box;

  &:focus-visible {
    outline: 3px solid ${fleurimondColors.accent};
    outline-offset: 2px;
  }
`;

export const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  align-items: stretch;
`;

export const LoadingDiv = styled.div`
  display: grid;
  justify-items: center;
  align-items: center;
  gap: 1rem;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));

  @media (max-width: 464px) {
    grid-template-columns: 1fr;
  }
`;

export const SearchDiv = styled.div`
  margin-bottom: 1.5rem;
  width: 100%;
`;

export const SelectDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  width: 100%;
`;

export const Card = styled.div`
  border: 1px solid ${fleurimondColors.surfaceBorder};
  border-radius: 8px;
  background: ${fleurimondColors.surface};
  overflow: hidden;
  width: min(100%, 320px);
`;

export const CardHeader = styled.div`
  background-color: ${fleurimondColors.rowAlt};
  border-bottom: 1px solid ${fleurimondColors.surfaceBorder};
  padding: 1rem;
  font-weight: bold;
`;

export const CardBody = styled.div`
  padding: 1rem;
  min-height: 220px;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${fleurimondColors.accent};
    outline-offset: -3px;
  }
`;

export const NameFieldset = styled.div`
  margin-bottom: 0.5rem;
`;

export const Description = styled.div`
  margin-bottom: 0.5rem;
  color: ${fleurimondColors.textMuted};
`;

export const HeaderTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0;
`;

const PaginationWrapper = styled.div`
  margin-top: 1.5rem;
`;

const EmptyState = styled.p`
  padding: 1rem;
`;

export default memo(WeeklyProjectionCards);
