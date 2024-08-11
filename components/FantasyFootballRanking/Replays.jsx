// // components/FantasyFootballRanking/Replays.jsx
// import React, { useContext } from 'react';
// import styled from 'styled-components';
// import { ReplaysContext } from '../context'; // Adjust import path if needed

// // Define styled-components for responsive design
// const Container = styled.div`
//   padding: 20px;
//   font-family: Arial, sans-serif;
//   display: flex;
//   flex-direction: column;
//   gap: 20px;

//   @media (max-width: 768px) {
//     padding: 10px;
//   }
// `;

// const Section = styled.div`
//   margin-bottom: 20px;
// `;

// const Title = styled.h2`
//   font-size: 24px;
//   margin-bottom: 10px;

//   @media (max-width: 768px) {
//     font-size: 20px;
//   }
// `;

// const List = styled.ul`
//   list-style-type: none;
//   padding: 0;
// `;

// const ListItem = styled.li`
//   margin-bottom: 10px;

//   @media (max-width: 768px) {
//     font-size: 14px;
//   }
// `;

// // Replays component
// const Replays = () => {
//   const { data, loading, error } = useContext(ReplaysContext);

//   const renderList = (title, dataKey) => {
//     const listData = data[dataKey] || [];
//     const isLoading = loading;
//     const isError = error;

//     if (isLoading) return <p>Loading {title}...</p>;
//     if (isError) return <p>Error loading {title}.</p>;

//     return (
//       <Section>
//         <Title>{title}</Title>
//         <List>
//           {listData.length ? (
//             listData.map((item, index) => (
//               <ListItem key={index}>{JSON.stringify(item)}</ListItem>
//             ))
//           ) : (
//             <ListItem>No data available</ListItem>
//           )}
//         </List>
//       </Section>
//     );
//   };

//   return (
//     <Container>
//       {Object.keys(data).map(key =>
//         renderList(
//           key
//             .replace(/([A-Z])/g, ' $1')
//             .replace(/^./, str => str.toUpperCase()),
//           key
//         )
//       )}
//     </Container>
//   );
// };

// export default Replays;
