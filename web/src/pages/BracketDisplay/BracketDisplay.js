import { Bracket } from "react-brackets";

const RoundProps = [
    {
      title: 'Round one',
      seeds: [
        {
          id: 1,
          date: new Date().toDateString(),
          teams: [{ name: 'Team A' }, { name: 'Team B' }],
        },
        {
          id: 2,
          date: new Date().toDateString(),
          teams: [{ name: 'Team C' }, { name: 'Team D' }],
        },
      ],
    },
    {
      title: 'Round one',
      seeds: [
        {
          id: 3,
          date: new Date().toDateString(),
          teams: [{ name: 'Team A' }, { name: 'Team C' }],
        },
      ],
    },
  ];

const BracketDisplay = () => {
  return (
    <div style={{ overflowX: "auto", padding: "20px" }}>
      <h2>Single Elimination Bracket</h2>
      <Bracket rounds={RoundProps} />
    </div>
  );
};

export default BracketDisplay;
