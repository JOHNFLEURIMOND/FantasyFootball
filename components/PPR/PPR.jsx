// src/components/PPR/PPR.jsx
import React, { useContext, useState } from 'react';
import Nav from '../Navbar/Nav.jsx';
import Footer from '../Footer/Footer.jsx';
import MainHero from '../MainHero/MainHero.jsx';
import Pagination from '../Pagination/Pagination';
import PlayerCards from './PlayerCards';
import { Title } from './index';
import { StatsContext } from '../context';
import { Form, Radio, Input, Dropdown, Header } from 'semantic-ui-react'; // Import Dropdown

export default function PPR() {
  const {
    stats,
    loading,
    currentStats,
    totalPages,
    currentPage,
    setCurrentPage,
  } = useContext(StatsContext);

  // State for search and filters
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [sortOption, setSortOption] = useState('');

  // Determine the sorting options based on the position filter
  let statsSort = null;
  if (positionFilter === 'QB') {
    statsSort = (
      <Form>
        <Form.Field>
          <Radio
            label='Passing Attempts'
            key='1'
            name='radioGroup'
            value='PassingAttempts'
            onChange={() => setSortOption('PassingAttempts')}
            checked={sortOption === 'PassingAttempts'}
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label='Passing Yards'
            key='2'
            name='radioGroup'
            value='PassingYards'
            onChange={() => setSortOption('PassingYards')}
            checked={sortOption === 'PassingYards'}
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label='Passing Touchdowns'
            key='3'
            name='radioGroup'
            value='PassingTouchdowns'
            onChange={() => setSortOption('PassingTouchdowns')}
            checked={sortOption === 'PassingTouchdowns'}
          />
        </Form.Field>
      </Form>
    );
  } else if (positionFilter === 'RB') {
    statsSort = (
      <Form>
        <Form.Field>
          <Radio
            label='Rushing Attempts'
            key='4'
            name='radioGroup'
            value='RushingAttempts'
            onChange={() => setSortOption('RushingAttempts')}
            checked={sortOption === 'RushingAttempts'}
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label='Rushing Yards'
            key='5'
            name='radioGroup'
            value='RushingYards'
            onChange={() => setSortOption('RushingYards')}
            checked={sortOption === 'RushingYards'}
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label='Rushing Touchdowns'
            key='6'
            name='radioGroup'
            value='RushingTouchdowns'
            onChange={() => setSortOption('RushingTouchdowns')}
            checked={sortOption === 'RushingTouchdowns'}
          />
        </Form.Field>
      </Form>
    );
  } else if (positionFilter === 'WR' || positionFilter === 'TE') {
    statsSort = (
      <Form>
        <Form.Field>
          <Radio
            label='Receiving Attempts'
            key='7'
            name='radioGroup'
            value='Receptions'
            onChange={() => setSortOption('Receptions')}
            checked={sortOption === 'Receptions'}
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label='Receiving Yards'
            key='8'
            name='radioGroup'
            value='ReceivingYards'
            onChange={() => setSortOption('ReceivingYards')}
            checked={sortOption === 'ReceivingYards'}
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label='Receiving Touchdowns'
            key='9'
            name='radioGroup'
            value='ReceivingTouchdowns'
            onChange={() => setSortOption('ReceivingTouchdowns')}
            checked={sortOption === 'ReceivingTouchdowns'}
          />
        </Form.Field>
      </Form>
    );
  }

  // Filter and sort the stats based on user input
  const filteredStats = stats
    .filter(value => {
      if (search === '') return true;
      return value.Name.toLowerCase().includes(search.toLowerCase());
    })
    .filter(value => {
      if (positionFilter === '') return true;
      return value.Position.includes(positionFilter);
    })
    .sort((a, b) => {
      if (sortOption === '') return 0; // No sorting if no option selected
      if (sortOption in a && sortOption in b) {
        return b[sortOption] - a[sortOption];
      }
      return 0;
    });

  return (
    <>
      <Nav />
      <MainHero />
      <Title>Player Points Projection</Title>
      <div className='SearchBar'>
        <div className='SearchDiv'>
          <Header>Search Players</Header>
          <Input
            type='text'
            label='NFL'
            loading={loading}
            placeholder='Search For Players'
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className='SelectDiv'>
          <Dropdown
            placeholder='Filter By Position'
            selection
            onChange={(e, { value }) => setPositionFilter(value)}
            options={[
              { key: '', text: 'Filter By Position', value: '' },
              { key: 'QB', text: 'Filter QB', value: 'QB' },
              { key: 'RB', text: 'Filter RB', value: 'RB' },
              { key: 'WR', text: 'Filter WR', value: 'WR' },
              { key: 'TE', text: 'Filter TE', value: 'TE' },
            ]}
          />
          <div>{statsSort}</div>
        </div>
      </div>
      <PlayerCards stats={filteredStats} loading={loading} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
      <Footer />
    </>
  );
}
