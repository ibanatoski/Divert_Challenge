# Divert_Challenge
Data-viz challenge for Divert

---
## Instructions
To run the application simply follow these steps...

### Clone the Repo
```
git clone https://github.com/ibanatoski/Divert_Challenge.git
cd Divert_Challenge
```
### Install the necessary packages
```
npm install
npm build
npm start
```
---


## Data import
The provided datasets describe retail store operational data. Build a database that includes a single interface (table or view) that summarizes information across stores.

1. Information should be summarized by a performance score, which is calculated as [total cardboard lbs recycled] divided by [sales].
2. [Total cardboard lbs recycled] for any store is the sum of cardboard bale weights for that store.
3. Assume that the start/end dates of the sales data matches those of the cardboard data.
4. Assume that each store's sales were uniform throughout the period of the given dataset.


## Analysis tool
Build a web-based tool to visualize the imported data.

1. Allow the user to set custom start/end dates within the full time period.
2. Include a table that allows the user to sort stores ordered by cardboard recycled, sales, or performance.
3. Include charts/graphics that demonstrate the performance of stores compared to each other.
4. Displays should update when the user changes the start/end dates (either automatically or on a button or refresh).

## UI tool
  - line graph that changes with dates selected
    - each line represents a store
    - x - date
    - y - total_weight
  - bar chart
    - each bar is a day


## Presentation
The final part of this project is to present your product to us for a walk-through of your UI and code, and a discussion of your methods.
For that presentation, please prepare your code in a readable format, share your UI, and be prepared to walk through your work process.


## Notes
- Assume your tool's audience is in the corporate waste and recycling management industry.
- Platform choices are flexible, but be prepared to discuss your decisions.
- You are encouraged to ask clarification questions as needed. For minor issues, it's fine to make an assumption and run with it --- just state that you've done so.
