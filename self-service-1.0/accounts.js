const accounts = new Map([
  [
    '111222',
    {
      open: true,
      frequentBuyer: true,
      name: 'John Smith',
      mostRecentOrderDate: 'March 30th 2020'
    }
  ],
  [
    '222333',
    {
      open: true,
      frequentBuyer: false,
      name: 'Jane Smith',
      mostRecentOrderDate: 'March 30th 2020'
    }
  ],
  [
    '333444',
    {
      open: false,
      frequentBuyer: true,
      name: 'Sam Smith',
      mostRecentOrderDate: 'March 30th 2020'
    }
  ]
])

module.exports = accounts
