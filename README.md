# Demo DAML application: Proof of Work

## Summary

This application allows the users to publish work requests, to which other users can respond, potentially multiple times. Work request publisher can review the responses and reject or accept them. Publisher can also close the request preventing any subsequent responses from being submitted. User who sumbmitted the response will be paid if their response is accepted, but not if it was rejected. Response creator can also cancel the response. Some additional rules:

- Every request needs a non-zero reward. Request publisher must have suffient amount of coin at the time of creating a request to cover the reward.
- Every user can see all the non-closed requests raised by any other user, and respond to them as many times as they want.
- User cannot respond to their own requests.
- User can see only their own responses, and non-cancelled responses to their requests.
- When the publisher accepts the response, the coin amount equivalent to a reward of the request is transferred to the responder, but the responder should accept the trasfer before those coins appear in their wallet.

## Pre-requisites

You need to have [Git], [Node.js] and [Daml] installed.

[Git]: https://github.com/git-guides/install-git
[Node.js]: https://nodejs.dev
[Daml]: https://docs.daml.com

## How to run

*Instructions for MacOS, other operating systems may require additional steps*

- Get the code. Execute the following in Terminal window

```
git clone https://github.com/r3stl355/proof-of-work.git
cd proof-of-work
```

- Start the ledger

```
daml start
```

This will build you Daml code, generate Javascript objects and start the backend services.

- Open a second terminal window in the same directory and run the following

```
cd ui
npm install
npm start
```

This starts a server on `http://localhost:3000` serving the application UI.

Users `alice`, `bob` and `charlie` are created by default, with each given 10 coins to use. This is a demo application so login only requires a username (use one of those pre-created user names, all lower case) and no password.

Switch between those users to test various scenarios, e.g. create a request as `alice`, respond to it as `bob`, etc.