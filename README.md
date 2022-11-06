# Demo DAML application: Proof of Work

## Summary

Users can publish work requests to which other users can respond. Publisher can view all the submissions, accept (and pay) or reject responses. Users can only see their own submissions or responses to their requests. Payment is done on response acceptance but also requires the payee to approve payment.


## Pre-requisites

You need to have [Git], [Node.js] and [Daml] installed.

[Git]: https://github.com/git-guides/install-git
[Node.js]: https://nodejs.dev
[Daml]: https://docs.daml.com

## How to run

*Instructions for MacOS, other operating systems may require additional steps*

- Get the code. Execute the following in Terminal window

```
git clone https://r3stl355/
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

Usernames `alice`, `bob` and `charlie` are created by default, with each given 10 coins to use. This is a demo application so login only requires a username (all lower case) and no password

Switch between those users to test various scenarios, e.g. create a request as `alice`, respond to it as `bob`, etc.