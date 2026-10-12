# Serious Game – Competitive 1v1 Learning Game

This project is a competitive 1v1 serious game developed as part of a bachelor thesis.

Two players join the same private game session from their mobile devices and complete the same tasks in real time. The game is designed to combine learning, reaction speed, and competition in a synchronized multiplayer environment.

The game contains three main phases:

- Math
- Geography
- Stroop

Each phase contains 10 tasks, for a total of 30 tasks per match.

Both players receive the same tasks at the same time. The backend controls the active task, timing, answer validation, scoring, and game progression to keep the match fair and synchronized.

Each task has a maximum response time of 5 seconds.

The scoring system rewards both correctness and speed:

- Fastest correct answer: +10 points
- Other correct answer: +5 points
- Wrong answer: -2 points
- Timeout or no answer: 0 points

After all 30 tasks are completed, the final scores are compared and the winner or a draw is shown.

The project also aims to collect gameplay data such as correctness, response time, fastest answers, and timeouts in order to analyze player performance over repeated sessions.

## Technology

The application is built with:

- React Native and Expo
- TypeScript
- Node.js and Express
- Socket.IO
- PostgreSQL
- Prisma

The mobile application is designed for Android devices.
