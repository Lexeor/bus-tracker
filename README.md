# Bus Tracker - Herceg Novi

An interactive map that shows bus and ferry schedules for Herceg Novi, Montenegro. Vehicle positions are calculated from static timetables and updated in real time, so you can see approximately where a bus is right now without any GPS data from the vehicles themselves.

Live: [lexeor.github.io/bus-tracker](https://lexeor.github.io/bus-tracker)

## What it does

- Shows current positions of buses and ferries on the map based on their timetable
- Stop markers display upcoming departures with countdown timers
- Stops served by multiple routes show schedules for all of them in one popup
- Sunday schedules differ from weekday ones (Line 1 runs hourly, Line 2 does not run)
- Four routes covered: bus lines 1 and 2, ferry lines 3 and 4 (Kamenari - Lepetane crossing)
- Interface available in Montenegrin, English, Russian and German

## How positions work

There is no live GPS. Each vehicle's position is linearly interpolated between two stops based on the scheduled departure and arrival times and the actual road geometry fetched from OSRM. Positions are accurate on average but do not account for traffic, delays or early arrivals.

## Tech stack

- React 19, TypeScript, Vite
- Leaflet + react-leaflet for the map
- Tailwind CSS v4, Motion for animations
- LinguiJS for i18n
- OSRM for route geometry
- Deployed to GitHub Pages via gh-pages

## Running locally

```bash
npm install
npm run dev
```
