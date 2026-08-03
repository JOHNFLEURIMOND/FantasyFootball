import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { fleurimondColors } from '../CSS/theme';
const analyticsHelpers = require('../../lib/analytics');
import {
  fetchCommandCenterView,
  getOverallCacheStatus,
} from '../api/commandCenterApi';

const { createAnalyticsTracker, bucketDuration } = analyticsHelpers;

const analytics = createAnalyticsTracker({
  sink: event => {
    if (typeof window === 'undefined') {
      return;
    }

    window.__COMMAND_CENTER_ANALYTICS__ = window.__COMMAND_CENTER_ANALYTICS__ || [];
    window.__COMMAND_CENTER_ANALYTICS__.push(event);
  },
});

function formatStatusLabel(value) {
  if (!value) {
    return 'unknown';
  }

  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());
}

function normalizeError(error) {
  if (!error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'Something went wrong.',
      retryable: false,
    };
  }

  if (error.safe) {
    return error.safe;
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'Something went wrong.',
    retryable: false,
  };
}

function CommandCenter() {
  const [usernameInput, setUsernameInput] = useState('');
  const [activeUsername, setActiveUsername] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [viewModel, setViewModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(
    'Enter a Sleeper username to load leagues for the current season.'
  );

  const loadView = useCallback(
    async ({ username, leagueId, week, trackLabel } = {}) => {
      const startedAt = Date.now();
      setLoading(true);
      setError(null);
      setStatusMessage('Loading Sleeper data...');

      try {
        const payload = await fetchCommandCenterView({
          username,
          leagueId,
          week,
        });

        setViewModel(payload);
        setStatusMessage(
          username
            ? `Loaded ${payload.leagues.length} league${payload.leagues.length === 1 ? '' : 's'} for ${payload.resolvedSeason}.`
            : `Sleeper state loaded for ${payload.resolvedSeason}.`
        );

        if (payload.resolvedWeek > 0 && week === undefined) {
          setSelectedWeek(String(payload.resolvedWeek));
        }

        if (trackLabel) {
          analytics.track(trackLabel, {
            outcome: payload.warnings.length > 0 ? 'partial' : 'success',
            resultCount: payload.leagues.length,
            selectedWeek: payload.resolvedWeek,
            cacheStatus: getOverallCacheStatus(payload.meta?.cache),
            warningCount: payload.warnings.length,
            durationBucket: bucketDuration(Date.now() - startedAt),
          });
        }

        return payload;
      } catch (caughtError) {
        const normalizedError = normalizeError(caughtError);
        setError(normalizedError);
        setStatusMessage('Unable to load the command center.');

        if (trackLabel) {
          analytics.track(trackLabel, {
            outcome: 'failure',
            errorCategory: normalizedError.code,
            durationBucket: bucketDuration(Date.now() - startedAt),
          });
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadView();
  }, [loadView]);

  const selectedLeague = useMemo(
    () => viewModel?.selectedLeague || null,
    [viewModel]
  );

  const staleResources = useMemo(() => {
    const cacheEntries = viewModel?.meta?.cache || {};
    return Object.entries(cacheEntries)
      .filter(([, meta]) => meta?.cacheStatus === 'stale')
      .map(([resourceName]) => resourceName);
  }, [viewModel]);

  const handleSubmit = useCallback(
    event => {
      event.preventDefault();
      const trimmedUsername = usernameInput.trim();

      if (!trimmedUsername) {
        setError({
          code: 'INVALID_REQUEST',
          message: 'Enter a Sleeper username before searching.',
          retryable: false,
        });
        return;
      }

      setActiveUsername(trimmedUsername);
      setSelectedLeagueId('');
      setSelectedWeek('');
      loadView({ username: trimmedUsername, trackLabel: 'username_lookup_submitted' });
    },
    [loadView, usernameInput]
  );

  const handleLeagueSelect = useCallback(
    leagueId => {
      if (!activeUsername) {
        return;
      }

      setSelectedLeagueId(leagueId);
      loadView({
        username: activeUsername,
        leagueId,
        week: selectedWeek || undefined,
        trackLabel: 'league_selected',
      });
    },
    [activeUsername, loadView, selectedWeek]
  );

  const handleWeekChange = useCallback(
    event => {
      const nextWeek = event.target.value;
      setSelectedWeek(nextWeek);

      if (!activeUsername || !selectedLeagueId) {
        return;
      }

      loadView({
        username: activeUsername,
        leagueId: selectedLeagueId,
        week: nextWeek,
        trackLabel: 'matchup_week_changed',
      });
    },
    [activeUsername, loadView, selectedLeagueId]
  );

  const weekOptions = viewModel?.availableWeeks || [];
  const rosterCount = viewModel?.rosters?.length || 0;
  const draftCount = viewModel?.drafts?.length || 0;
  const matchupCount = viewModel?.matchups?.length || 0;
  const leagueCount = viewModel?.leagues?.length || 0;

  return (
    <PageShell>
      <HeroPanel>
        <Eyebrow>Fantasy Football Command Center</Eyebrow>
        <HeroTitle>Sleepers’ current season, normalized for fast league review.</HeroTitle>
        <HeroText>
          Search a Sleeper username, pick a league, and inspect rosters, drafts,
          and matchups without exposing provider payloads to the browser.
        </HeroText>
        <HeroMeta>
          <MetaPill>Season {viewModel?.resolvedSeason || '...'}</MetaPill>
          <MetaPill>Week {viewModel?.resolvedWeek ?? 0}</MetaPill>
          <MetaPill>Cache {viewModel ? getOverallCacheStatus(viewModel.meta?.cache) : 'miss'}</MetaPill>
        </HeroMeta>
      </HeroPanel>

      <ContentGrid>
        <PrimaryColumn>
          <Panel>
            <PanelHeader>
              <PanelTitle>Lookup</PanelTitle>
              <PanelSubtitle>Enter a Sleeper username to load leagues for the active NFL season.</PanelSubtitle>
            </PanelHeader>

            <Form onSubmit={handleSubmit}>
              <Field>
                <Label htmlFor='sleeper-username'>Sleeper username</Label>
                <TextInput
                  id='sleeper-username'
                  value={usernameInput}
                  onChange={event => setUsernameInput(event.target.value)}
                  placeholder='Enter username'
                  autoComplete='off'
                  spellCheck='false'
                  aria-describedby='lookup-help'
                />
              </Field>
              <HelpText id='lookup-help'>No credentials are required. The command center only calls Sleeper server-side.</HelpText>
              <ActionRow>
                <PrimaryButton type='submit' disabled={loading || !usernameInput.trim()}>
                  {loading ? 'Loading...' : 'Load leagues'}
                </PrimaryButton>
                <SecondaryButton
                  type='button'
                  onClick={() => {
                    setUsernameInput('');
                    setActiveUsername('');
                    setSelectedLeagueId('');
                    setSelectedWeek('');
                    setViewModel(null);
                    setError(null);
                    setStatusMessage('Enter a Sleeper username to load leagues for the current season.');
                    loadView();
                  }}
                >
                  Reset
                </SecondaryButton>
              </ActionRow>
            </Form>

            <StatusBar role='status' aria-live='polite'>
              {statusMessage}
            </StatusBar>
            {error && (
              <ErrorBanner role='alert'>
                <strong>{error.code}:</strong> {error.message}
              </ErrorBanner>
            )}
            {staleResources.length > 0 && (
              <WarningBanner role='status' aria-live='polite'>
                Stale data was served for {staleResources.join(', ')}.
              </WarningBanner>
            )}
          </Panel>

          <Panel>
            <PanelHeader>
              <PanelTitle>NFL State</PanelTitle>
              <PanelSubtitle>Resolved from Sleeper’s current state endpoint.</PanelSubtitle>
            </PanelHeader>
            <DefinitionList>
              <DefinitionItem>
                <DefinitionTerm>Season</DefinitionTerm>
                <DefinitionValue>{viewModel?.nflState?.season || 'Loading...'}</DefinitionValue>
              </DefinitionItem>
              <DefinitionItem>
                <DefinitionTerm>Season type</DefinitionTerm>
                <DefinitionValue>{formatStatusLabel(viewModel?.nflState?.seasonType)}</DefinitionValue>
              </DefinitionItem>
              <DefinitionItem>
                <DefinitionTerm>Display week</DefinitionTerm>
                <DefinitionValue>{viewModel?.nflState?.displayWeek ?? 0}</DefinitionValue>
              </DefinitionItem>
              <DefinitionItem>
                <DefinitionTerm>Current week</DefinitionTerm>
                <DefinitionValue>{viewModel?.nflState?.currentWeek ?? 0}</DefinitionValue>
              </DefinitionItem>
            </DefinitionList>
          </Panel>
        </PrimaryColumn>

        <SecondaryColumn>
          <Panel>
            <PanelHeader>
              <PanelTitle>Leagues</PanelTitle>
              <PanelSubtitle>
                {activeUsername
                  ? `Showing ${leagueCount} league${leagueCount === 1 ? '' : 's'} for ${activeUsername}.`
                  : 'No username loaded yet.'}
              </PanelSubtitle>
            </PanelHeader>

            {leagueCount > 0 ? (
              <LeagueList>
                {viewModel.leagues.map(league => (
                  <LeagueButton
                    key={league.leagueId}
                    type='button'
                    $active={selectedLeagueId === league.leagueId}
                    onClick={() => handleLeagueSelect(league.leagueId)}
                    aria-pressed={selectedLeagueId === league.leagueId}
                  >
                    <LeagueName>{league.name}</LeagueName>
                    <LeagueMeta>{league.seasonType} • {league.status}</LeagueMeta>
                    <LeagueMeta>{league.totalRosters} rosters</LeagueMeta>
                  </LeagueButton>
                ))}
              </LeagueList>
            ) : (
              <EmptyState>
                {activeUsername
                  ? 'No leagues were returned for the resolved season.'
                  : 'Load a username to see available leagues.'}
              </EmptyState>
            )}
          </Panel>

          <Panel>
            <PanelHeader>
              <PanelTitle>Selected League</PanelTitle>
              <PanelSubtitle>
                {selectedLeague
                  ? `${selectedLeague.name} • ${selectedLeague.season}`
                  : 'Select a league to inspect normalized league data.'}
              </PanelSubtitle>
            </PanelHeader>

            {selectedLeague ? (
              <>
                <DefinitionList>
                  <DefinitionItem>
                    <DefinitionTerm>Status</DefinitionTerm>
                    <DefinitionValue>{formatStatusLabel(selectedLeague.status)}</DefinitionValue>
                  </DefinitionItem>
                  <DefinitionItem>
                    <DefinitionTerm>Rosters</DefinitionTerm>
                    <DefinitionValue>{selectedLeague.totalRosters}</DefinitionValue>
                  </DefinitionItem>
                  <DefinitionItem>
                    <DefinitionTerm>Draft</DefinitionTerm>
                    <DefinitionValue>{selectedLeague.draftId || 'No draft id'}</DefinitionValue>
                  </DefinitionItem>
                </DefinitionList>

                <WeekRow>
                  <WeekLabel htmlFor='matchup-week'>Matchup week</WeekLabel>
                  <WeekSelect
                    id='matchup-week'
                    value={selectedWeek}
                    onChange={handleWeekChange}
                    disabled={weekOptions.length === 0}
                  >
                    <option value=''>No matchup weeks available</option>
                    {weekOptions.map(weekNumber => (
                      <option key={weekNumber} value={weekNumber}>
                        Week {weekNumber}
                      </option>
                    ))}
                  </WeekSelect>
                </WeekRow>

                {weekOptions.length === 0 && (
                  <EmptyState>
                    Sleeper currently reports a week zero or offseason state, so no matchup weeks are available yet.
                  </EmptyState>
                )}

                <SectionBlock>
                  <SectionTitle>Rosters</SectionTitle>
                  {rosterCount > 0 ? (
                    <CardGrid>
                      {viewModel.rosters.map(roster => (
                        <MiniCard key={roster.rosterId}>
                          <MiniCardTitle>Roster {roster.rosterId}</MiniCardTitle>
                          <MiniCardText>{roster.ownerTeamName || roster.ownerDisplayName || 'Unassigned roster'}</MiniCardText>
                          <MiniCardText>{roster.wins}-{roster.losses}-{roster.ties}</MiniCardText>
                          <MiniCardText>{roster.players.length} players</MiniCardText>
                        </MiniCard>
                      ))}
                    </CardGrid>
                  ) : (
                    <EmptyState>No roster data returned for this league.</EmptyState>
                  )}
                </SectionBlock>

                <SectionBlock>
                  <SectionTitle>Drafts</SectionTitle>
                  {draftCount > 0 ? (
                    <CardGrid>
                      {viewModel.drafts.map(draft => (
                        <MiniCard key={draft.draftId}>
                          <MiniCardTitle>Draft {draft.draftId}</MiniCardTitle>
                          <MiniCardText>{formatStatusLabel(draft.status)}</MiniCardText>
                          <MiniCardText>{draft.seasonType} • {draft.season}</MiniCardText>
                        </MiniCard>
                      ))}
                    </CardGrid>
                  ) : (
                    <EmptyState>No drafts were returned for this league.</EmptyState>
                  )}
                </SectionBlock>

                <SectionBlock>
                  <SectionTitle>Matchups</SectionTitle>
                  {matchupCount > 0 ? (
                    <CardGrid>
                      {viewModel.matchups.map(matchup => (
                        <MiniCard key={`${matchup.matchupId}-${matchup.rosterId}`}>
                          <MiniCardTitle>Roster {matchup.rosterId}</MiniCardTitle>
                          <MiniCardText>Matchup {matchup.matchupId}</MiniCardText>
                          <MiniCardText>Points {matchup.points ?? 0}</MiniCardText>
                          <MiniCardText>Bench {matchup.bench.length}</MiniCardText>
                        </MiniCard>
                      ))}
                    </CardGrid>
                  ) : (
                    <EmptyState>
                      {selectedLeague && selectedWeek
                        ? 'No matchups were returned for the selected week.'
                        : 'Select a valid week to load matchup data.'}
                    </EmptyState>
                  )}
                </SectionBlock>
              </>
            ) : (
              <EmptyState>Select a league to review rosters, drafts, and matchups.</EmptyState>
            )}
          </Panel>
        </SecondaryColumn>
      </ContentGrid>
    </PageShell>
  );
}

const PageShell = styled.main`
  width: min(1280px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 7rem 0 4rem;
  color: ${fleurimondColors.white};
`;

const HeroPanel = styled.section`
  background: linear-gradient(135deg, ${fleurimondColors.midnight} 0%, ${fleurimondColors.deepCerulean} 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.25rem;
  padding: 2rem;
  box-shadow: 0 24px 64px rgba(1, 0, 46, 0.35);
  margin-bottom: 1.5rem;
`;

const Eyebrow = styled.p`
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${fleurimondColors.sassySaffron};
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2rem, 4vw, 3.6rem);
  line-height: 1.04;
  margin: 0 0 1rem;
`;

const HeroText = styled.p`
  max-width: 68ch;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.6;
`;

const HeroMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const MetaPill = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.45rem 0.85rem;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.95rem;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 340px) minmax(0, 1fr);
  gap: 1.5rem;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const PrimaryColumn = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const SecondaryColumn = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const Panel = styled.section`
  background: ${fleurimondColors.white};
  color: ${fleurimondColors.midnight};
  border-radius: 1.2rem;
  padding: 1.5rem;
  box-shadow: 0 18px 45px rgba(1, 0, 46, 0.15);
`;

const PanelHeader = styled.header`
  margin-bottom: 1rem;
`;

const PanelTitle = styled.h2`
  font-size: 1.35rem;
  margin-bottom: 0.4rem;
`;

const PanelSubtitle = styled.p`
  color: ${fleurimondColors.smoke};
  line-height: 1.5;
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
`;

const Field = styled.label`
  display: grid;
  gap: 0.55rem;
`;

const Label = styled.span`
  font-weight: 700;
`;

const TextInput = styled.input`
  width: 100%;
  border: 1px solid ${fleurimondColors.lightSmoke};
  border-radius: 0.85rem;
  padding: 0.9rem 1rem;
  font-size: 1rem;
  background: ${fleurimondColors.foam};
  color: ${fleurimondColors.midnight};

  &:focus {
    outline: 3px solid rgba(0, 179, 230, 0.22);
    border-color: ${fleurimondColors.cerulean};
  }
`;

const HelpText = styled.p`
  color: ${fleurimondColors.smoke};
  line-height: 1.5;
  margin-top: -0.4rem;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const ButtonBase = styled.button`
  border: 0;
  border-radius: 999px;
  padding: 0.85rem 1.25rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    opacity 0.2s ease,
    background-color 0.2s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  &:not(:disabled):hover {
    transform: translateY(-1px);
  }
`;

const PrimaryButton = styled(ButtonBase)`
  color: ${fleurimondColors.white};
  background: ${fleurimondColors.midnight};
`;

const SecondaryButton = styled(ButtonBase)`
  color: ${fleurimondColors.midnight};
  background: ${fleurimondColors.lightSmoke};
`;

const StatusBar = styled.p`
  margin-top: 1rem;
  line-height: 1.5;
`;

const ErrorBanner = styled.div`
  margin-top: 1rem;
  border-radius: 0.9rem;
  padding: 0.9rem 1rem;
  background: rgba(235, 55, 69, 0.12);
  color: ${fleurimondColors.midnight};
  border: 1px solid rgba(235, 55, 69, 0.3);
`;

const WarningBanner = styled.div`
  margin-top: 0.75rem;
  border-radius: 0.9rem;
  padding: 0.9rem 1rem;
  background: rgba(251, 182, 39, 0.16);
  color: ${fleurimondColors.midnight};
  border: 1px solid rgba(251, 182, 39, 0.3);
`;

const DefinitionList = styled.dl`
  display: grid;
  gap: 0.75rem;
`;

const DefinitionItem = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0.75rem;
  align-items: start;
`;

const DefinitionTerm = styled.dt`
  color: ${fleurimondColors.smoke};
  font-weight: 700;
`;

const DefinitionValue = styled.dd`
  margin: 0;
  color: ${fleurimondColors.midnight};
`;

const LeagueList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const LeagueButton = styled.button`
  border-radius: 1rem;
  border: 1px solid ${props => (props.$active ? fleurimondColors.cerulean : fleurimondColors.lightSmoke)};
  background: ${props => (props.$active ? 'rgba(0, 179, 230, 0.08)' : fleurimondColors.foam)};
  padding: 1rem;
  text-align: left;
  cursor: pointer;
  color: ${fleurimondColors.midnight};
`;

const LeagueName = styled.p`
  font-weight: 800;
  margin-bottom: 0.35rem;
`;

const LeagueMeta = styled.p`
  color: ${fleurimondColors.smoke};
  line-height: 1.45;
`;

const EmptyState = styled.p`
  color: ${fleurimondColors.smoke};
  line-height: 1.6;
  background: ${fleurimondColors.foam};
  border: 1px dashed ${fleurimondColors.lightSmoke};
  border-radius: 1rem;
  padding: 1rem;
`;

const WeekRow = styled.div`
  display: grid;
  gap: 0.6rem;
  margin: 1rem 0;
`;

const WeekLabel = styled.label`
  font-weight: 700;
`;

const WeekSelect = styled.select`
  width: 100%;
  border: 1px solid ${fleurimondColors.lightSmoke};
  border-radius: 0.85rem;
  padding: 0.9rem 1rem;
  font-size: 1rem;
  background: ${fleurimondColors.foam};
  color: ${fleurimondColors.midnight};
`;

const SectionBlock = styled.section`
  margin-top: 1.25rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.05rem;
  margin-bottom: 0.85rem;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
`;

const MiniCard = styled.article`
  border-radius: 1rem;
  border: 1px solid ${fleurimondColors.lightSmoke};
  background: ${fleurimondColors.foam};
  padding: 1rem;
`;

const MiniCardTitle = styled.h4`
  font-size: 1rem;
  margin-bottom: 0.45rem;
`;

const MiniCardText = styled.p`
  color: ${fleurimondColors.smoke};
  line-height: 1.5;
`;

export default CommandCenter;