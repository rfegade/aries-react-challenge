import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { Container } from "react-bootstrap";

const optionData = [
  {
    strike_price: 100,
    type: "Call",
    bid: 10.05,
    ask: 12.04,
    long_short: "long",
    expiration_date: "2025-12-17T00:00:00Z",
  },
  {
    strike_price: 102.5,
    type: "Call",
    bid: 12.1,
    ask: 14,
    long_short: "long",
    expiration_date: "2025-12-17T00:00:00Z",
  },
  {
    strike_price: 103,
    type: "Put",
    bid: 14,
    ask: 15.5,
    long_short: "short",
    expiration_date: "2025-12-17T00:00:00Z",
  },
  {
    strike_price: 105,
    type: "Put",
    bid: 16,
    ask: 18,
    long_short: "long",
    expiration_date: "2025-12-17T00:00:00Z",
  },
];

//Initialize options data and calculate Premium cost
const initialOptionData = (data) => ({
  type: data.type.toLowerCase(),
  strike: data.strike_price,
  premium: (data.bid + data.ask) / 2, // Calculate premium as the average of bid and ask prices
  long_short: data.long_short,
});

const CodingChallenge = () => {
  const [options, setOptions] = useState(optionData.map(initialOptionData));
  const [showForm, setShowForm] = useState(false);
  const [maxProfit, setMaxProfit] = useState(0);
  const [maxLoss, setMaxLoss] = useState(0);
  const [breakEvenPoints, setBreakEvenPoints] = useState([]);

  // Handle changes in Options input field
  const handleOptionChange = (index, field, value) => {
    const newOptions = options.map((option, i) =>
      i === index ? { ...option, [field]: value } : option
    );
    setOptions(newOptions);
  };

  // Remove current option item from the list. (_ is a placeholder)
  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  // Calculate profit and loss for given options and price
  const calculateProfitLoss = (options, price) => {
    return options.reduce((acc, option) => {
      const { type, strike, premium, long_short } = option;
      let profitLoss = 0;

      if (type === "call") {
        profitLoss = Math.max(0, price - strike) - premium;
      } else {
        profitLoss = Math.max(0, strike - price) - premium;
      }

      // Adjust profit and loss for short positions
      if (long_short === "short") {
        profitLoss = -profitLoss;
      }
      return acc + profitLoss; // Accumulate the profit and loss values
    }, 0);
  };

  // Calculate max profit, max loss, and break-even points by iterating through possible prices.
  const calculateMetrics = (options) => {
    let maxProfit = -Infinity;
    let maxLoss = Infinity;
    const breakEvenPoints = new Set();

    for (let price = 0; price <= 150; price += 1) {
      const profitLoss = calculateProfitLoss(options, price);
      if (profitLoss > maxProfit) maxProfit = profitLoss;
      if (profitLoss < maxLoss) maxLoss = profitLoss;

      // identify breakeven points
      if (Math.abs(profitLoss) < 1) {
        breakEvenPoints.add(price);
      }
    }

    setMaxProfit(maxProfit);
    setMaxLoss(maxLoss);
    setBreakEvenPoints([...breakEvenPoints]);
  };

  // Recalculate metrics whenever the options state changes.
  useEffect(() => {
    calculateMetrics(options);
  }, [options]);

  // Generate data for the profit/loss graph
  const generateGraphData = (options) => {
    const prices = [];
    const profitAndLoss = [];

    for (let price = 0; price <= 150; price += 1) {
      prices.push(price);
      profitAndLoss.push(calculateProfitLoss(options, price));
    }

    return {
      labels: prices,
      datasets: [
        {
          label: "Profit/Loss",
          data: profitAndLoss,
          borderColor: "rgba(75,192,192,1)",
          fill: false,
        },
      ],
    };
  };

  // Function to generate chart options with axis labels
  const chartOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const value = context.dataset.data[index];
            return `Price: ${context.label}, P/L: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Price of underlying at expiry", // X-axis label
        },
      },
      y: {
        title: {
          display: true,
          text: "Profit/Loss", // Y-axis label
        },
      },
    },
  };

  return (
    <Container>
      <h1 className="my-4">Options Profit Calculator</h1>
      <div className="options-form">
        {options.map((option, index) => (
          <div key={index} className="option-row">
            <select
              value={option.type}
              onChange={(e) =>
                handleOptionChange(index, "type", e.target.value)
              }
            >
              <option value="call">Call</option>
              <option value="put">Put</option>
            </select>
            <input
              type="number"
              value={option.strike}
              onChange={(e) =>
                handleOptionChange(index, "strike", parseFloat(e.target.value))
              }
              placeholder="Strike"
            />
            <input
              type="number"
              value={option.premium}
              onChange={(e) =>
                handleOptionChange(index, "premium", parseFloat(e.target.value))
              }
              placeholder="Premium"
            />
            <select
              value={option.long_short}
              onChange={(e) =>
                handleOptionChange(index, "long_short", e.target.value)
              }
            >
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
            <button type="button" onClick={() => removeOption(index)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cards-container col-lg-8 mx-auto">
        <div className="card">
          <h3>Max Profit</h3>
          <p>{maxProfit}</p>
        </div>
        <div className="card">
          <h3>Max Loss</h3>
          <p>{maxLoss}</p>
        </div>
        <div className="card">
          <h3>Break Even Points</h3>
          <p>{breakEvenPoints.join(", ")}</p>
        </div>
      </div>

      <Line data={generateGraphData(options)} options={chartOptions} />
    </Container>
  );
};

export default CodingChallenge;
