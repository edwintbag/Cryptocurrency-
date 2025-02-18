document.addEventListener('DOMContentLoaded', () => {
      const converterForm = document.getElementById('converterForm');
      const resultDiv = document.getElementById('result');
      const ctx = document.getElementById('historicalChart').getContext('2d');
      let chartInstance; // To hold our Chart.js instance

      // Function to fetch real-time exchange rate from CoinGecko
      async function fetchExchangeRate(from, to) {
        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${from}&vs_currencies=${to}`
          );
          const data = await response.json();
          return data[from][to];
        } catch (error) {
          console.error('Error fetching exchange rate:', error);
          return null;
        }
      }

      // Function to fetch historical price data (in USD) for the selected coin
      async function fetchHistoricalData(coin) {
        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=7`
          );
          const data = await response.json();
          // data.prices is an array of [timestamp, price]
          const labels = data.prices.map((item) => {
            const date = new Date(item[0]);
            return date.toLocaleDateString();
          });
          const prices = data.prices.map((item) => item[1]);
          return { labels, prices };
        } catch (error) {
          console.error('Error fetching historical data:', error);
          return null;
        }
      }

      // Function to handle the conversion and update the chart
      async function updateConversion(event) {
        event.preventDefault();
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;
        const amount = parseFloat(document.getElementById('amount').value);

        // Fetch the current exchange rate
        const rate = await fetchExchangeRate(fromCurrency, toCurrency);
        if (rate) {
          const convertedAmount = (amount * rate).toFixed(4);
          resultDiv.innerHTML = `<h3>${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}</h3>`;
        } else {
          resultDiv.innerHTML =
            '<p class="text-danger">Error fetching conversion rate. Please try again.</p>';
        }

        // Update the historical chart for the "from" currency (in USD)
        const historicalData = await fetchHistoricalData(fromCurrency);
        if (historicalData) {
          if (chartInstance) {
            chartInstance.destroy();
          }
          chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
              labels: historicalData.labels,
              datasets: [
                {
                  label: `${fromCurrency} Price (USD)`,
                  data: historicalData.prices,
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 2,
                  tension: 0.3,
                },
              ],
            },
            options: {
              scales: {
                y: {
                  beginAtZero: false,
                },
              },
            },
          });
        }
      }

      // Listen for form submissions
      converterForm.addEventListener('submit', updateConversion);

      // Trigger an initial conversion on page load
      updateConversion(new Event('submit'));
    });